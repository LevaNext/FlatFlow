import type { SelectorResult } from "@/types/parser";
import { failure, success } from "@/types/parser";
import { getText, queryAll } from "./dom";

const LOG = (msg: string, ...args: unknown[]) =>
  console.log("[FlatFlow] getCondition", msg, ...args);

/** Label for condition on the listing page (Georgian). */
const CONDITION_LABEL = "მდგომარეობა";

/**
 * Finds the condition row (label "მდგომარეობა") and returns the value text
 * (e.g. "ახალი გარემონტებული"). Value can be in a sibling span (mobile) or in a
 * hidden div (desktop).
 */
export function getCondition(doc: Document): SelectorResult<string> {
  const spans = queryAll(doc, "span");
  let conditionRow: Element | null = null;
  for (const span of spans) {
    if (getText(span).trim() === CONDITION_LABEL) {
      conditionRow = span.closest("div.flex");
      break;
    }
  }
  if (!conditionRow) {
    LOG("condition row (მდგომარეობა) not found");
    return failure(
      "CONDITION_NOT_FOUND",
      "Condition row (მდგომარეობა) not found.",
    );
  }
  const children = Array.from(conditionRow.children);
  if (children.length >= 2) {
    const valueFromSibling = getText(children[1]).trim();
    if (valueFromSibling.length > 0) {
      LOG("parsed condition from sibling:", valueFromSibling);
      return success(valueFromSibling);
    }
  }
  const hiddenBlock = conditionRow.querySelector(
    "[class*='hidden'][class*='md:block'], [class*='md:block'][class*='hidden']",
  );
  if (hiddenBlock) {
    const value = getText(hiddenBlock).trim();
    if (value.length > 0) {
      LOG("parsed condition from hidden block:", value);
      return success(value);
    }
  }
  const anyWithValue = conditionRow.querySelector(
    "span.block, div[class*='hidden']",
  );
  if (anyWithValue) {
    const value = getText(anyWithValue).trim();
    if (value.length > 0 && value !== CONDITION_LABEL) {
      LOG("parsed condition from fallback:", value);
      return success(value);
    }
  }
  LOG("could not read condition value from condition row");
  return failure(
    "CONDITION_NOT_FOUND",
    "Could not read condition value from condition row.",
  );
}
