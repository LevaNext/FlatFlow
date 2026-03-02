/**
 * Service worker: fetches image URLs and returns as data URLs so content script can create File objects.
 */

import { MESSAGE_FETCH_IMAGES } from "./messages";

const LOG = (msg: string, ...args: unknown[]) => console.log("[FlatFlow background]", msg, ...args);

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
    if (message.type !== MESSAGE_FETCH_IMAGES || !Array.isArray(message.urls)) {
      LOG("ignored message, type:", message.type, "urls is array:", Array.isArray(message?.urls));
      return false;
    }
    const urls = message.urls.slice(0, 16) as string[];
    LOG("fetching images, count:", urls.length, "first:", urls[0]);
    Promise.all(
      urls.map((url, i) =>
        fetch(url)
          .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.blob();
          })
          .then(blobToDataUrl)
          .then((dataUrl) => {
            LOG("fetched image", i + 1, "/", urls.length);
            return dataUrl;
          })
          .catch((err) => {
            LOG("fetch failed for", url, err?.message ?? err);
            return null;
          }),
      ),
    )
      .then((results) => {
        const dataUrls = results.filter((r): r is string => r != null);
        LOG("fetch done, success:", dataUrls.length, "failed:", results.length - dataUrls.length);
        if (dataUrls.length > 0) sendResponse(dataUrls);
        else sendResponse({ error: "Fetch failed" });
      })
      .catch((err) => {
        LOG("fetch error:", err?.message ?? err);
        sendResponse({ error: "Fetch failed" });
      });
    return true;
  },
);
