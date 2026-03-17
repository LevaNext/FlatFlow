/**
 * Selectors used to detect when listing page content is ready for scraping.
 * Add new selectors here when extending parsers so the wait logic automatically
 * waits for them. At least one selector must match for the page to be considered ready.
 */

import type { SiteId } from "@/parsing";

/** Key DOM selectors that indicate listing content is rendered (myhome.ge). */
const MYHOME_READY_SELECTORS = [
  // Title
  "h3.font-tbcx-bold",
  "h1.d-title",
  ".detail-title",
  // Price
  "#currency-switcher",
  ".currency-gel",
  ".d-price",
  ".detail-price",
  "div.flex.text-2xl.font-tbcx-bold",
  "div.flex.font-tbcx-bold",
  // Gallery / images
  ".swiper-slide img",
  ".swiper-zoom-container img",
  ".detail-gallery img",
  ".gallery-slider img",
  ".detail-content img",
  // Address / meta (optional but indicate content loaded)
  "div.flex.items-center.gap-2.mt-2 span",
];

/** Key DOM selectors for ss.ge (placeholder for future). */
const SS_READY_SELECTORS: string[] = [];

export const LISTING_READY_SELECTORS: Record<SiteId, string[]> = {
  myhome: MYHOME_READY_SELECTORS,
  ss: SS_READY_SELECTORS,
  unsupported: [],
};
