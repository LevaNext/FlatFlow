/**
 * Parsing entry point. Responsibility: detect site and parse listing data from DOM.
 * No upload, autofill, or form submission logic.
 */

import type { ListingData, ListingSource } from "@/types/listing";
import type { ParserError, ParserOutput } from "@/types/parser";
import {
  type MyHomeParseProgressPhase,
  parseMyHomeListing,
  parseMyHomeListingPhased,
} from "./myhome/myhome.parser";
import { parseSsListing } from "./ss/ss.parser";

export type SiteId = import("./detectors/siteDetector").SiteId;

export interface ParseListingResult {
  listing: ListingData | null;
  errors: ParserError[];
}

const MYHOME_SOURCE: ListingData["source"] = "myhome";

function buildListingFromMyHomeData(
  data: ParserOutput<ListingData>["data"],
): ListingData {
  const optional = (key: keyof ListingData, value: unknown) =>
    value === undefined ? {} : { [key]: value };
  return {
    source: MYHOME_SOURCE,
    ...optional("title", data.title),
    ...optional("price", data.price),
    ...optional("imageUrl", data.imageUrl),
    ...optional("imageUrls", data.imageUrls),
    ...optional("status", data.status),
    ...optional("condition", data.condition),
    ...optional("projectType", data.projectType),
    ...optional("propertyType", data.propertyType),
    ...optional("dealType", data.dealType),
    ...optional("location", data.location),
    ...optional("address", data.address),
    ...optional("subway", data.subway),
    ...optional("lang", data.lang),
    ...optional("area", data.area),
    ...optional("rooms", data.rooms),
    ...optional("beds", data.beds),
    ...optional("floor", data.floor),
  };
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
    return { listing: buildListingFromMyHomeData(data), errors };
  } catch {
    return {
      listing: null,
      errors: [
        { code: "PARSE_FAILED", message: "Parser threw an unexpected error." },
      ],
    };
  }
}

/**
 * MyHome listing parse with optional async hooks between DOM-read phases (for content-script UI).
 */
export async function parseMyHomeListingTabResultPhased(
  doc: Document,
  options: {
    beforePhase: (phase: MyHomeParseProgressPhase) => void | Promise<void>;
    settleMs?: number;
  },
): Promise<ParseListingResult> {
  try {
    const { data, errors } = await parseMyHomeListingPhased(doc, {
      beforePhase: options.beforePhase,
      settleMs: options.settleMs,
    });
    return { listing: buildListingFromMyHomeData(data), errors };
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
export type { MyHomeParseProgressPhase } from "./myhome/myhome.parser";
export {
  parseMyHomeListing,
  parseMyHomeListingPhased,
} from "./myhome/myhome.parser";
export { parseSsListing } from "./ss/ss.parser";
