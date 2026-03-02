/**
 * Service worker: side panel (myhome.ge only), image fetch.
 * On myhome.ge → open panel. Otherwise (any other site, new tab, about:blank, invalid) → redirect to myhome.ge.
 */

import { MESSAGE_FETCH_IMAGES } from "./messages";

const MYHOME_URL = "https://www.myhome.ge";

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

  if (hostname === "myhome.ge") {
    console.log("[FlatFlow] panel opened");
    chrome.sidePanel.open({ tabId: tab.id });
    return;
  }

  console.log("[FlatFlow] redirect triggered");
  chrome.tabs.update(tab.id, { url: MYHOME_URL });
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
    message: { type: string; urls: string[] },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: string[] | { error: string }) => void,
  ) => {
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
