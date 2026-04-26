import type { SelectorResult } from "@/types/parser";
import { failure, success } from "@/types/parser";
import { queryOne } from "./dom";

const DESCRIPTION_SELECTORS = [
  "div[class*='leading-[22px]'][class*='break-words']",
  "div.text-sm.break-words",
  "[itemprop='description']",
  "meta[property='og:description']",
];

function textWithBreaks(el: Element): string {
  const parts: string[] = [];

  function visit(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      parts.push(node.textContent ?? "");
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const child = node as Element;
    if (child.tagName.toLowerCase() === "br") {
      parts.push("\n");
      return;
    }
    for (const childNode of Array.from(child.childNodes)) visit(childNode);
  }

  visit(el);
  return parts
    .join("")
    .replaceAll("\u00a0", " ")
    .replaceAll(/[ \t]+\n/g, "\n")
    .replaceAll(/\n[ \t]+/g, "\n")
    .replaceAll(/[ \t]{2,}/g, " ")
    .replaceAll(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Extracts the public listing description from MyHome listing pages.
 * Preserves explicit `<br>` breaks so paragraphs remain readable in statement forms.
 */
export function getDescription(doc: Document): SelectorResult<string> {
  for (const selector of DESCRIPTION_SELECTORS) {
    const el = queryOne(doc, selector);
    if (!el) continue;

    const text =
      el instanceof HTMLMetaElement
        ? (el.getAttribute("content") ?? "").trim()
        : textWithBreaks(el);
    if (text.length > 0) return success(text);
  }

  return failure(
    "DESCRIPTION_NOT_FOUND",
    "Listing description could not be found on the page.",
  );
}
