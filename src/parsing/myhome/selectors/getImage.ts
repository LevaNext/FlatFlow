import type { SelectorResult } from "@/types/parser";
import { failure, success } from "@/types/parser";
import { createParserError, ParserErrorCode } from "../errors";
import { getAttribute, queryAll } from "./dom";

/** Gallery/swiper first, then generic gallery selectors */
const MAIN_IMAGE_SELECTORS = [
  ".swiper-zoom-container img",
  ".swiper-slide img",
  ".gallery-slider img",
  ".detail-gallery img",
  ".photo-gallery img",
  "[data-gallery] img",
  ".detail-content img",
];

function isValidImageSrc(src: string): boolean {
  return (
    src.length > 10 &&
    !src.startsWith("data:") &&
    (src.startsWith("http") || src.startsWith("//"))
  );
}

/** Prefer full-size image URL (skip thumbnails). */
function isFullSizeImage(src: string): boolean {
  return !src.includes("_thumb");
}

/**
 * Extracts main listing image URL from the document. Prefers gallery full-size image. Parsing only.
 */
export function getImage(doc: Document): SelectorResult<string> {
  for (const selector of MAIN_IMAGE_SELECTORS) {
    const elements = queryAll(doc, selector);
    let fallback: string | null = null;
    for (const el of elements) {
      const src = getAttribute(el, "src");
      if (!src || !isValidImageSrc(src)) continue;
      if (isFullSizeImage(src)) return success(src);
      if (!fallback) fallback = src;
    }
    if (fallback) return success(fallback);
  }

  const imgs = queryAll(doc, "img");
  let fallback: string | null = null;
  for (const img of imgs) {
    const src = getAttribute(img, "src");
    if (!src || !isValidImageSrc(src)) continue;
    if (isFullSizeImage(src)) return success(src);
    if (!fallback) fallback = src;
  }
  if (fallback) return success(fallback);

  const ogImage = doc.querySelector('meta[property="og:image"]');
  const ogSrc = ogImage?.getAttribute("content")?.trim();
  if (ogSrc && isValidImageSrc(ogSrc)) return success(ogSrc);

  const err = createParserError(
    ParserErrorCode.IMAGE_NOT_FOUND,
    "No valid listing image URL could be found.",
  );
  return failure(err.code, err.message);
}

/** Prefer full-size URL when possible (myhome thumb pattern: replace or remove _thumb). */
function toFullSizeUrl(url: string): string {
  if (isFullSizeImage(url)) return url;
  return url.replace(/_thumb(?=[^/]*$)/i, "").replace(/\/thumbs?\//i, "/");
}

/** Get image URL from element: src, then data-src (lazy), then data-lazy-src. */
function getImageUrl(el: Element): string | null {
  const src =
    getAttribute(el, "src") ||
    getAttribute(el, "data-src") ||
    getAttribute(el, "data-lazy-src");
  if (!src || !isValidImageSrc(src)) return null;
  return toFullSizeUrl(src);
}

/** Collects all gallery image URLs (order preserved). Uses src and data-src for lazy-loaded images. */
export function getImages(doc: Document): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const selector of MAIN_IMAGE_SELECTORS) {
    const elements = queryAll(doc, selector);
    for (const el of elements) {
      const url = getImageUrl(el);
      if (!url || seen.has(url)) continue;
      seen.add(url);
      out.push(url);
    }
  }
  if (out.length === 0) {
    const imgs = queryAll(doc, "img");
    for (const el of imgs) {
      const url = getImageUrl(el);
      if (!url || seen.has(url)) continue;
      seen.add(url);
      out.push(url);
    }
  }
  return out;
}
