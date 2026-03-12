import {
  matchPropertyTypeFromText,
  PROPERTY_TYPES,
} from "@/data/propertyTypes";
import type { SelectorResult } from "@/types/parser";
import { failure, success } from "@/types/parser";
import { getText, queryAll } from "./dom";

const LOG = (msg: string, ...args: unknown[]) =>
  console.log("[FlatFlow] getPropertyType", msg, ...args);

/** Labels for "Real estate type" row on the listing page (ka, en, ru). */
const PROPERTY_TYPE_ROW_LABELS = new Set([
  "უძრავი ქონების ტიპი",
  "Real estate type",
  "Property type",
  "Тип недвижимости",
]);

/** Georgian labels used in the chip UI (e.g. ბინა, კერძო სახლი). */
const CHIP_TEXTS = new Set(
  PROPERTY_TYPES.map((p) => p.ka.trim()).filter(Boolean),
);

function findPropertyTypeRow(doc: Document): Element | null {
  const spans = queryAll(doc, "span");
  for (const span of spans) {
    const text = getText(span).trim();
    if (PROPERTY_TYPE_ROW_LABELS.has(text)) {
      const row = span.closest("div.flex");
      if (row) return row;
      break;
    }
  }
  return null;
}

function getValueFromRow(row: Element): string | null {
  const children = Array.from(row.children);
  if (children.length >= 2) {
    const valueFromSibling = getText(children[1]).trim();
    if (valueFromSibling.length > 0) return valueFromSibling;
  }
  const hiddenBlock = row.querySelector(
    "[class*='hidden'][class*='md:block'], [class*='md:block'][class*='hidden']",
  );
  if (hiddenBlock) {
    const value = getText(hiddenBlock).trim();
    if (value.length > 0) return value;
  }
  for (const el of row.querySelectorAll("span, div")) {
    const t = getText(el).trim();
    if (t.length > 0 && !PROPERTY_TYPE_ROW_LABELS.has(t)) return t;
  }
  return null;
}

function getChipLabelText(label: Element): string {
  const span = label.querySelector("span.luk-text-sm");
  return span ? getText(span).trim() : getText(label).trim();
}

function isSelectedChip(label: Element): boolean {
  const cls = label.className || "";
  const attr = label.getAttribute("class") || "";
  return (
    cls.includes("primary") ||
    cls.includes("luk-border-primary") ||
    cls.includes("luk-bg-primary") ||
    attr.includes("green")
  );
}

function isPropertyTypeChipContainer(div: Element): boolean {
  const cls = div.className || "";
  return (
    cls.includes("luk-flex-row") &&
    cls.includes("luk-flex-wrap") &&
    cls.includes("luk-gap")
  );
}

function getSelectedChipFromContainer(div: Element): string | null {
  for (const label of div.querySelectorAll("label")) {
    const text = getChipLabelText(label);
    if (text && CHIP_TEXTS.has(text) && isSelectedChip(label)) {
      LOG("parsed property type from selected chip:", text);
      return text;
    }
  }
  for (const label of div.querySelectorAll("label")) {
    const text = getChipLabelText(label);
    if (text && CHIP_TEXTS.has(text)) return text;
  }
  return null;
}

/**
 * Find chip container (luk-flex luk-w-full luk-flex-row luk-flex-wrap luk-gap)
 * and return the selected chip text (chip with primary/green border or background).
 */
function getSelectedChipText(doc: Document): string | null {
  const divs = queryAll(doc, "div[class*='luk-flex'][class*='luk-w-full']");
  for (const div of divs) {
    if (!isPropertyTypeChipContainer(div)) continue;
    const text = getSelectedChipFromContainer(div);
    if (text) return text;
  }
  return null;
}

function getPropertyTypeFromRow(doc: Document): string | null {
  const row = findPropertyTypeRow(doc);
  if (!row) return null;
  const raw = getValueFromRow(row);
  return raw ? (matchPropertyTypeFromText(raw) ?? null) : null;
}

export function getPropertyType(doc: Document): SelectorResult<string> {
  const fromRow = getPropertyTypeFromRow(doc);
  if (fromRow) {
    LOG("parsed property type from row ->", fromRow);
    return success(fromRow);
  }
  const chipText = getSelectedChipText(doc);
  const fromChip = chipText
    ? (matchPropertyTypeFromText(chipText) ?? null)
    : null;
  if (fromChip) {
    LOG("parsed property type from chip:", chipText, "->", fromChip);
    return success(fromChip);
  }
  LOG("property type row/chip not found or no match");
  return failure(
    "PROPERTY_TYPE_NOT_FOUND",
    "Property type (real estate type) not found or could not be matched.",
  );
}
