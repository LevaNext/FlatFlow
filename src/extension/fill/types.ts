/**
 * Types for statement form fill. Uses listing data shape (price, imageUrls) from parsing/storage.
 */

import type { ListingPrice } from "@/types/listing";

/** Payload passed to site-specific statement form fillers. */
export interface StatementFormPayload {
  price?: ListingPrice;
  imageUrls?: string[];
}
