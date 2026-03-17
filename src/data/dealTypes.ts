/**
 * Deal types (sale, rent, lease, daily rent) in ka, en, ru.
 * Used to parse deal type from listing title and to fill the statement form.
 */

export interface DealTypeOption {
  value: string;
  ka: string;
  en: string;
  ru: string;
}

import dealTypesJson from "./dealTypes.json";

export const DEAL_TYPES: DealTypeOption[] = dealTypesJson.dealTypes;

/** For matching: normalized (lowercase) label → exact label from JSON (ka/en/ru). Sorted by length desc. */
const TITLE_MATCH_ENTRIES: { normalized: string; exact: string }[] = (() => {
  const pairs: { normalized: string; exact: string }[] = [];
  for (const d of DEAL_TYPES) {
    for (const raw of [d.ka, d.en, d.ru]) {
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
const LABELS_BY_VALUE: { value: string; labels: string[] }[] = DEAL_TYPES.map(
  (d) => ({
    value: d.value,
    labels: [
      d.ka.trim().toLowerCase(),
      d.en.trim().toLowerCase(),
      d.ru.trim().toLowerCase(),
    ].filter(Boolean),
  }),
);

/**
 * Match a single string (e.g. from the listing row) to a deal type by ka, en, or ru.
 * Returns the canonical `value` or undefined.
 */
export function matchDealTypeFromText(text: string): string | undefined {
  if (!text || typeof text !== "string") return undefined;
  const normalized = text.replaceAll(/\s+/g, " ").trim().toLowerCase();
  if (!normalized) return undefined;
  for (const { value, labels } of LABELS_BY_VALUE) {
    if (labels.includes(normalized)) return value;
  }
  return undefined;
}

/**
 * Match deal type from title. Case-insensitive; works when the label appears
 * inside a longer sentence (e.g. "იყიდება ბინა თბილისში" or "ქირავდება დღიურად ...").
 * Returns the **exact label from JSON** (same language as in dealTypes: ka, en, or ru).
 * Sorted by length so longer phrases (e.g. "ქირავდება დღიურად") match before "ქირავდება".
 */
function normalizeForMatch(s: string): string {
  return s.replaceAll(/\s+/g, " ").trim().toLowerCase();
}

export function matchDealTypeLabelFromTitle(
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
