/**
 * Storage for parsed listing data only. No upload or form logic.
 * Safe to call from side panel, content scripts, or background.
 * Uses chrome.storage.local only.
 */

import type { ListingData, ListingSource } from "@/types/listing";
import type { ParserError } from "@/types/parser";

/** Single source for the chrome.storage.local key used by side panel and content script. */
export const PARSED_LISTING_STORAGE_KEY = "parsedListing";

export interface ParsedListingMeta {
  source: ListingSource;
  parsedAt: number;
}

export interface ParsedListingPayload {
  data: ListingData;
  errors: ParserError[];
  meta: ParsedListingMeta;
}

export type SaveResult = { ok: true } | { ok: false; error: string };
export type GetResult =
  | { ok: true; value: ParsedListingPayload }
  | { ok: false; error: string };
export type ClearResult = { ok: true } | { ok: false; error: string };

function hasChromeStorage(): boolean {
  return typeof chrome !== "undefined" && Boolean(chrome.storage?.local);
}

/**
 * Save parsed listing to chrome.storage.local. Call from side panel/orchestrator after parsing.
 */
export async function saveParsedListing(
  payload: ParsedListingPayload,
): Promise<SaveResult> {
  if (!hasChromeStorage()) {
    return { ok: false, error: "Storage not available" };
  }
  try {
    await chrome.storage.local.set({ [PARSED_LISTING_STORAGE_KEY]: payload });
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown storage error";
    return { ok: false, error: message };
  }
}

/**
 * Read parsed listing from chrome.storage.local. Safe for side panel or future uploader.
 */
export async function getParsedListing(): Promise<GetResult> {
  if (!hasChromeStorage()) {
    return { ok: false, error: "Storage not available" };
  }
  try {
    const out = await chrome.storage.local.get(PARSED_LISTING_STORAGE_KEY);
    const raw = out[PARSED_LISTING_STORAGE_KEY];
    if (raw == null) {
      return { ok: false, error: "No parsed listing stored" };
    }
    if (
      typeof raw !== "object" ||
      !("data" in raw) ||
      !("errors" in raw) ||
      !("meta" in raw)
    ) {
      return { ok: false, error: "Invalid stored shape" };
    }
    const value = raw as ParsedListingPayload;
    return { ok: true, value };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown storage error";
    return { ok: false, error: message };
  }
}

/**
 * Remove parsed listing from storage.
 */
export async function clearParsedListing(): Promise<ClearResult> {
  if (!hasChromeStorage()) {
    return { ok: false, error: "Storage not available" };
  }
  try {
    await chrome.storage.local.remove(PARSED_LISTING_STORAGE_KEY);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown storage error";
    return { ok: false, error: message };
  }
}
