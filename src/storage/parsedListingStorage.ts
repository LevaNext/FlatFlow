/**
 * Storage for parsed listing data only. No upload or form logic.
 * Safe to call from side panel, content scripts, or background.
 * Uses chrome.storage.local only.
 */

import type { ListingData, ListingSource } from "@/types/listing";
import type { ParserError } from "@/types/parser";

/** Legacy single-slot key. Removed on save/clear to prevent stale cross-listing reuse. */
export const PARSED_LISTING_STORAGE_KEY = "parsedListing";
export const ACTIVE_PARSED_LISTING_ID_STORAGE_KEY = "activeParsedListingId";
export const PARSED_LISTINGS_BY_ID_STORAGE_KEY = "parsedListingsById";

export interface ParsedListingMeta {
  /** Must match `data.listingId`; used to validate storage scope. */
  listingId: string;
  source: ListingSource;
  parsedAt: number;
  /** Normalized listing tab URL when parsed; used to skip re-parsing the same page. */
  pageUrl?: string;
}

/** Normalize a listing page URL for stable comparison (no hash, trimmed trailing slash on path). */
export function normalizeListingPageUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed === "") return "";
  try {
    const u = new URL(trimmed);
    u.hash = "";
    const path =
      u.pathname.length > 1 && u.pathname.endsWith("/")
        ? u.pathname.slice(0, -1)
        : u.pathname;
    return `${u.origin.toLowerCase()}${path}${u.search}`;
  } catch {
    return trimmed;
  }
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

type StoredParsedListings = Record<string, ParsedListingPayload>;

function hasChromeStorage(): boolean {
  return typeof chrome !== "undefined" && Boolean(chrome.storage?.local);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null;
}

function copyPayload(payload: ParsedListingPayload): ParsedListingPayload {
  return {
    data: {
      ...payload.data,
      imageUrls: payload.data.imageUrls?.slice(),
    },
    errors: payload.errors.slice(),
    meta: { ...payload.meta },
  };
}

function validatePayload(
  payload: ParsedListingPayload | undefined,
  listingId: string,
): ParsedListingPayload | null {
  if (!payload) return null;
  if (payload.data.listingId !== listingId) return null;
  if (payload.meta.listingId !== listingId) return null;
  return payload;
}

async function getStoredListings(): Promise<StoredParsedListings> {
  const out = await chrome.storage.local.get(PARSED_LISTINGS_BY_ID_STORAGE_KEY);
  const raw = out[PARSED_LISTINGS_BY_ID_STORAGE_KEY];
  return isRecord(raw) ? (raw as StoredParsedListings) : {};
}

/**
 * Save parsed listing to chrome.storage.local under its listing ID and mark it active.
 */
export async function saveParsedListing(
  payload: ParsedListingPayload,
): Promise<SaveResult> {
  if (!hasChromeStorage()) {
    return { ok: false, error: "Storage not available" };
  }
  try {
    const listingId = payload.data.listingId;
    if (!listingId || payload.meta.listingId !== listingId) {
      return { ok: false, error: "Listing ID mismatch" };
    }

    const storedListings = await getStoredListings();
    await chrome.storage.local.set({
      [PARSED_LISTINGS_BY_ID_STORAGE_KEY]: {
        ...storedListings,
        [listingId]: copyPayload(payload),
      },
      [ACTIVE_PARSED_LISTING_ID_STORAGE_KEY]: listingId,
    });
    await chrome.storage.local.remove(PARSED_LISTING_STORAGE_KEY);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown storage error";
    return { ok: false, error: message };
  }
}

/**
 * Read parsed listing from chrome.storage.local by ID, or read the active listing.
 */
export async function getParsedListing(listingId?: string): Promise<GetResult> {
  if (!hasChromeStorage()) {
    return { ok: false, error: "Storage not available" };
  }
  try {
    const out = await chrome.storage.local.get([
      ACTIVE_PARSED_LISTING_ID_STORAGE_KEY,
      PARSED_LISTINGS_BY_ID_STORAGE_KEY,
    ]);
    const activeListingId = out[ACTIVE_PARSED_LISTING_ID_STORAGE_KEY];
    const requestedListingId =
      listingId ?? (typeof activeListingId === "string" ? activeListingId : "");
    if (!requestedListingId) {
      return { ok: false, error: "No active parsed listing stored" };
    }

    const rawListings = out[PARSED_LISTINGS_BY_ID_STORAGE_KEY];
    const storedListings = isRecord(rawListings)
      ? (rawListings as StoredParsedListings)
      : {};
    const value = validatePayload(
      storedListings[requestedListingId],
      requestedListingId,
    );
    if (!value) {
      return { ok: false, error: "Stored listing ID mismatch" };
    }

    return { ok: true, value: copyPayload(value) };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown storage error";
    return { ok: false, error: message };
  }
}

/**
 * Remove parsed listing from storage. Without an ID, clears every parsed listing.
 */
export async function clearParsedListing(
  listingId?: string,
): Promise<ClearResult> {
  if (!hasChromeStorage()) {
    return { ok: false, error: "Storage not available" };
  }
  try {
    if (!listingId) {
      await chrome.storage.local.remove([
        PARSED_LISTING_STORAGE_KEY,
        ACTIVE_PARSED_LISTING_ID_STORAGE_KEY,
        PARSED_LISTINGS_BY_ID_STORAGE_KEY,
      ]);
      return { ok: true };
    }

    const out = await chrome.storage.local.get([
      ACTIVE_PARSED_LISTING_ID_STORAGE_KEY,
      PARSED_LISTINGS_BY_ID_STORAGE_KEY,
    ]);
    const rawListings = out[PARSED_LISTINGS_BY_ID_STORAGE_KEY];
    const storedListings = isRecord(rawListings)
      ? (rawListings as StoredParsedListings)
      : {};
    const { [listingId]: _removed, ...remainingListings } = storedListings;
    const activeListingId = out[ACTIVE_PARSED_LISTING_ID_STORAGE_KEY];
    await chrome.storage.local.set({
      [PARSED_LISTINGS_BY_ID_STORAGE_KEY]: remainingListings,
    });
    if (activeListingId === listingId) {
      await chrome.storage.local.remove(ACTIVE_PARSED_LISTING_ID_STORAGE_KEY);
    }
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown storage error";
    return { ok: false, error: message };
  }
}
