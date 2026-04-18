/**
 * Selector groups for {@link waitForPageReady} in allMatchedSettle mode: each string is one group;
 * commas inside a string mean OR. We only wait for the listing shell (title + price row), not gallery
 * or the rest of the page, so parsing can start without waiting for full lazy load.
 */

import type { SiteId } from "@/parsing";

/** Groups aligned with getTitle / getPrice (myhome.ge). All groups must match before scrape. */
const MYHOME_READY_SELECTORS = [
  "h3.font-tbcx-bold, h1.d-title, .detail-title",
  "#currency-switcher, .currency-gel, .d-price, .detail-price, div.flex.text-2xl.font-tbcx-bold, div.flex.font-tbcx-bold",
];

/** Key DOM selectors for ss.ge (placeholder for future). */
const SS_READY_SELECTORS: string[] = [];

export const LISTING_READY_SELECTORS: Record<SiteId, string[]> = {
  myhome: MYHOME_READY_SELECTORS,
  ss: SS_READY_SELECTORS,
  unsupported: [],
};
