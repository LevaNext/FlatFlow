import type { SelectorResult } from "@/types/parser";
import { failure, success } from "@/types/parser";
import { getText, queryAll, queryOne } from "./dom";

/**
 * Address block: location for listing preview card.
 * Structure: div.flex.flex-col.items-start > div.flex.items-center.gap-2.mt-2 (with location pin svg + span).
 * e.g. <div class="flex flex-col items-start"><div class="flex items-center gap-2 mt-2 text-xs md:text-sm"><svg>...</svg><span>გრიგოლ ლორთქიფანიძის ქუჩა </span></div></div>
 */
const ADDRESS_CONTAINER_SELECTORS = [
  "div.flex.flex-col.items-start div.flex.items-center.gap-2.mt-2 span",
  "div.flex.flex-col.items-start div.flex.items-center.gap-2 span",
  "div.flex.items-center.gap-2.mt-2 span",
  "div[class*='items-start'] div[class*='gap-2'] span",
];

function tryAddressFromContainer(doc: Document): string | null {
  for (const selector of ADDRESS_CONTAINER_SELECTORS) {
    const span = queryOne(doc, selector);
    const text = getText(span)?.trim();
    if (text && text.length > 0 && text.length < 500) return text;
  }
  // Fallback: any div with gap-2 and items-center that has exactly one span with short text (address-like)
  const candidates = queryAll(doc, "div.flex.items-center.gap-2");
  for (const div of candidates) {
    const spans = div.querySelectorAll(":scope > span");
    if (spans.length >= 1) {
      const text = getText(spans[0]);
      if (
        text &&
        text.length > 2 &&
        text.length < 500 &&
        !/^ID:\s*\d+$/i.test(text)
      )
        return text;
    }
  }
  return null;
}

/**
 * Extracts listing address (location pin + text). Optional field; returns failure when not found.
 */
export function getAddress(doc: Document): SelectorResult<string> {
  const value = tryAddressFromContainer(doc);
  if (value) return success(value);
  return failure("ADDRESS_NOT_FOUND", "Address element not found.");
}
