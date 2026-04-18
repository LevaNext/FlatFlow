import { matchDealTypeLabelFromTitle } from "@/data/dealTypes";
import { getLocationFromTitle } from "@/data/locations";
import { matchPropertyTypeLabelFromTitle } from "@/data/propertyTypes";
import type { ListingData } from "@/types/listing";
import type { ParserError, ParserOutput } from "@/types/parser";
import { getAddress } from "./selectors/getAddress";
import { getCondition } from "./selectors/getCondition";
import { getImage, getImages } from "./selectors/getImage";
import { getListingAttributes } from "./selectors/getListingAttributes";
import { getListingMeta } from "./selectors/getListingMeta";
import { getPageLang } from "./selectors/getPageLang";
import { getPrice } from "./selectors/getPrice";
import { getProjectType } from "./selectors/getProjectType";
import { getPropertyType } from "./selectors/getPropertyType";
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
    applyPropertyType(data);
    applyDealType(data);
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
  if (result.ok) {
    data.address = result.value.address;
    if (result.value.subway) data.subway = result.value.subway;
  }
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
  if (attrs.beds != null) data.beds = attrs.beds;
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

function applyProjectType(data: Partial<ListingData>, doc: Document): void {
  const result = getProjectType(doc);
  if (result.ok && result.value.trim().length > 0) {
    data.projectType = result.value.trim();
  }
}

/** Set propertyType from title: store the exact label from JSON (ka/en/ru). See docs/PROPERTY_TYPE_FROM_TITLE.md. */
function applyPropertyType(data: Partial<ListingData>): void {
  if (!data.title) return;
  const label = matchPropertyTypeLabelFromTitle(data.title);
  if (label) {
    data.propertyType = label;
    if (typeof console !== "undefined") {
      console.log(
        "[FlatFlow] propertyType from title:",
        JSON.stringify(label),
        "| title:",
        data.title.slice(0, 60) + (data.title.length > 60 ? "…" : ""),
      );
    }
  }
}

/** Set dealType from title: store the exact label from JSON (ka/en/ru), e.g. "იყიდება", "ქირავდება". */
function applyDealType(data: Partial<ListingData>): void {
  if (!data.title) return;
  const label = matchDealTypeLabelFromTitle(data.title);
  if (label) {
    data.dealType = label;
    if (typeof console !== "undefined") {
      console.log(
        "[FlatFlow] dealType from title:",
        JSON.stringify(label),
        "| title:",
        data.title.slice(0, 60) + (data.title.length > 60 ? "…" : ""),
      );
    }
  }
}

function applyLang(data: Partial<ListingData>, doc: Document): void {
  data.lang = getPageLang(doc);
}

/** DOM row/chips override when present; title-based value may already be set from {@link applyTitle}. */
function applyPropertyTypeFromDom(
  data: Partial<ListingData>,
  doc: Document,
): void {
  const result = getPropertyType(doc);
  if (result.ok && result.value.trim().length > 0) {
    data.propertyType = result.value.trim();
  }
}

/** Ordered phases: one step per `selectors/get*.ts` reader (+ title), for listing-tab progress UI. */
export const MYHOME_PARSE_PROGRESS_PHASE_ORDER = [
  "title",
  "propertyType",
  "images",
  "price",
  "address",
  "listingMeta",
  "listingAttributes",
  "status",
  "condition",
  "projectType",
  "pageLang",
] as const;

export type MyHomeParseProgressPhase =
  (typeof MYHOME_PARSE_PROGRESS_PHASE_ORDER)[number];

const MYHOME_PHASES: {
  phase: MyHomeParseProgressPhase;
  run: (
    data: Partial<ListingData>,
    errors: ParserError[],
    doc: Document,
  ) => void;
}[] = [
  { phase: "title", run: (d, e, doc) => applyTitle(d, e, doc) },
  {
    phase: "propertyType",
    run: (d, _e, doc) => applyPropertyTypeFromDom(d, doc),
  },
  { phase: "images", run: (d, e, doc) => applyImages(d, e, doc) },
  { phase: "price", run: (d, e, doc) => applyPrice(d, e, doc) },
  {
    phase: "address",
    run: (d, _e, doc) => {
      applyAddress(d, doc);
    },
  },
  {
    phase: "listingMeta",
    run: (d, _e, doc) => {
      applyMeta(d, doc);
    },
  },
  {
    phase: "listingAttributes",
    run: (d, _e, doc) => {
      applyAttrs(d, doc);
    },
  },
  {
    phase: "status",
    run: (d, _e, doc) => {
      applyStatus(d, doc);
    },
  },
  {
    phase: "condition",
    run: (d, _e, doc) => {
      applyCondition(d, doc);
    },
  },
  {
    phase: "projectType",
    run: (d, _e, doc) => {
      applyProjectType(d, doc);
    },
  },
  {
    phase: "pageLang",
    run: (d, _e, doc) => {
      applyLang(d, doc);
    },
  },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parses myhome.ge listing from the document. Only reads DOM; no upload or form logic.
 * Aggregates successful values and collects errors. Continues even if one selector fails.
 */
export function parseMyHomeListing(doc: Document): ParserOutput<ListingData> {
  const data: Partial<ListingData> = { source: SOURCE };
  const errors: ParserError[] = [];
  for (const { run } of MYHOME_PHASES) run(data, errors, doc);
  return { data, errors };
}

/**
 * Same as {@link parseMyHomeListing} but invokes `beforePhase` before each stage and
 * optionally waits `settleMs` after each run so the page overlay can update between steps.
 */
export async function parseMyHomeListingPhased(
  doc: Document,
  options: {
    beforePhase: (phase: MyHomeParseProgressPhase) => void | Promise<void>;
    settleMs?: number;
  },
): Promise<ParserOutput<ListingData>> {
  const data: Partial<ListingData> = { source: SOURCE };
  const errors: ParserError[] = [];
  const settleMs = options.settleMs ?? 120;
  for (const { phase, run } of MYHOME_PHASES) {
    await options.beforePhase(phase);
    run(data, errors, doc);
    if (settleMs > 0) await delay(settleMs);
  }
  return { data, errors };
}
