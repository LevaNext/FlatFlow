/**
 * Content script: runs on myhome.ge, ss.ge, and statements.myhome.ge.
 * - Listing pages: responds to parse requests.
 * - Statement create page: fills price and currency from stored parsed data.
 */

import { MESSAGE_FETCH_IMAGES, MESSAGE_PARSE_LISTING } from "@/extension/messages";
import { detectSite, type SiteId } from "@/parsing";
import { parseListing } from "@/parsing";

const PARSED_LISTING_KEY = "parsedListing";
const LOG = (msg: string, ...args: unknown[]) => console.log("[FlatFlow]", msg, ...args);

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

function dataUrlToFile(dataUrl: string, index: number): File {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = /:(.*?);/.exec(header ?? "");
  const mime = mimeMatch?.[1] ?? "image/webp";
  const bin = atob(base64 ?? "");
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  let ext = "webp";
  if (mime.includes("png")) ext = "png";
  else if (mime.includes("jpeg") || mime.includes("jpg")) ext = "jpg";
  return new File([arr], `image-${index}.${ext}`, { type: mime });
}

function fillPhotoUpload(imageUrls: string[]): void {
  LOG("fillPhotoUpload called, imageUrls count:", imageUrls.length, "urls:", imageUrls.slice(0, 3));
  if (!imageUrls.length || typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
    LOG("fillPhotoUpload skipped: no urls or no chrome.runtime.sendMessage");
    return;
  }
  const urlsToFetch = imageUrls.slice(0, 16);
  LOG("sending MESSAGE_FETCH_IMAGES to background, urls:", urlsToFetch.length);
  chrome.runtime.sendMessage(
    { type: MESSAGE_FETCH_IMAGES, urls: urlsToFetch },
    (response: string[] | { error?: string }) => {
      if (chrome.runtime.lastError) {
        LOG("sendMessage error:", chrome.runtime.lastError.message);
        return;
      }
      LOG("fillPhotoUpload response:", Array.isArray(response) ? `array length ${response.length}` : response);
      if (!Array.isArray(response) || response.length === 0) {
        LOG("fillPhotoUpload: no files to add (response not array or empty). If object:", response);
        return;
      }
      const files = response.map((dataUrl, i) => dataUrlToFile(dataUrl, i));
      const dt = new DataTransfer();
      for (const f of files) dt.items.add(f);
      const container = document.querySelector('[data-test-id="input-photo-upload"]');
      const dropZone = container?.querySelector(".drag-drop");
      const label = container?.querySelector(".pre-uploader, [for]");
      const fileInput = container?.querySelector('input[type="file"]') as HTMLInputElement | null;
      LOG("drop zone:", !!dropZone, "label:", !!label, "file input:", !!fileInput);
      const targets = [dropZone, label, fileInput, container].filter(Boolean) as Element[];
      if (targets.length === 0) {
        LOG("no photo upload targets found");
        return;
      }
      const dispatchDrop = () => {
        const d = new DataTransfer();
        for (const f of files) d.items.add(f);
        if (fileInput && d.files.length > 0) {
          try {
            fileInput.files = d.files;
            fileInput.dispatchEvent(new Event("input", { bubbles: true }));
            fileInput.dispatchEvent(new Event("change", { bubbles: true }));
            LOG("set file input.files and dispatched input+change, count:", d.files.length);
          } catch (e) {
            LOG("fileInput.files assign failed, trying drop:", (e as Error)?.message);
          }
        }
        const opts = { bubbles: true, cancelable: true, dataTransfer: d };
        for (const target of targets) {
          target.dispatchEvent(new DragEvent("dragenter", opts));
          target.dispatchEvent(new DragEvent("dragover", opts));
          target.dispatchEvent(new DragEvent("drop", opts));
        }
        LOG("dispatched dragenter+dragover+drop on", targets.length, "targets with", files.length, "files");
      };
      setTimeout(dispatchDrop, 300);
    },
  );
}

function fillStatementFormFromStorage(): void {
  LOG("fillStatementFormFromStorage started");
  if (typeof chrome === "undefined" || !chrome.storage?.local) {
    LOG("no chrome.storage.local, aborting");
    return;
  }
  chrome.storage.local.get(PARSED_LISTING_KEY, (result: Record<string, unknown>) => {
    const payload = result[PARSED_LISTING_KEY] as
      | {
          data?: {
            price?: { amount: number; currency: "GEL" | "USD" };
            imageUrls?: string[];
          };
        }
      | undefined;
    LOG("stored payload:", payload ? { hasPrice: !!payload?.data?.price, hasImageUrls: !!payload?.data?.imageUrls, imageUrlsLength: payload?.data?.imageUrls?.length ?? 0 } : "missing");
    const price = payload?.data?.price;
    if (!price) {
      LOG("no price in payload, only filling price/currency skipped");
      return;
    }

    const totalPriceInput = document.getElementById("total_price") as
      | HTMLInputElement
      | null;
    if (totalPriceInput) {
      totalPriceInput.value = String(price.amount);
      totalPriceInput.dispatchEvent(new Event("input", { bubbles: true }));
      LOG("filled total_price:", price.amount);
    } else {
      LOG("total_price input not found");
    }

    const wantGel = price.currency === "GEL";
    const all = document.querySelectorAll("*");
    for (const el of all) {
      const text = el.textContent?.trim();
      if (text === "₾" && wantGel) {
        (el as HTMLElement).click();
        LOG("clicked GEL");
        break;
      }
      if (text === "$" && !wantGel) {
        (el as HTMLElement).click();
        LOG("clicked USD");
        break;
      }
    }

    const imageUrls = payload?.data?.imageUrls;
    LOG("imageUrls from payload:", imageUrls?.length ?? 0, imageUrls?.length ? "calling fillPhotoUpload" : "skipping photos");
    if (imageUrls?.length) fillPhotoUpload(imageUrls);
  });
}

if (isStatementCreatePage()) {
  LOG("statement create page detected, will fill form in 500ms");
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
