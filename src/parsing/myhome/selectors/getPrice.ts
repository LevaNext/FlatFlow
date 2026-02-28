import type { SelectorResult } from "@/types/parser";
import { failure, success } from "@/types/parser";
import { createParserError, ParserErrorCode } from "../errors";
import { getText, queryOne } from "./dom";

/** Price block: div with two spans (amount + currency), e.g. <span>73,000</span><span>$</span> */
const PRICE_BLOCK_SELECTORS = [
  "div.flex.text-2xl.font-tbcx-bold",
  "div.flex.font-tbcx-bold",
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

/**
 * Extracts price and currency from the document. Parsing only.
 */
export function getPrice(doc: Document): SelectorResult<{
  amount: number;
  currency: "GEL" | "USD";
}> {
  for (const selector of PRICE_BLOCK_SELECTORS) {
    const el = queryOne(doc, selector);
    const text = getText(el);
    if (text && /\d/.test(text)) {
      const parsed = normalizePriceText(text);
      if (parsed) return success(parsed);
    }
  }

  const bodyText = getText(doc.body);
  const priceMatch = bodyText.match(/([\d\s,.]+\s*[₾$])|([₾$]\s*[\d\s,.]+)/);
  if (priceMatch) {
    const parsed = normalizePriceText(priceMatch[0] ?? "");
    if (parsed) return success(parsed);
  }

  const err = createParserError(
    ParserErrorCode.PRICE_NOT_FOUND,
    "Price element not found or could not be parsed.",
  );
  return failure(err.code, err.message);
}
