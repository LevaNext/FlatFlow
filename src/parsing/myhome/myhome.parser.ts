import { getLocationFromTitle } from "@/data/locations";
import type { ListingData } from "@/types/listing";
import type { ParserError, ParserOutput } from "@/types/parser";
import { getAddress } from "./selectors/getAddress";
import { getCondition } from "./selectors/getCondition";
import { getImage, getImages } from "./selectors/getImage";
import { getListingAttributes } from "./selectors/getListingAttributes";
import { getListingMeta } from "./selectors/getListingMeta";
import { getPageLang } from "./selectors/getPageLang";
import { getPrice } from "./selectors/getPrice";
import { getStatus } from "./selectors/getStatus";
import { getTitle } from "./selectors/getTitle";

const SOURCE: ListingData["source"] = "myhome";

function toParserError(result: {
  ok: false;
  error: { code: string; message: string };
}): ParserError {
  return { code: result.error.code, message: result.error.message };
}

function applyTitle(
  data: Partial<ListingData>,
  errors: ParserError[],
  doc: Document,
): void {
  const result = getTitle(doc);
  if (result.ok) {
    data.title = result.value;
    data.location = getLocationFromTitle(result.value);
  } else errors.push(toParserError(result));
}

function applyImages(
  data: Partial<ListingData>,
  errors: ParserError[],
  doc: Document,
): void {
  const imageUrls = getImages(doc);
  if (imageUrls.length > 0) {
    data.imageUrls = imageUrls;
    data.imageUrl = imageUrls[0];
  }
  const imageResult = getImage(doc);
  if (imageResult.ok) {
    data.imageUrl = data.imageUrl ?? imageResult.value;
    if (!data.imageUrls?.length) data.imageUrls = [imageResult.value];
  } else if (imageUrls.length === 0) {
    errors.push(toParserError(imageResult));
  }
}

function applyPrice(
  data: Partial<ListingData>,
  errors: ParserError[],
  doc: Document,
): void {
  const result = getPrice(doc);
  if (result.ok) {
    data.price = {
      amount: result.value.amount,
      currency: result.value.currency,
    };
  } else {
    errors.push(toParserError(result));
  }
}

function applyAddress(data: Partial<ListingData>, doc: Document): void {
  const result = getAddress(doc);
  if (result.ok) data.address = result.value;
}

function applyMeta(data: Partial<ListingData>, doc: Document): void {
  const result = getListingMeta(doc);
  if (!result.ok) return;
  const meta = result.value;
  if (meta.listedAt != null) data.listedAt = meta.listedAt;
  if (meta.views != null) data.views = meta.views;
  if (meta.id != null) data.id = meta.id;
}

function applyAttrs(data: Partial<ListingData>, doc: Document): void {
  const result = getListingAttributes(doc);
  if (!result.ok) return;
  const attrs = result.value;
  if (attrs.area != null) data.area = attrs.area;
  if (attrs.rooms != null) data.rooms = attrs.rooms;
  if (attrs.floor != null) data.floor = attrs.floor;
}

function applyStatus(data: Partial<ListingData>, doc: Document): void {
  const result = getStatus(doc);
  if (result.ok && result.value.trim().length > 0) {
    data.status = result.value.trim();
  }
}

function applyCondition(data: Partial<ListingData>, doc: Document): void {
  const result = getCondition(doc);
  if (result.ok && result.value.trim().length > 0) {
    data.condition = result.value.trim();
  }
}

function applyLang(data: Partial<ListingData>, doc: Document): void {
  data.lang = getPageLang(doc);
}

/**
 * Parses myhome.ge listing from the document. Only reads DOM; no upload or form logic.
 * Aggregates successful values and collects errors. Continues even if one selector fails.
 */
export function parseMyHomeListing(doc: Document): ParserOutput<ListingData> {
  const data: Partial<ListingData> = { source: SOURCE };
  const errors: ParserError[] = [];

  applyTitle(data, errors, doc);
  applyImages(data, errors, doc);
  applyPrice(data, errors, doc);
  applyAddress(data, doc);
  applyMeta(data, doc);
  applyAttrs(data, doc);
  applyStatus(data, doc);
  applyCondition(data, doc);
  applyLang(data, doc);

  return { data, errors };
}
