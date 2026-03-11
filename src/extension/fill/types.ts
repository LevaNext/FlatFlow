/**
 * Types for statement form fill. Uses listing data shape (price, imageUrls) from parsing/storage.
 */

import type { ListingPrice } from "@/types/listing";

/** Payload passed to site-specific statement form fillers. */
export interface StatementFormPayload {
  price?: ListingPrice;
  imageUrls?: string[];
  /** Status from listing (e.g. "ახალი აშენებული"). Matched to form option and selected if included. */
  status?: string;
  /** Condition from listing (e.g. "ახალი გარემონტებული"). Matched to [data-test-id="select-condition"] and selected if included. */
  condition?: string;
  /** Location in ka/en/ru (from title last word, default Tbilisi). Filled into [data-test-id="input-location"] using lang. */
  location?: { ka: string; en: string; ru: string };
  /** Detected website language for location display (ka | en | ru). */
  lang?: "ka" | "en" | "ru";
  /** Listing title; used to derive location when location is not set. */
  title?: string;
}
