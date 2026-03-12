import type { SelectorResult } from "@/types/parser";
import { failure, success } from "@/types/parser";
import { getText, queryAll, queryOne } from "./dom";

export interface AddressAndSubway {
  address: string;
  subway?: string;
}

/**
 * Address block: location for listing preview card.
 * Structure: div.flex.flex-col.items-start >
 *   - First row: div.flex.items-center.gap-2.mt-2 with location pin svg (path fill #222) + span = address (e.g. "გურამიშვილის გამზ. 62ბ")
 *   - Second row (optional): div with text-secondary-80 and red subway icon (path fill #FF5353) + span = subway (e.g. "ღრმაღელე")
 */
const ADDRESS_CONTAINER_SELECTORS = [
  "div.flex.flex-col.items-start",
  "div.flex[class*='flex-col'][class*='items-start']",
];

function isLocationPinSvg(svg: Element): boolean {
  const path = svg.querySelector('path[fill="#222222"], path[fill="#222"]');
  return path != null;
}

function isSubwaySvg(svg: Element): boolean {
  const path = svg.querySelector('path[fill="#FF5353"]');
  return path != null;
}

function parseRow(row: Element): { address?: string; subway?: string } {
  const svg = row.querySelector("svg");
  const span = row.querySelector(":scope > span");
  const text = span ? getText(span).trim() : "";
  if (!text || text.length > 500) return {};
  if (svg && isLocationPinSvg(svg)) return { address: text };
  if (svg && isSubwaySvg(svg)) return { subway: text };
  if (row.classList.contains("text-secondary-80")) return { subway: text };
  return {};
}

function parseRows(rows: Element[]): AddressAndSubway | null {
  let address: string | null = null;
  let subway: string | null = null;
  for (const row of rows) {
    const parsed = parseRow(row);
    if (parsed.address) address = parsed.address;
    if (parsed.subway) subway = parsed.subway;
  }
  return address ? { address, ...(subway && { subway }) } : null;
}

function tryFallbackAddress(doc: Document): AddressAndSubway | null {
  const fallbackSelectors = [
    "div.flex.flex-col.items-start div.flex.items-center.gap-2.mt-2 span",
    "div.flex.flex-col.items-start div.flex.items-center.mt-2 span",
    "div.flex.items-center.gap-2.mt-2 span",
  ];
  for (const sel of fallbackSelectors) {
    const span = queryOne(doc, sel);
    const text = getText(span)?.trim();
    if (
      text &&
      text.length > 0 &&
      text.length < 500 &&
      !/^ID:\s*\d+$/i.test(text)
    ) {
      return { address: text };
    }
  }
  const candidates = queryAll(doc, "div.flex.items-center.gap-2");
  for (const div of candidates) {
    const spans = div.querySelectorAll(":scope > span");
    if (spans.length >= 1) {
      const text = getText(spans[0]);
      if (
        text &&
        text.length > 2 &&
        text.length < 500 &&
        !/^ID:\s*\d+$/i.test(text)
      ) {
        return { address: text };
      }
    }
  }
  return null;
}

function tryAddressAndSubwayFromContainer(
  doc: Document,
): AddressAndSubway | null {
  for (const containerSel of ADDRESS_CONTAINER_SELECTORS) {
    const container = queryOne(doc, containerSel);
    if (!container) continue;
    const rows = Array.from(
      container.querySelectorAll(":scope > div.flex.items-center.gap-2"),
    );
    if (rows.length === 0) continue;
    const result = parseRows(rows);
    if (result) return result;
  }
  return tryFallbackAddress(doc);
}

/**
 * Extracts listing address and optional subway from the address block.
 * First row (location pin) = address; second row (subway icon or text-secondary-80) = subway when present.
 */
export function getAddress(doc: Document): SelectorResult<AddressAndSubway> {
  const value = tryAddressAndSubwayFromContainer(doc);
  if (value) return success(value);
  return failure("ADDRESS_NOT_FOUND", "Address element not found.");
}
