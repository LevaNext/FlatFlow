/**
 * MyHome statement form fill: price, currency, and photo upload on statements.myhome.ge.
 */

import { MESSAGE_FETCH_IMAGES } from "@/extension/messages";
import { dataUrlToFile } from "./shared";
import type { StatementFormPayload } from "./types";

const LOG = (msg: string, ...args: unknown[]) =>
  console.log("[FlatFlow]", msg, ...args);

function setPriceAndCurrency(price: {
  amount: number;
  currency: "GEL" | "USD";
}): void {
  const totalPriceInput = document.getElementById(
    "total_price",
  ) as HTMLInputElement | null;
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
      return;
    }
    if (text === "$" && !wantGel) {
      (el as HTMLElement).click();
      LOG("clicked USD");
      return;
    }
  }
}

/**
 * Fill the MyHome statement create form: total_price input, GEL/USD toggle, then photo upload.
 */
export function fillMyHomeStatementForm(payload: StatementFormPayload): void {
  const { price, imageUrls } = payload;

  if (price) {
    setPriceAndCurrency(price);
  } else {
    LOG("no price in payload, skipping price/currency fill");
  }

  LOG(
    "imageUrls from payload:",
    imageUrls?.length ?? 0,
    imageUrls?.length ? "calling fillMyHomePhotoUpload" : "skipping photos",
  );
  if (imageUrls?.length) fillMyHomePhotoUpload(imageUrls);
}

/**
 * Fetch images via background, build File list, and dispatch to the statement form photo upload (input + drag/drop).
 */
export function fillMyHomePhotoUpload(imageUrls: string[]): void {
  LOG(
    "fillMyHomePhotoUpload called, imageUrls count:",
    imageUrls.length,
    "urls:",
    imageUrls.slice(0, 3),
  );
  if (
    !imageUrls.length ||
    typeof chrome === "undefined" ||
    !chrome.runtime?.sendMessage
  ) {
    LOG(
      "fillMyHomePhotoUpload skipped: no urls or no chrome.runtime.sendMessage",
    );
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
      LOG(
        "fillMyHomePhotoUpload response:",
        Array.isArray(response) ? `array length ${response.length}` : response,
      );
      if (!Array.isArray(response) || response.length === 0) {
        LOG(
          "fillMyHomePhotoUpload: no files to add (response not array or empty). If object:",
          response,
        );
        return;
      }
      const files = response.map((dataUrl, i) => dataUrlToFile(dataUrl, i));
      const container = document.querySelector(
        '[data-test-id="input-photo-upload"]',
      );
      const dropZone = container?.querySelector(".drag-drop");
      const label = container?.querySelector(".pre-uploader, [for]");
      const fileInput = container?.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement | null;
      LOG(
        "drop zone:",
        !!dropZone,
        "label:",
        !!label,
        "file input:",
        !!fileInput,
      );
      const targets = [dropZone, label, fileInput, container].filter(
        Boolean,
      ) as Element[];
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
            LOG(
              "set file input.files and dispatched input+change, count:",
              d.files.length,
            );
          } catch (e) {
            LOG(
              "fileInput.files assign failed, trying drop:",
              (e as Error)?.message,
            );
          }
        }
        const opts = { bubbles: true, cancelable: true, dataTransfer: d };
        for (const target of targets) {
          target.dispatchEvent(new DragEvent("dragenter", opts));
          target.dispatchEvent(new DragEvent("dragover", opts));
          target.dispatchEvent(new DragEvent("drop", opts));
        }
        LOG(
          "dispatched dragenter+dragover+drop on",
          targets.length,
          "targets with",
          files.length,
          "files",
        );
      };
      setTimeout(dispatchDrop, 300);
    },
  );
}
