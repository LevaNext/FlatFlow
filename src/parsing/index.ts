/**
 * Parsing entry point. Responsibility: detect site and parse listing data from DOM.
 * No upload, autofill, or form submission logic.
 */

import type { ListingData, ListingSource } from "@/types/listing";
import type { ParserError } from "@/types/parser";
import { parseMyHomeListing } from "./myhome/myhome.parser";
import { parseSsListing } from "./ss/ss.parser";

export type SiteId = import("./detectors/siteDetector").SiteId;

export interface ParseListingResult {
  listing: ListingData | null;
  errors: ParserError[];
}

/**
 * Run the parser for the given site. Returns partial data and all parsing errors.
 */
export function parseListing(
  source: ListingSource,
  doc: Document,
): ParseListingResult {
  if (source === "ss") {
    const { errors } = parseSsListing(doc);
    return { listing: null, errors };
  }

  if (source !== "myhome") {
    return { listing: null, errors: [] };
  }

  try {
    const { data, errors } = parseMyHomeListing(doc);
    const listing: ListingData = {
      source: "myhome",
      ...(data.title !== undefined && { title: data.title }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.imageUrls !== undefined && { imageUrls: data.imageUrls }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.condition !== undefined && { condition: data.condition }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.lang !== undefined && { lang: data.lang }),
    };
    return { listing, errors };
  } catch {
    return {
      listing: null,
      errors: [
        { code: "PARSE_FAILED", message: "Parser threw an unexpected error." },
      ],
    };
  }
}

export { detectSite } from "./detectors/siteDetector";
export { parseMyHomeListing } from "./myhome/myhome.parser";
export { parseSsListing } from "./ss/ss.parser";
