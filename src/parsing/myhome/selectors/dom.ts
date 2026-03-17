/**
 * DOM helpers for myhome selectors. Parsing only: reads DOM, no UI or upload logic.
 */

export function getText(el: Element | null): string {
  if (!el) return "";
  const raw = el.textContent?.trim() ?? "";
  return raw.replaceAll(/\s+/g, " ").trim();
}

export function getAttribute(el: Element | null, attr: string): string {
  if (!el) return "";
  return el.getAttribute(attr)?.trim() ?? "";
}

export function queryOne(doc: Document, selector: string): Element | null {
  try {
    return doc.querySelector(selector);
  } catch {
    return null;
  }
}

export function queryAll(doc: Document, selector: string): Element[] {
  try {
    return Array.from(doc.querySelectorAll(selector));
  } catch {
    return [];
  }
}
