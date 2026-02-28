/**
 * Shared listing data from parsing. Used only for reading/display.
 * Upload and form logic must not depend on this; it is the output of parsing only.
 */

export type ListingSource = "myhome" | "ss";

export interface ListingPrice {
  amount: number;
  currency: "GEL" | "USD";
}

export interface ListingData {
  title?: string;
  price?: ListingPrice;
  imageUrl?: string;
  source: ListingSource;
}
