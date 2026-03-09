import type { ListingData } from "@/types/listing";
import type { ParserError, ParserOutput } from "@/types/parser";
import { getAddress } from "./selectors/getAddress";
import { getImage, getImages } from "./selectors/getImage";
import { getListingAttributes } from "./selectors/getListingAttributes";
import { getListingMeta } from "./selectors/getListingMeta";
import { getPrice } from "./selectors/getPrice";
import { getTitle } from "./selectors/getTitle";

const SOURCE: ListingData["source"] = "myhome";

function toParserError(result: {
  ok: false;
  error: { code: string; message: string };
}): ParserError {
  return { code: result.error.code, message: result.error.message };
}

/**
 * Parses myhome.ge listing from the document. Only reads DOM; no upload or form logic.
 * Aggregates successful values and collects errors. Continues even if one selector fails.
 */
export function parseMyHomeListing(doc: Document): ParserOutput<ListingData> {
  const data: Partial<ListingData> = { source: SOURCE };
  const errors: ParserError[] = [];

  const titleResult = getTitle(doc);
  if (titleResult.ok) {
    data.title = titleResult.value;
  } else {
    errors.push(toParserError(titleResult));
  }

  const imageResult = getImage(doc);
  const imageUrls = getImages(doc);
  if (imageUrls.length > 0) {
    data.imageUrls = imageUrls;
    data.imageUrl = imageUrls[0];
  }
  if (imageResult.ok) {
    data.imageUrl = data.imageUrl ?? imageResult.value;
    if (!data.imageUrls?.length) data.imageUrls = [imageResult.value];
  } else if (imageUrls.length === 0) {
    errors.push(toParserError(imageResult));
  }

  const priceResult = getPrice(doc);
  if (priceResult.ok) {
    data.price = {
      amount: priceResult.value.amount,
      currency: priceResult.value.currency,
    };
  } else {
    errors.push(toParserError(priceResult));
  }

  const addressResult = getAddress(doc);
  if (addressResult.ok) {
    data.address = addressResult.value;
  }

  const metaResult = getListingMeta(doc);
  if (metaResult.ok) {
    const meta = metaResult.value;
    if (meta.listedAt != null) data.listedAt = meta.listedAt;
    if (meta.views != null) data.views = meta.views;
    if (meta.id != null) data.id = meta.id;
  }

  const attrsResult = getListingAttributes(doc);
  if (attrsResult.ok) {
    const attrs = attrsResult.value;
    if (attrs.area != null) data.area = attrs.area;
    if (attrs.rooms != null) data.rooms = attrs.rooms;
    if (attrs.floor != null) data.floor = attrs.floor;
  }

  return { data, errors };
}
