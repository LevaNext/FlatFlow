import type { SelectorResult } from "@/types/parser";
import { failure, success } from "@/types/parser";
import { getText, queryAll } from "./dom";

export interface ListingAttributes {
  area?: number;
  rooms?: number;
  floor?: string;
}

const LABELS = {
  area: "ფართი",
  rooms: "ოთახი",
  floor: "სართული",
} as const;

/**
 * Finds the attributes grid (border rounded-xl grid grid-cols-4) and extracts area, rooms, floor.
 * Structure: each cell has a label span (e.g. "ფართი") and a value span (e.g. "37 მ²").
 */
function findAttributesGrid(doc: Document): Element | null {
  const grids = queryAll(doc, "div.grid");
  for (const grid of grids) {
    const cls = grid.className || "";
    if (!cls.includes("grid-cols-4") && !cls.includes("grid-cols-3")) continue;
    const labelSpans = grid.querySelectorAll("span");
    for (const span of labelSpans) {
      if (getText(span).trim() === LABELS.area) return grid;
    }
  }
  return null;
}

function parseArea(value: string): number | undefined {
  const match = /([\d.,]+)\s*მ²?/i.exec(value) || /^([\d.,]+)$/.exec(value.trim());
  if (!match) return undefined;
  const n = Number.parseFloat(match[1].replace(",", "."));
  return Number.isNaN(n) ? undefined : n;
}

function parseRooms(value: string): number | undefined {
  const n = Number.parseInt(value.trim(), 10);
  return Number.isNaN(n) ? undefined : n;
}

function getValueForLabel(grid: Element, label: string): string | null {
  const spans = grid.querySelectorAll("span");
  for (const span of spans) {
    if (getText(span).trim() !== label) continue;
    const parent = span.closest("div");
    if (!parent) continue;
    for (const s of parent.querySelectorAll("span")) {
      const t = getText(s).trim();
      if (t !== label && t.length > 0) return t;
    }
    const next = span.nextElementSibling;
    if (next) {
      const t = getText(next).trim();
      if (t.length > 0) return t;
    }
  }
  return null;
}

/**
 * Extracts area, rooms, and floor from the listing attributes grid. All fields optional.
 */
export function getListingAttributes(
  doc: Document,
): SelectorResult<Partial<ListingAttributes>> {
  const grid = findAttributesGrid(doc);
  if (!grid) {
    return failure("ATTRIBUTES_GRID_NOT_FOUND", "Attributes grid not found.");
  }
  const out: Partial<ListingAttributes> = {};
  const areaVal = getValueForLabel(grid, LABELS.area);
  if (areaVal != null) {
    const n = parseArea(areaVal);
    if (n != null) out.area = n;
  }
  const roomsVal = getValueForLabel(grid, LABELS.rooms);
  if (roomsVal != null) {
    const n = parseRooms(roomsVal);
    if (n != null) out.rooms = n;
  }
  const floorVal = getValueForLabel(grid, LABELS.floor);
  if (floorVal != null && floorVal.trim().length > 0) {
    out.floor = floorVal.replaceAll(/\s+/g, " ").trim();
  }
  return success(out);
}
