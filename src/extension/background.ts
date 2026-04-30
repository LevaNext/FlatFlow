/**
 * Service worker: side panel on supported sites, image fetch.
 * On supported domain (myhome.ge, ss.ge) → open side panel.
 * Otherwise → open FlatFlow landing page in a new tab (same as “Open FlatFlow” in the side panel).
 */

import { LANDING_PAGE_URL, SUPPORTED_DOMAINS } from "@/shared/constants";
import { clearExpiredParsedListings } from "@/storage/parsedListingStorage";
import {
  MESSAGE_CLOSE_SIDE_PANEL,
  MESSAGE_FETCH_IMAGES,
  MESSAGE_PANEL_CLOSED,
  STORAGE_KEY_ACTIVE_FILL_LISTING_ID,
  STORAGE_KEY_STATEMENT_FILL_ACTIVE,
} from "./messages";

const STORAGE_KEY_SIDE_PANEL_OPEN = "sidePanelOpen";
const PARSED_LISTING_CLEANUP_ALARM = "flatflowParsedListingCleanup";

console.log("[FlatFlow] background loaded");

/** Returns hostname normalized (no www.) or null if unparseable / chrome-internal / empty. */
function getHostname(url: string | undefined): string | null {
  if (url == null || typeof url !== "string" || url.trim() === "") return null;
  const u = url.trim().toLowerCase();
  if (
    u.startsWith("chrome://") ||
    u.startsWith("chrome-extension://") ||
    u === "about:blank"
  )
    return null;
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return null;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: false })
    .catch((err) =>
      console.log(
        "[FlatFlow] setPanelBehavior failed",
        (err as Error)?.message,
      ),
    );
  scheduleParsedListingCleanup();
  void clearExpiredParsedListings();
});

chrome.runtime.onStartup.addListener(() => {
  scheduleParsedListingCleanup();
  void clearExpiredParsedListings();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== PARSED_LISTING_CLEANUP_ALARM) return;
  void clearExpiredParsedListings();
});

function scheduleParsedListingCleanup(): void {
  chrome.alarms.create(PARSED_LISTING_CLEANUP_ALARM, {
    delayInMinutes: 15,
    periodInMinutes: 15,
  });
}

chrome.action.onClicked.addListener((tab) => {
  console.log("[FlatFlow] icon clicked");
  if (!tab?.id) return;

  const rawUrl = tab.url;
  console.log("[FlatFlow] raw tab.url:", rawUrl ?? "(undefined)");

  let hostname: string | null = null;
  try {
    hostname = getHostname(rawUrl);
  } catch {
    hostname = null;
  }
  console.log("[FlatFlow] parsed hostname:", hostname ?? "(none)");

  const isSupported =
    hostname != null &&
    SUPPORTED_DOMAINS.includes(hostname as (typeof SUPPORTED_DOMAINS)[number]);
  if (isSupported) {
    const tabId = tab.id;
    chrome.storage.session.get(STORAGE_KEY_SIDE_PANEL_OPEN, (result) => {
      const isPanelOpen = result?.[STORAGE_KEY_SIDE_PANEL_OPEN] === true;
      if (isPanelOpen) {
        console.log("[FlatFlow] panel close requested");
        chrome.runtime
          .sendMessage({ type: MESSAGE_CLOSE_SIDE_PANEL })
          .catch(() => {});
        void chrome.storage.session.set({
          [STORAGE_KEY_SIDE_PANEL_OPEN]: false,
        });
        void chrome.storage.local.set({
          [STORAGE_KEY_STATEMENT_FILL_ACTIVE]: false,
        });
        void chrome.storage.local.remove(STORAGE_KEY_ACTIVE_FILL_LISTING_ID);
      } else if (tabId !== undefined) {
        console.log("[FlatFlow] panel opened");
        chrome.sidePanel.open({ tabId });
        void chrome.storage.session.set({
          [STORAGE_KEY_SIDE_PANEL_OPEN]: true,
        });
      }
    });
    return;
  }

  console.log("[FlatFlow] open landing page in new tab");
  chrome.tabs.create({ url: LANDING_PAGE_URL });
});

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

function normalizeFetchUrl(url: string): string {
  const trimmed = url.trim();
  return trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
}

chrome.runtime.onMessage.addListener(
  (
    message: { type: string; urls?: string[]; listingId?: string },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: string[] | { error: string }) => void,
  ) => {
    if (message.type === MESSAGE_PANEL_CLOSED) {
      void chrome.storage.session.set({
        [STORAGE_KEY_SIDE_PANEL_OPEN]: false,
      });
      void chrome.storage.local.set({
        [STORAGE_KEY_STATEMENT_FILL_ACTIVE]: false,
      });
      void chrome.storage.local.remove(STORAGE_KEY_ACTIVE_FILL_LISTING_ID);
      return false;
    }
    if (message.type !== MESSAGE_FETCH_IMAGES || !Array.isArray(message.urls))
      return false;
    const urls = message.urls.slice(0, 16).map(normalizeFetchUrl);
    console.log("[FlatFlow] fetching images for listing", {
      listingId: message.listingId,
      count: urls.length,
    });
    Promise.all(
      urls.map((url) =>
        fetch(url)
          .then((r) =>
            r.ok ? r.blob() : Promise.reject(new Error(`HTTP ${r.status}`)),
          )
          .then(blobToDataUrl)
          .catch(() => null),
      ),
    )
      .then((results) => {
        const dataUrls = results.filter((r): r is string => r != null);
        if (dataUrls.length > 0) sendResponse(dataUrls);
        else sendResponse({ error: "Fetch failed" });
      })
      .catch(() => sendResponse({ error: "Fetch failed" }));
    return true;
  },
);
