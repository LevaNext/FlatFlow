/**
 * Service worker: side panel on supported sites, image fetch.
 * On supported domain (myhome.ge, ss.ge) → open side panel.
 * Otherwise → open FlatFlow landing page in a new tab (same as “Open FlatFlow” in the side panel).
 */

import { LANDING_PAGE_URL, SUPPORTED_DOMAINS } from "@/shared/constants";
import {
  MESSAGE_CLOSE_SIDE_PANEL,
  MESSAGE_FETCH_IMAGES,
  MESSAGE_PANEL_CLOSED,
} from "./messages";

const STORAGE_KEY_SIDE_PANEL_OPEN = "sidePanelOpen";

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
});

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

chrome.runtime.onMessage.addListener(
  (
    message: { type: string; urls?: string[] },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: string[] | { error: string }) => void,
  ) => {
    if (message.type === MESSAGE_PANEL_CLOSED) {
      void chrome.storage.session.set({ [STORAGE_KEY_SIDE_PANEL_OPEN]: false });
      return false;
    }
    if (message.type !== MESSAGE_FETCH_IMAGES || !Array.isArray(message.urls))
      return false;
    const urls = message.urls.slice(0, 16);
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
