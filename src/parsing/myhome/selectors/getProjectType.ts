import type { SelectorResult } from "@/types/parser";
import { failure, success } from "@/types/parser";
import { getText, queryAll } from "./dom";

const LOG = (msg: string, ...args: unknown[]) =>
  console.log("[FlatFlow] getProjectType", msg, ...args);

/** Label for project type on the listing page (Georgian). */
const PROJECT_TYPE_LABEL = "პროექტის ტიპი";

/**
 * Finds the project type row (label "პროექტის ტიპი") and returns the value text
 * (e.g. "არასტანდარტული"). Value can be in a sibling span (mobile) or in a
 * hidden div (desktop).
 */
export function getProjectType(doc: Document): SelectorResult<string> {
  const spans = queryAll(doc, "span");
  let projectTypeRow: Element | null = null;
  for (const span of spans) {
    if (getText(span).trim() === PROJECT_TYPE_LABEL) {
      projectTypeRow = span.closest("div.flex");
      break;
    }
  }
  if (!projectTypeRow) {
    LOG("project type row (პროექტის ტიპი) not found");
    return failure(
      "PROJECT_TYPE_NOT_FOUND",
      "Project type row (პროექტის ტიპი) not found.",
    );
  }
  const children = Array.from(projectTypeRow.children);
  if (children.length >= 2) {
    const valueFromSibling = getText(children[1]).trim();
    if (valueFromSibling.length > 0) {
      LOG("parsed project type from sibling:", valueFromSibling);
      return success(valueFromSibling);
    }
  }
  const hiddenBlock = projectTypeRow.querySelector(
    "[class*='hidden'][class*='md:block'], [class*='md:block'][class*='hidden']",
  );
  if (hiddenBlock) {
    const value = getText(hiddenBlock).trim();
    if (value.length > 0) {
      LOG("parsed project type from hidden block:", value);
      return success(value);
    }
  }
  const anyWithValue = projectTypeRow.querySelector(
    "span.block, div[class*='hidden']",
  );
  if (anyWithValue) {
    const value = getText(anyWithValue).trim();
    if (value.length > 0 && value !== PROJECT_TYPE_LABEL) {
      LOG("parsed project type from fallback:", value);
      return success(value);
    }
  }
  LOG("could not read project type value from project type row");
  return failure(
    "PROJECT_TYPE_NOT_FOUND",
    "Could not read project type value from project type row.",
  );
}
