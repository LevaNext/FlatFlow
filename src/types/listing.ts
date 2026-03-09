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
  /** All gallery image URLs (full-size). Used for statement form photo upload. */
  imageUrls?: string[];
  source: ListingSource;
  /** Full address or street (e.g. "ვაჟა-ფშაველას გამზირი"). */
  address?: string;
  /** Number of rooms. */
  rooms?: number;
  /** Number of beds. */
  beds?: number;
  /** Area in m². */
  area?: number;
  /** District or neighborhood (e.g. "საბურთალო"). */
  district?: string;
  /** Floor info (e.g. "19/25" for floor 19 of 25). */
  floor?: string;
  /** View count. */
  views?: number;
  /** Listing date/time (ISO string, timestamp, or display string e.g. "დღეს 19:43-ზე"). */
  listedAt?: string | number;
  /** Listing ID on the source site (e.g. "23746578"). */
  id?: string;
}
