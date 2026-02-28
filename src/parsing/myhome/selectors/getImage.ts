import type { SelectorResult } from "@/types/parser";
import { failure, success } from "@/types/parser";
import { createParserError, ParserErrorCode } from "../errors";
import { getAttribute, queryAll, queryOne } from "./dom";

const MAIN_IMAGE_SELECTORS = [
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

/**
 * Extracts main listing image URL from the document. Parsing only.
 */
export function getImage(doc: Document): SelectorResult<string> {
  for (const selector of MAIN_IMAGE_SELECTORS) {
    const el = queryOne(doc, selector);
    const src = getAttribute(el, "src");
    if (src && isValidImageSrc(src)) return success(src);
  }

  const imgs = queryAll(doc, "img");
  for (const img of imgs) {
    const src = getAttribute(img, "src");
    if (src && isValidImageSrc(src)) return success(src);
  }

  const ogImage = doc.querySelector('meta[property="og:image"]');
  const ogSrc = ogImage?.getAttribute("content")?.trim();
  if (ogSrc && isValidImageSrc(ogSrc)) return success(ogSrc);

  const err = createParserError(
    ParserErrorCode.IMAGE_NOT_FOUND,
    "No valid listing image URL could be found.",
  );
  return failure(err.code, err.message);
}
