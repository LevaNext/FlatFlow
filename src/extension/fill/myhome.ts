/**
 * MyHome statement form fill: price, currency, location, and photo upload on statements.myhome.ge.
 */

import { getLocationFromTitle } from "@/data/locations";
import { MESSAGE_FETCH_IMAGES } from "@/extension/messages";
import { dataUrlToFile } from "./shared";
import type { StatementFormPayload } from "./types";

export type StatementPageLang = "ka" | "en" | "ru";

const LOG = (msg: string, ...args: unknown[]) =>
  console.log("[FlatFlow]", msg, ...args);

function normalizeStatusText(s: string): string {
  return s.replaceAll(/\s+/g, " ").trim();
}

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
 * Receives a status name and clicks the corresponding option inside [data-test-id="select-status"].
 * The visible text is inside a span within the label (e.g. "ძველი აშენებული", "ახალი აშენებული", "მშენებარე").
 * Works even if the label's `for` attribute values are dynamic.
 */
function selectStatus(statusName: string): void {
  const container = document.querySelector('[data-test-id="select-status"]');
  if (!container) {
    LOG("selectStatus: container [data-test-id='select-status'] not found");
    return;
  }
  const want = normalizeStatusText(statusName);
  if (!want) return;
  const labels = container.querySelectorAll("label");
  for (const label of labels) {
    const text = (label.textContent ?? "").trim();
    if (text.includes(want)) {
      (label as HTMLElement).click();
      LOG("selectStatus: clicked:", want);
      return;
    }
  }
  LOG("selectStatus: no label matched:", want);
}

/**
 * Receives a condition name and clicks the corresponding option inside [data-test-id="select-condition"].
 * The visible text is inside a span within the label (e.g. "ახალი გარემონტებული", "ძველი გარემონტებული").
 */
function selectCondition(conditionName: string): void {
  const container = document.querySelector('[data-test-id="select-condition"]');
  if (!container) {
    LOG(
      "selectCondition: container [data-test-id='select-condition'] not found",
    );
    return;
  }
  const want = normalizeStatusText(conditionName);
  if (!want) return;
  const labels = container.querySelectorAll("label");
  for (const label of labels) {
    const text = (label.textContent ?? "").trim();
    if (text.includes(want)) {
      (label as HTMLElement).click();
      LOG("selectCondition: clicked:", want);
      return;
    }
  }
  LOG("selectCondition: no label matched:", want);
}

/**
 * Detect statement page language from the location field label or language switcher.
 * Returns "ka" | "en" | "ru" for Georgian, English, or Russian. Defaults to "ka".
 */
function detectStatementPageLang(): StatementPageLang {
  const container = document.querySelector('[data-test-id="input-location"]');
  if (!container) return "ka";
  const label = container.querySelector('.label, label, [class*="label"]');
  const labelText = (label?.textContent ?? "").trim();
  if (/Location/i.test(labelText)) return "en";
  if (/Местоположение/i.test(labelText)) return "ru";
  if (/[\u10A0-\u10FF]/.test(labelText) || labelText.includes("მდებარეობა"))
    return "ka";
  const root = document.documentElement;
  const lang = (root.getAttribute("lang") ?? "").toLowerCase();
  if (lang.startsWith("en")) return "en";
  if (lang.startsWith("ru")) return "ru";
  return "ka";
}

function isVisible(el: Element): boolean {
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (style.opacity === "0") return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

/** Location in all languages for matching dropdown options (dropdown can show ka, en, or ru). */
type LocationTriple = { ka: string; en: string; ru: string };

function getLocationOptionText(li: Element): string {
  const firstSpan = li.querySelector("span.text-black-100, span:first-child");
  return (firstSpan?.textContent ?? li.textContent ?? "").trim();
}

/**
 * Set location: open dropdown, find the li whose first span matches any of location.ka/en/ru, then click that li.
 * Dropdown structure: .select-dropdown ul li, first span = location name (e.g. "თბილისი").
 */
function setLocation(location: LocationTriple): void {
  const container = document.querySelector('[data-test-id="input-location"]');
  if (!container) {
    LOG("setLocation: container [data-test-id='input-location'] not found");
    return;
  }

  const wantSet = new Set(
    [location.ka.trim(), location.en.trim(), location.ru.trim()].filter(
      Boolean,
    ),
  );
  if (wantSet.size === 0) return;

  const input = container.querySelector("input");
  const label = container.querySelector("label");
  const selectContainer = container.querySelector(".select-container");
  const trigger = (selectContainer ?? label ?? input) as HTMLElement | null;
  if (input) input.focus();
  if (trigger) trigger.click();

  function findAndClickInSelectDropdown(attempt: number): void {
    const dropdown = document.querySelector(".select-dropdown");
    if (!dropdown || !isVisible(dropdown)) {
      if (attempt < 8) {
        setTimeout(
          () => findAndClickInSelectDropdown(attempt + 1),
          100 + attempt * 80,
        );
      } else {
        LOG("setLocation: .select-dropdown not found or not visible");
      }
      return;
    }
    const items = dropdown.querySelectorAll("ul li");
    for (const li of items) {
      const optionText = getLocationOptionText(li);
      if (!optionText || !wantSet.has(optionText)) continue;
      if (!(li instanceof HTMLElement)) continue;
      li.click();
      LOG("setLocation: clicked", optionText);
      return;
    }
    if (attempt < 8) {
      setTimeout(
        () => findAndClickInSelectDropdown(attempt + 1),
        100 + attempt * 80,
      );
    } else {
      LOG("setLocation: no option matched", [...wantSet]);
    }
  }

  setTimeout(() => findAndClickInSelectDropdown(0), 350);
}

/**
 * Fill the MyHome statement create form: total_price input, GEL/USD toggle, condition, status, location, then photo upload.
 */
export function fillMyHomeStatementForm(payload: StatementFormPayload): void {
  const {
    price,
    imageUrls,
    status,
    condition,
    location: locationOption,
  } = payload;

  const lang: StatementPageLang = payload.lang ?? detectStatementPageLang();
  LOG("statement page lang:", lang);

  if (price) {
    setPriceAndCurrency(price);
  } else {
    LOG("no price in payload, skipping price/currency fill");
  }

  if (condition) {
    LOG("filling condition:", condition);
    selectCondition(condition);
  } else {
    LOG("no condition in payload, skipping condition fill");
  }

  if (status) {
    LOG("filling status:", status);
    selectStatus(status);
  } else {
    LOG("no status in payload, skipping status fill");
  }

  const location = locationOption ?? getLocationFromTitle(payload.title ?? "");
  setLocation(location);
  LOG("filling location:", location[lang], "lang:", lang);

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
