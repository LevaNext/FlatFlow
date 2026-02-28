import type { SelectorResult } from "@/types/parser";
import { failure, success } from "@/types/parser";
import { createParserError, ParserErrorCode } from "../errors";
import { getText, queryOne } from "./dom";

const TITLE_SELECTORS = [
  "h3.font-tbcx-bold",
  "h1.d-title",
  ".detail-title",
  "h1",
];

/**
 * Extracts listing title from the document. Parsing only.
 */
export function getTitle(doc: Document): SelectorResult<string> {
  for (const selector of TITLE_SELECTORS) {
    const el = queryOne(doc, selector);
    const text = getText(el);
    if (text) return success(text);
  }

  const ogTitle = doc.querySelector('meta[property="og:title"]');
  const ogContent = ogTitle?.getAttribute("content")?.trim();
  if (ogContent) return success(ogContent);

  const h1 = queryOne(doc, "h1");
  const h1Text = getText(h1);
  if (h1Text) return success(h1Text);

  const err = createParserError(
    ParserErrorCode.TITLE_NOT_FOUND,
    "Listing title could not be found on the page.",
  );
  return failure(err.code, err.message);
}
