/**
 * Content script: runs on myhome.ge, ss.ge, and statements.myhome.ge.
 * - Listing pages: responds to parse requests.
 * - Statement create page: reads stored listing and delegates to site-specific fill (myhome / ss).
 */

import { fillMyHomeStatementForm } from "@/extension/fill/myhome";
import { fillSsStatementForm } from "@/extension/fill/ss";
import type { StatementFormPayload } from "@/extension/fill/types";
import { LISTING_READY_SELECTORS } from "@/extension/listingReadySelectors";
import { MESSAGE_PARSE_LISTING } from "@/extension/messages";
import { waitForPageReady } from "@/extension/waitForPageReady";
import { detectSite, parseListing, type SiteId } from "@/parsing";
import { PARSED_LISTING_STORAGE_KEY } from "@/storage/parsedListingStorage";

const LOG = (msg: string, ...args: unknown[]) =>
  console.log("[FlatFlow]", msg, ...args);

function isStatementCreatePage(): boolean {
  try {
    const u = new URL(window.location.href);
    return (
      u.hostname === "statements.myhome.ge" &&
      u.pathname.includes("/statement/create")
    );
  } catch {
    return false;
  }
}

/**
 * Which site this statement create page belongs to. Used to delegate to the right filler.
 */
function getStatementPageSite(): "myhome" | "ss" | null {
  try {
    const host = new URL(window.location.href).hostname.toLowerCase();
    if (host === "statements.myhome.ge") return "myhome";
    if (host === "statements.ss.ge") return "ss";
    return null;
  } catch {
    return null;
  }
}

function runFillFromStorage(): void {
  LOG("runFillFromStorage started");
  if (typeof chrome === "undefined" || !chrome.storage?.local) {
    LOG("no chrome.storage.local, aborting");
    return;
  }
  const site = getStatementPageSite();
  if (!site) {
    LOG("not a known statement page, skipping fill");
    return;
  }
  chrome.storage.local.get(
    PARSED_LISTING_STORAGE_KEY,
    (result: Record<string, unknown>) => {
      const payload = result[PARSED_LISTING_STORAGE_KEY] as
        | { data?: StatementFormPayload }
        | undefined;
      LOG(
        "stored payload:",
        payload
          ? {
              hasPrice: !!payload?.data?.price,
              hasImageUrls: !!payload?.data?.imageUrls,
              imageUrlsLength: payload?.data?.imageUrls?.length ?? 0,
            }
          : "missing",
      );
      const data = payload?.data ?? {};
      if (site === "myhome") {
        fillMyHomeStatementForm(data);
      } else {
        fillSsStatementForm(data);
      }
    },
  );
}

if (isStatementCreatePage()) {
  LOG("statement create page detected, will fill form in 500ms");
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(runFillFromStorage, 500);
    });
  } else {
    setTimeout(runFillFromStorage, 500);
  }
} else {
  type ParseListingResponse = {
    listing: import("@/types/listing").ListingData | null;
    errors: import("@/types/parser").ParserError[];
    error?: string;
  };

  chrome.runtime.onMessage.addListener(
    (
      message: { type: string },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: ParseListingResponse) => void,
    ) => {
      if (message.type !== MESSAGE_PARSE_LISTING) return;

      const site: SiteId = detectSite(window.location.href);

      if (site === "unsupported") {
        sendResponse({
          listing: null,
          errors: [],
          error: "Unsupported website",
        });
        return true;
      }

      if (site === "ss") {
        sendResponse({
          listing: null,
          errors: [],
          error: "SS.ge support is coming soon",
        });
        return true;
      }

      const selectors = LISTING_READY_SELECTORS[site] ?? [];
      void waitForPageReady(document, {
        selectors,
        debounceMs: 900,
        timeoutMs: 30_000,
      }).then(() => {
        const { listing, errors } = parseListing("myhome", document);
        sendResponse({
          listing,
          errors,
          ...(listing ? {} : { error: "Failed to parse listing" }),
        });
      });
      return true;
    },
  );
}
