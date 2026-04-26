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
  /** Internal FlatFlow listing identifier. Generated for every parse and used to scope storage/uploads. */
  listingId: string;
  title?: string;
  /** Public listing description text. Used to prefill statement form description. */
  description?: string;
  price?: ListingPrice;
  imageUrl?: string;
  /** All gallery image URLs (full-size). Used for statement form photo upload. */
  imageUrls?: string[];
  source: ListingSource;
  /** Full address or street (e.g. "გურამიშვილის გამზ. 62ბ"). */
  address?: string;
  /** Subway / metro station name if present (e.g. "ღრმაღელე"). */
  subway?: string;
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
  /** Status from listing (e.g. "ახალი აშენებული"). Used to prefill statement form. */
  status?: string;
  /** Condition from listing (e.g. "ახალი გარემონტებული"). Used to prefill statement form. */
  condition?: string;
  /** Project type from listing (e.g. "არასტანდარტული"). Used to prefill statement form. */
  projectType?: string;
  /** Real estate type label from title (exact text from propertyTypes: ka/en/ru, e.g. "კერძო სახლი"). */
  propertyType?: string;
  /** Deal type label from title (exact text from dealTypes: ka/en/ru, e.g. "იყიდება", "ქირავდება"). */
  dealType?: string;
  /** Location derived from title (last word), in ka/en/ru. Default Tbilisi if not in list. */
  location?: { ka: string; en: string; ru: string };
  /** Website language when listing was parsed (ka | en | ru). Saved and used for location display. */
  lang?: "ka" | "en" | "ru";
}
