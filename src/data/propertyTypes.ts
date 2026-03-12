/**
 * Real estate / property types in ka, en, ru.
 * Used to parse property type from listing (row or title) and to fill the statement form.
 */

export interface PropertyTypeOption {
  value: string;
  ka: string;
  en: string;
  ru: string;
}

import propertyTypesJson from "./propertyTypes.json";

export const PROPERTY_TYPES: PropertyTypeOption[] =
  propertyTypesJson.propertyTypes;

/** For matching: normalized (lowercase) label → exact label from JSON (ka/en/ru). Sorted by length desc. */
const TITLE_MATCH_ENTRIES: { normalized: string; exact: string }[] = (() => {
  const pairs: { normalized: string; exact: string }[] = [];
  for (const p of PROPERTY_TYPES) {
    for (const raw of [p.ka, p.en, p.ru]) {
      const trimmed = raw?.trim();
      if (trimmed) {
        const normalized = trimmed.toLowerCase();
        pairs.push({ normalized, exact: trimmed });
      }
    }
  }
  pairs.sort((a, b) => b.normalized.length - a.normalized.length);
  return pairs;
})();

/** Labels by value for lookups (normalized lowercase). */
const LABELS_BY_VALUE: { value: string; labels: string[] }[] =
  PROPERTY_TYPES.map((p) => ({
    value: p.value,
    labels: [
      p.ka.trim().toLowerCase(),
      p.en.trim().toLowerCase(),
      p.ru.trim().toLowerCase(),
    ].filter(Boolean),
  }));

/**
 * Match a single string (e.g. from the listing row) to a property type by ka, en, or ru.
 * Returns the canonical `value` or undefined.
 */
export function matchPropertyTypeFromText(text: string): string | undefined {
  if (!text || typeof text !== "string") return undefined;
  const normalized = text.replaceAll(/\s+/g, " ").trim().toLowerCase();
  if (!normalized) return undefined;
  for (const { value, labels } of LABELS_BY_VALUE) {
    if (labels.includes(normalized)) return value;
  }
  return undefined;
}

/**
 * Match property type from title. Case-insensitive; works when the label appears
 * inside a longer sentence (e.g. "ქირავდება ... კერძო სახლი თბილისში").
 * Returns the **exact label from JSON** (same language as in propertyTypes: ka, en, or ru),
 * See docs/PROPERTY_TYPE_FROM_TITLE.md for full spec.
 */
function normalizeForMatch(s: string): string {
  return s.replaceAll(/\s+/g, " ").trim().toLowerCase();
}

export function matchPropertyTypeLabelFromTitle(
  title: string | undefined,
): string | undefined {
  if (!title || typeof title !== "string") return undefined;
  const normalizedTitle = normalizeForMatch(title);
  if (!normalizedTitle) return undefined;

  for (const { normalized, exact } of TITLE_MATCH_ENTRIES) {
    if (normalized && normalizedTitle.includes(normalized)) return exact;
  }

  return undefined;
}
