import type { ListingData } from "@/types/listing";
import type { ParserOutput } from "@/types/parser";

const NOT_SUPPORTED_MESSAGE = "Not supported yet";

/**
 * Placeholder for ss.ge. No parsing implemented. No upload or form logic.
 */
export function parseSsListing(_doc: Document): ParserOutput<ListingData> {
  return {
    data: { source: "ss" },
    errors: [
      { code: "SS_NOT_IMPLEMENTED", message: NOT_SUPPORTED_MESSAGE },
    ],
  };
}
