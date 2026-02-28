/**
 * Content script: runs on myhome.ge, ss.ge, and statements.myhome.ge.
 * - Listing pages: responds to parse requests.
 * - Statement create page: fills price and currency from stored parsed data.
 */

import { MESSAGE_PARSE_LISTING } from "@/extension/messages";
import { detectSite, type SiteId } from "@/parsing";
import { parseListing } from "@/parsing";

const PARSED_LISTING_KEY = "parsedListing";

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

function fillStatementFormFromStorage(): void {
  if (typeof chrome === "undefined" || !chrome.storage?.local) return;
  chrome.storage.local.get(PARSED_LISTING_KEY, (result: Record<string, unknown>) => {
    const payload = result[PARSED_LISTING_KEY] as
      | { data?: { price?: { amount: number; currency: "GEL" | "USD" } } }
      | undefined;
    const price = payload?.data?.price;
    if (!price) return;

    const totalPriceInput = document.getElementById("total_price") as
      | HTMLInputElement
      | null;
    if (totalPriceInput) {
      totalPriceInput.value = String(price.amount);
      totalPriceInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    const wantGel = price.currency === "GEL";
    const all = document.querySelectorAll("*");
    for (const el of all) {
      const text = el.textContent?.trim();
      if (text === "₾" && wantGel) {
        (el as HTMLElement).click();
        break;
      }
      if (text === "$" && !wantGel) {
        (el as HTMLElement).click();
        break;
      }
    }
  });
}

if (isStatementCreatePage()) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(fillStatementFormFromStorage, 500);
    });
  } else {
    setTimeout(fillStatementFormFromStorage, 500);
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
        sendResponse({ listing: null, errors: [], error: "Unsupported website" });
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

      const { listing, errors } = parseListing("myhome", document);
      sendResponse({
        listing,
        errors,
        ...(listing ? {} : { error: "Failed to parse listing" }),
      });
      return true;
    },
  );
}
