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
  /** Project type from listing (e.g. "არასტანდარტული"). Filled into project type select (label "აირჩიეთ პროექტის ტიპი") like location. */
  projectType?: string;
  /** Location in ka/en/ru (from title last word, default Tbilisi). Filled into [data-test-id="input-location"] using lang. */
  location?: { ka: string; en: string; ru: string };
  /** Full address or street (e.g. "გურამიშვილის გამზ. 62ბ"). Filled into [data-test-id="input-street"]. */
  address?: string;
  /** Subway / metro station name if present (e.g. "ღრმაღელე"). */
  subway?: string;
  /** Detected website language for location display (ka | en | ru). */
  lang?: "ka" | "en" | "ru";
  /** Listing title; used to derive location when location is not set. */
  title?: string;
  /** Area in m². Filled into area input (label "ფართი"). */
  area?: number;
  /** Number of rooms. Selected via click on matching option (1–10+). */
  rooms?: number;
  /** Number of bedrooms. Filled into bedroom control if present. */
  beds?: number;
  /** Floor as "current/total" (e.g. "7/15"). Filled into სართული and სართულები სულ inputs. */
  floor?: string;
}
