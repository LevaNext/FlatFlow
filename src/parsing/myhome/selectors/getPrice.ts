import type { SelectorResult } from "@/types/parser";
import { failure, success } from "@/types/parser";
import { createParserError, ParserErrorCode } from "../errors";
import { getText, queryAll, queryOne } from "./dom";

/** Price block: div with two spans (amount + currency), e.g. <span>228,837</span><span>₾</span> */
const PRICE_BLOCK_SELECTORS = [
  "div.flex.text-2xl.font-tbcx-bold",
  "div.flex.font-tbcx-bold",
  "div.flex[class*='text-26'][class*='font-tbcx-bold']",
  "div[class*='text-2xl'][class*='font-tbcx-bold']",
  "[class*='text-2xl'][class*='font-tbcx-bold']",
  "[class*='text-26'][class*='font-tbcx-bold']",
  ".d-price",
  ".detail-price",
  ".price-block",
  "[class*='price']",
];

const USD_SYMBOLS = ["$", "usd", "dollar"];

function normalizePriceText(
  raw: string,
): { amount: number; currency: "GEL" | "USD" } | null {
  const normalized = raw.replaceAll(/\s+/g, " ").trim();
  const hasUsd = USD_SYMBOLS.some((s) =>
    normalized.toLowerCase().includes(s.toLowerCase()),
  );
  const currency: "GEL" | "USD" = hasUsd ? "USD" : "GEL";
  const digits = normalized.replaceAll(/[^\d.,]/g, "").replaceAll(",", "");
  const amount = Number.parseFloat(digits);
  if (Number.isNaN(amount) || amount < 0) return null;
  return { amount, currency };
}

/** Parse two-span structure: <span>2,154</span><span>₾</span> */
function tryParseTwoSpans(
  el: Element,
): { amount: number; currency: "GEL" | "USD" } | null {
  const spans = el.querySelectorAll(":scope > span");
  if (spans.length < 2) return null;
  const amountText = getText(spans[0]).replaceAll(/\s/g, "");
  const currencyText = getText(spans[1]).trim();
  if (
    !/^[\d,.]+$/.test(amountText) ||
    (currencyText !== "₾" && currencyText !== "$")
  )
    return null;
  const amount = Number.parseFloat(amountText.replaceAll(",", ""));
  if (Number.isNaN(amount) || amount < 0) return null;
  return { amount, currency: currencyText === "$" ? "USD" : "GEL" };
}

/** Try to get price from element; return parsed result or null. */
function tryParseFromElement(el: Element | null): {
  amount: number;
  currency: "GEL" | "USD";
} | null {
  if (!el) return null;
  const text = getText(el);
  if (text && /\d/.test(text)) {
    const parsed = normalizePriceText(text);
    if (parsed) return parsed;
  }
  return tryParseTwoSpans(el);
}

/**
 * Price row: wrapper with flex items-center justify-start/justify-between; first child is the price block.
 * e.g. <div class="flex items-center justify-start md:justify-between"><div class="flex text-2xl md:text-26 font-tbcx-bold ..."><span>70</span><span>₾</span></div><div id="currency-switcher">...</div></div>
 */
function getPriceFromPriceRowContainer(doc: Document): PriceResult | null {
  const wrappers = queryAll(
    doc,
    "div.flex[class*='items-center'][class*='justify']",
  );
  for (const wrapper of wrappers) {
    const first = wrapper.firstElementChild;
    if (!first) continue;
    const parsed = tryParseFromElement(first);
    if (parsed) return parsed;
  }
  return null;
}

/**
 * Price block is often next to #currency-switcher or .currency-gel: previous sibling or first child of same parent.
 * e.g. <div class="flex ..."><div class="flex text-2xl md:text-26 font-tbcx-bold ..."><span>100</span><span>₾</span></div><div id="currency-switcher" class="currency-gel">...</div></div>
 * Variant: switcher has class "z-10 undefined currency-gel" — still matched by .currency-gel.
 */
function getPriceFromCurrencySwitcherSibling(doc: Document): {
  amount: number;
  currency: "GEL" | "USD";
} | null {
  const switcher =
    doc.getElementById("currency-switcher") ??
    doc.querySelector(".currency-gel") ??
    doc.querySelector("[id='currency-switcher']");
  if (!switcher) return null;
  const prev = switcher.previousElementSibling;
  if (prev) {
    const parsed = tryParseFromElement(prev);
    if (parsed) return parsed;
  }
  const parent = switcher.parentElement;
  if (!parent) return null;
  if (parent.firstElementChild) {
    const parsed = tryParseFromElement(parent.firstElementChild);
    if (parsed) return parsed;
  }
  // Scan all direct children for a price block (handles any order)
  for (const child of parent.children) {
    if (child === switcher) continue;
    const parsed = tryParseFromElement(child);
    if (parsed) return parsed;
  }
  return null;
}

type PriceResult = { amount: number; currency: "GEL" | "USD" };

function tryPriceBlockSelectors(doc: Document): PriceResult | null {
  for (const selector of PRICE_BLOCK_SELECTORS) {
    const el = queryOne(doc, selector);
    const parsed = tryParseFromElement(el);
    if (parsed) return parsed;
  }
  // Try all matching elements in case queryOne returned a non-price element (e.g. same classes elsewhere)
  const tryAllSelector =
    "div[class*='font-tbcx-bold'][class*='text-2xl'], div[class*='font-tbcx-bold'][class*='text-26']";
  for (const el of queryAll(doc, tryAllSelector)) {
    const parsed = tryParseFromElement(el);
    if (parsed) return parsed;
  }
  return null;
}

const FLEXIBLE_SELECTORS = [
  "[class*='text-2xl'][class*='font-tbcx-bold']",
  "[class*='font-tbcx-bold']",
];

function tryFlexiblePriceBlocks(doc: Document): PriceResult | null {
  for (const selector of FLEXIBLE_SELECTORS) {
    for (const el of queryAll(doc, selector)) {
      const parsed = tryParseFromElement(el);
      if (parsed) return parsed;
      const text = getText(el);
      if (
        text.length > 0 &&
        text.length <= 80 &&
        /\d/.test(text) &&
        /₾|\$|usd|dollar/i.test(text)
      ) {
        const normalized = normalizePriceText(text);
        if (normalized) return normalized;
      }
    }
  }
  return null;
}

function tryBodyTextPrice(doc: Document): PriceResult | null {
  const bodyText = getText(doc.body);
  const priceMatch = /([\d\s,.]+\s*[₾$])|([₾$]\s*[\d\s,.]+)/.exec(bodyText);
  if (!priceMatch) return null;
  return normalizePriceText(priceMatch[0] ?? "");
}

/**
 * Extracts price and currency from the document. Parsing only.
 */
export function getPrice(doc: Document): SelectorResult<PriceResult> {
  const fromSwitcher = getPriceFromCurrencySwitcherSibling(doc);
  if (fromSwitcher) return success(fromSwitcher);

  const fromPriceRow = getPriceFromPriceRowContainer(doc);
  if (fromPriceRow) return success(fromPriceRow);

  const fromBlocks = tryPriceBlockSelectors(doc);
  if (fromBlocks) return success(fromBlocks);

  const fromFlexible = tryFlexiblePriceBlocks(doc);
  if (fromFlexible) return success(fromFlexible);

  const fromBody = tryBodyTextPrice(doc);
  if (fromBody) return success(fromBody);

  const err = createParserError(
    ParserErrorCode.PRICE_NOT_FOUND,
    "Price element not found or could not be parsed.",
  );
  return failure(err.code, err.message);
}
