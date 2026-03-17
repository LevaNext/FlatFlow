import type { SelectorResult } from "@/types/parser";
import { failure, success } from "@/types/parser";
import { getText, queryAll } from "./dom";

export interface ListingAttributes {
  area?: number;
  rooms?: number;
  beds?: number;
  floor?: string;
}

/** Georgian and English labels so both page languages work. */
const LABELS: Record<keyof ListingAttributes, readonly string[]> = {
  area: ["ფართი", "Area"],
  rooms: ["ოთახი", "Rooms"],
  beds: ["საძინებელი", "Bedroom"],
  floor: ["სართული", "Floor"],
} as const;

/**
 * Finds the attributes grid (border rounded-xl grid grid-cols-4) by matching any known label.
 * Structure: each cell has a label span (e.g. "ფართი" or "Area") and a value span (e.g. "37 მ²").
 */
function findAttributesGrid(doc: Document): Element | null {
  const grids = queryAll(doc, "div.grid");
  const anyLabel = new Set([
    ...LABELS.area,
    ...LABELS.rooms,
    ...LABELS.beds,
    ...LABELS.floor,
  ]);
  for (const grid of grids) {
    const cls = grid.className || "";
    if (!cls.includes("grid-cols-4") && !cls.includes("grid-cols-3")) continue;
    const labelSpans = grid.querySelectorAll("span");
    for (const span of labelSpans) {
      const t = getText(span).trim();
      if (anyLabel.has(t)) return grid;
    }
  }
  return null;
}

function parseArea(value: string): number | undefined {
  const match =
    /([\d.,]+)\s*მ²?/i.exec(value) ||
    /([\d.,]+)\s*m²?/i.exec(value) ||
    /^([\d.,]+)$/.exec(value.trim());
  if (!match) return undefined;
  const n = Number.parseFloat(match[1].replace(",", "."));
  return Number.isNaN(n) ? undefined : n;
}

function parseRooms(value: string): number | undefined {
  const n = Number.parseInt(value.trim(), 10);
  return Number.isNaN(n) ? undefined : n;
}

function getValueInCell(labelSpan: Element, label: string): string | null {
  const parent = labelSpan.closest("div");
  if (!parent) return null;
  for (const s of parent.querySelectorAll("span")) {
    const t = getText(s).trim();
    if (t !== label && t.length > 0) return t;
  }
  const next = labelSpan.nextElementSibling;
  return next ? getText(next).trim() || null : null;
}

function getValueForLabel(grid: Element, label: string): string | null {
  const spans = grid.querySelectorAll("span");
  for (const span of spans) {
    if (getText(span).trim() !== label) continue;
    const val = getValueInCell(span, label);
    if (val != null && val.length > 0) return val;
  }
  return null;
}

/** Try each label in order; return first non-null value. */
function getValueForLabels(
  grid: Element,
  labels: readonly string[],
): string | null {
  for (const label of labels) {
    const val = getValueForLabel(grid, label);
    if (val != null) return val;
  }
  return null;
}

function normalizeFloor(value: string): string {
  return value
    .replaceAll(/\s+/g, " ")
    .trim()
    .replace(/\s*\/\s*/, "/");
}

/**
 * Extracts area, rooms, beds, and floor from the listing attributes grid. All fields optional.
 * Supports Georgian and English labels.
 */
export function getListingAttributes(
  doc: Document,
): SelectorResult<Partial<ListingAttributes>> {
  const grid = findAttributesGrid(doc);
  if (!grid) {
    return failure("ATTRIBUTES_GRID_NOT_FOUND", "Attributes grid not found.");
  }
  const out: Partial<ListingAttributes> = {};
  const areaVal = getValueForLabels(grid, LABELS.area);
  if (areaVal != null) {
    const n = parseArea(areaVal);
    if (n != null) out.area = n;
  }
  const roomsVal = getValueForLabels(grid, LABELS.rooms);
  if (roomsVal != null) {
    const n = parseRooms(roomsVal);
    if (n != null) out.rooms = n;
  }
  const bedsVal = getValueForLabels(grid, LABELS.beds);
  if (bedsVal != null) {
    const n = parseRooms(bedsVal);
    if (n != null) out.beds = n;
  }
  const floorVal = getValueForLabels(grid, LABELS.floor);
  if (floorVal != null && floorVal.trim().length > 0) {
    out.floor = normalizeFloor(floorVal);
  }
  return success(out);
}
