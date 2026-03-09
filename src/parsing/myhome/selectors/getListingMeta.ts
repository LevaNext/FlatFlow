import type { SelectorResult } from "@/types/parser";
import { failure, success } from "@/types/parser";
import { getText, queryAll } from "./dom";

export interface ListingMeta {
  listedAt: string;
  views: number;
  id: string;
}

/**
 * Meta block: div.flex.items-center with gap-6 containing date (calendar icon + "დღეს 19:43-ზე"), views (eye + "182"), "ID: 23746578".
 * Spans may contain SVG + text; getText() returns the visible text.
 */
function findMetaContainer(doc: Document): Element | null {
  const containers = queryAll(doc, "div.flex.items-center");
  for (const el of containers) {
    const classList = el.className || "";
    if (!classList.includes("gap-6")) continue;
    const spans = el.querySelectorAll(":scope > span");
    if (spans.length < 2) continue;
    const texts = Array.from(spans).map((s) => getText(s).trim()).filter(Boolean);
    const hasId = texts.some((t) => /^ID:\s*\d+$/i.test(t));
    const hasNumber = texts.some((t) => /^\d+$/.test(t));
    const hasDate = texts.some((t) => /დღეს|ზე|:\d{2}/.test(t) || (t.includes(":") && /\d/.test(t)));
    if (hasId || hasNumber || hasDate) return el;
  }
  return null;
}

function parseMetaContainer(container: Element): Partial<ListingMeta> {
  const out: Partial<ListingMeta> = {};
  const spans = container.querySelectorAll(":scope > span");
  for (const span of spans) {
    const text = getText(span).trim();
    if (!text) continue;
    const idMatch = /^ID:\s*(\d+)$/i.exec(text);
    if (idMatch) {
      out.id = idMatch[1];
    } else if (/^\d+$/.test(text)) {
      const n = Number.parseInt(text, 10);
      if (!Number.isNaN(n)) out.views = n;
    } else if (/დღეს|ზე|:\d{1,2}/.test(text) || (text.includes(":") && /\d/.test(text))) {
      out.listedAt = text;
    }
  }
  return out;
}

/**
 * Extracts listedAt string, views count, and listing id from the meta row. Optional fields.
 */
export function getListingMeta(
  doc: Document,
): SelectorResult<Partial<ListingMeta>> {
  const container = findMetaContainer(doc);
  if (!container) {
    return failure("LISTING_META_NOT_FOUND", "Listing meta row not found.");
  }
  const meta = parseMetaContainer(container);
  if (
    meta.listedAt === undefined &&
    meta.views === undefined &&
    meta.id === undefined
  ) {
    return failure("LISTING_META_NOT_FOUND", "Could not parse listing meta.");
  }
  return success(meta);
}
