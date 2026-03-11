import type { SelectorResult } from "@/types/parser";
import { failure, success } from "@/types/parser";
import { getText, queryAll } from "./dom";

const LOG = (msg: string, ...args: unknown[]) =>
  console.log("[FlatFlow] getStatus", msg, ...args);

/** Label for status on the listing page (Georgian). */
const STATUS_LABEL = "სტატუსი";

/**
 * Finds the status row (label "სტატუსი") and returns the value text
 * (e.g. "ახალი აშენებული"). Value can be in a sibling span (mobile) or in a
 * hidden div (desktop).
 */
export function getStatus(doc: Document): SelectorResult<string> {
  const spans = queryAll(doc, "span");
  let statusRow: Element | null = null;
  for (const span of spans) {
    if (getText(span).trim() === STATUS_LABEL) {
      statusRow = span.closest("div.flex");
      break;
    }
  }
  if (!statusRow) {
    LOG("status row (სტატუსი) not found");
    return failure("STATUS_NOT_FOUND", "Status row (სტატუსი) not found.");
  }
  const children = Array.from(statusRow.children);
  if (children.length >= 2) {
    const valueFromSibling = getText(children[1]).trim();
    if (valueFromSibling.length > 0) {
      LOG("parsed status from sibling:", valueFromSibling);
      return success(valueFromSibling);
    }
  }
  const hiddenBlock = statusRow.querySelector(
    "[class*='hidden'][class*='md:block'], [class*='md:block'][class*='hidden']",
  );
  if (hiddenBlock) {
    const value = getText(hiddenBlock).trim();
    if (value.length > 0) {
      LOG("parsed status from hidden block:", value);
      return success(value);
    }
  }
  const anyWithValue = statusRow.querySelector(
    "span.block, div[class*='hidden']",
  );
  if (anyWithValue) {
    const value = getText(anyWithValue).trim();
    if (value.length > 0 && value !== STATUS_LABEL) {
      LOG("parsed status from fallback:", value);
      return success(value);
    }
  }
  LOG("could not read status value from status row");
  return failure(
    "STATUS_NOT_FOUND",
    "Could not read status value from status row.",
  );
}
