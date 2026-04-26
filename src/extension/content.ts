/**
 * Content script: runs on myhome.ge, ss.ge, and statements.myhome.ge.
 * - Listing pages: responds to parse requests.
 * - Statement create page: reads stored listing and delegates to site-specific fill (myhome / ss).
 */

import {
  detectStatementPageLang,
  fillMyHomeStatementForm,
} from "@/extension/fill/myhome";
import { fillSsStatementForm } from "@/extension/fill/ss";
import type { StatementFormPayload } from "@/extension/fill/types";
import { LISTING_READY_SELECTORS } from "@/extension/listingReadySelectors";
import {
  MESSAGE_PARSE_LISTING,
  STORAGE_KEY_ACTIVE_FILL_LISTING_ID,
  STORAGE_KEY_STATEMENT_FILL_ACTIVE,
} from "@/extension/messages";
import { createParseListingProgressOverlay } from "@/extension/parseListingProgressOverlay";
import { createStatementFillOverlay } from "@/extension/statementFillOverlay";
import { waitForPageReady } from "@/extension/waitForPageReady";
import {
  detectSite,
  parseMyHomeListingTabResultPhased,
  type SiteId,
} from "@/parsing";
import {
  getPageLang,
  type PageLang,
} from "@/parsing/myhome/selectors/getPageLang";
import { MYHOME_GE, SS_GE } from "@/shared/constants";
import { getParsedListing } from "@/storage/parsedListingStorage";

const LOG = (msg: string, ...args: unknown[]) =>
  console.log("[FlatFlow]", msg, ...args);

LOG("content script loaded on", globalThis.location.href);

/** One listing parse at a time so overlapping messages cannot stack multiple overlays (darker scrim). */
let myhomeListingParseQueue: Promise<void> = Promise.resolve();
let statementFillCancelled = false;

function getStatementFillSession(): Promise<{
  active: boolean;
  listingId?: string;
}> {
  if (typeof chrome === "undefined" || !chrome.storage?.local) {
    return Promise.resolve({ active: false });
  }
  return chrome.storage.local
    .get([
      STORAGE_KEY_STATEMENT_FILL_ACTIVE,
      STORAGE_KEY_ACTIVE_FILL_LISTING_ID,
    ])
    .then((result) => ({
      active: result[STORAGE_KEY_STATEMENT_FILL_ACTIVE] === true,
      listingId:
        typeof result[STORAGE_KEY_ACTIVE_FILL_LISTING_ID] === "string"
          ? result[STORAGE_KEY_ACTIVE_FILL_LISTING_ID]
          : undefined,
    }));
}

function watchStatementFillCancellation(): void {
  if (typeof chrome === "undefined" || !chrome.storage?.onChanged) return;
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    const activeChange = changes[STORAGE_KEY_STATEMENT_FILL_ACTIVE];
    if (activeChange?.newValue === false) {
      statementFillCancelled = true;
      LOG("statement fill cancelled because extension closed");
    }
  });
}

function isStatementCreatePage(): boolean {
  try {
    const u = new URL(globalThis.location.href);
    if (
      u.hostname === MYHOME_GE.statementHost &&
      u.pathname.includes("/statement/create")
    ) {
      return true;
    }
    if (
      u.hostname === SS_GE.statementHost &&
      u.pathname.includes("/udzravi-qoneba/create")
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Which site this statement create page belongs to. Used to delegate to the right filler.
 */
function getStatementPageSite(): "myhome" | "ss" | null {
  try {
    const host = new URL(globalThis.location.href).hostname.toLowerCase();
    console.log("getStatementPageSite", host);
    if (host === MYHOME_GE.statementHost) return "myhome";
    if (host === SS_GE.statementHost) return "ss";
    return null;
  } catch {
    return null;
  }
}

async function runFillFromStorage(): Promise<void> {
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

  const session = await getStatementFillSession();
  if (!session.active) {
    LOG("statement fill inactive, skipping");
    return;
  }
  statementFillCancelled = false;

  const stored = await getParsedListing();
  if (!stored.ok) {
    LOG("no active listing payload, skipping fill:", stored.error);
    return;
  }

  const payload = stored.value;
  if (payload.data.listingId !== payload.meta.listingId) {
    LOG("listing ID mismatch in stored payload, skipping fill", {
      dataListingId: payload.data.listingId,
      metaListingId: payload.meta.listingId,
    });
    return;
  }
  if (
    session.listingId != null &&
    payload.data.listingId !== session.listingId
  ) {
    LOG("stored listing does not match active fill session, skipping", {
      activeListingId: session.listingId,
      payloadListingId: payload.data.listingId,
    });
    return;
  }

  const shouldContinue = () => !statementFillCancelled;
  const data: StatementFormPayload = { ...payload.data, shouldContinue };
  LOG("stored payload:", {
    listingId: data.listingId,
    hasPrice: !!data.price,
    hasDescription: !!data.description?.trim(),
    hasImageUrls: !!data.imageUrls,
    imageUrlsLength: data.imageUrls?.length ?? 0,
    status: data.status,
    condition: data.condition,
    projectType: data.projectType,
    propertyType: data.propertyType,
    dealType: data.dealType,
    location: data.location,
    lang: data.lang,
  });

  if (!shouldContinue()) {
    LOG("statement fill cancelled before start");
    return;
  }

  if (site === "myhome") {
    const overlayLang: PageLang = data.lang ?? detectStatementPageLang();
    const overlay = createStatementFillOverlay(document, overlayLang);
    overlay.show();
    void fillMyHomeStatementForm(data).finally(() => overlay.hide());
  } else {
    const overlayLang: PageLang = data.lang ?? "ka";
    const overlay = createStatementFillOverlay(document, overlayLang);
    overlay.show();
    void fillSsStatementForm(data).finally(() => overlay.hide());
  }
}

if (isStatementCreatePage()) {
  watchStatementFillCancellation();
  LOG("statement create page detected, will fill form in 500ms");
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => void runFillFromStorage(), 500);
    });
  } else {
    setTimeout(() => void runFillFromStorage(), 500);
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

      const site: SiteId = detectSite(globalThis.location.href);

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

      myhomeListingParseQueue = myhomeListingParseQueue
        .catch(() => {})
        .then(async () => {
          const overlay = createParseListingProgressOverlay(
            document,
            getPageLang(document),
          );
          overlay.mount();
          try {
            await waitForPageReady(document, {
              selectors,
              mode: "allMatchedSettle",
              settleMs: 320,
              timeoutMs: 30_000,
              omitOverlay: true,
            });
            const { listing, errors } = await parseMyHomeListingTabResultPhased(
              document,
              {
                beforePhase: async (phase) => {
                  overlay.setStep(phase);
                },
                settleMs: 120,
              },
            );
            overlay.markAllComplete();
            await new Promise((r) => setTimeout(r, 200));
            sendResponse({
              listing,
              errors,
              ...(listing ? {} : { error: "Failed to parse listing" }),
            });
          } catch {
            sendResponse({
              listing: null,
              errors: [],
              error: "Failed to parse listing",
            });
          } finally {
            overlay.destroy();
          }
        });
      return true;
    },
  );
}
