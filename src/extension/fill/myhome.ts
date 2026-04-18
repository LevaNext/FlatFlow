/**
 * MyHome statement form fill: price, currency, location, and photo upload on statements.myhome.ge.
 */

import { getLocationFromTitle } from "@/data/locations";
import { PROPERTY_TYPES } from "@/data/propertyTypes";
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
 * Receives property type label (exact text from JSON, e.g. "კერძო სახლი") and clicks the matching chip.
 * Finds the chip container and clicks the label whose text matches the stored label.
 */
function selectPropertyType(propertyTypeLabel: string): void {
  const want = normalizeStatusText(propertyTypeLabel);
  if (!want) return;

  const container =
    document.querySelector('[data-test-id="select-property-type"]') ??
    findPropertyTypeChipContainer();
  if (!container) {
    LOG("selectPropertyType: container not found");
    return;
  }
  const wantLower = want.toLowerCase();
  const labels = container.querySelectorAll("label");
  const chipTexts: string[] = [];
  for (const label of labels) {
    const text = (label.textContent ?? "").trim();
    if (!text) continue;
    chipTexts.push(text);
    const textLower = text.toLowerCase();
    const match =
      text === want ||
      textLower === wantLower ||
      text.includes(want) ||
      textLower.includes(wantLower) ||
      wantLower.includes(textLower);
    if (match) {
      (label as HTMLElement).click();
      LOG("selectPropertyType: clicked chip", JSON.stringify(text));
      return;
    }
  }
  LOG(
    "selectPropertyType: no chip matched for",
    JSON.stringify(want),
    "| chips:",
    chipTexts.map((t) => JSON.stringify(t)),
  );
}

function fillPropertyType(propertyType: string): void {
  const value = propertyType.trim();
  if (!value) return;
  LOG("filling property type (override default if needed):", value);
  selectPropertyType(value);
}

/**
 * Receives deal type label (exact text from JSON, e.g. "იყიდება", "ქირავდება") and clicks the matching chip
 * inside [data-test-id="select-deal-type"].
 */
function selectDealType(dealTypeLabel: string): void {
  const want = normalizeStatusText(dealTypeLabel);
  if (!want) return;

  const container = document.querySelector('[data-test-id="select-deal-type"]');
  if (!container) {
    LOG(
      "selectDealType: container [data-test-id='select-deal-type'] not found",
    );
    return;
  }
  const wantLower = want.toLowerCase();
  const labels = container.querySelectorAll("label");
  const chipTexts: string[] = [];
  for (const label of labels) {
    const text = (label.textContent ?? "").trim();
    if (!text) continue;
    chipTexts.push(text);
    const textLower = text.toLowerCase();
    const match =
      text === want ||
      textLower === wantLower ||
      text.includes(want) ||
      textLower.includes(wantLower) ||
      wantLower.includes(textLower);
    if (match) {
      (label as HTMLElement).click();
      LOG("selectDealType: clicked chip", JSON.stringify(text));
      return;
    }
  }
  LOG(
    "selectDealType: no chip matched for",
    JSON.stringify(want),
    "| chips:",
    chipTexts.map((t) => JSON.stringify(t)),
  );
}

function fillDealType(dealType: string): void {
  const value = dealType.trim();
  if (!value) return;
  LOG("filling deal type:", value);
  selectDealType(value);
}

/** All property type labels (ka, en, ru) for finding the chip container in any language. */
const PROPERTY_TYPE_LABEL_TEXTS = new Set(
  PROPERTY_TYPES.flatMap((p) =>
    [p.ka, p.en, p.ru].map((s) => s?.trim()).filter(Boolean),
  ),
);

/** Find div that contains labels with property type texts (any language). */
function findPropertyTypeChipContainer(): Element | null {
  const divs = document.querySelectorAll(
    "div[class*='luk-flex'][class*='luk-w-full'], div[class*='flex'][class*='gap']",
  );
  for (const div of divs) {
    const labels = div.querySelectorAll("label");
    if (labels.length < 4) continue;
    for (const label of labels) {
      const span = label.querySelector("span.luk-text-sm, span");
      const text = (span?.textContent ?? label.textContent ?? "").trim();
      if (text && PROPERTY_TYPE_LABEL_TEXTS.has(text)) return div;
    }
  }
  return null;
}

/**
 * Detect statement page language from the location field label or language switcher.
 * Returns "ka" | "en" | "ru" for Georgian, English, or Russian. Defaults to "ka".
 */
export function detectStatementPageLang(): StatementPageLang {
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
 * Find an input by its label text (e.g. "ფართი", "სართული"). Searches for a label/span containing
 * the text, then returns the input in the same container.
 */
function findInputByLabelText(labelText: string): HTMLInputElement | null {
  const candidates = document.querySelectorAll(
    'label span, span[class*="label"], label',
  );
  for (const el of candidates) {
    const text = (el.textContent ?? "").trim();
    if (!text.includes(labelText)) continue;
    const container =
      el.closest(".input-container") ??
      el.closest("label")?.parentElement ??
      el.closest("div");
    const input = container?.querySelector("input");
    if (input instanceof HTMLInputElement) return input;
  }
  return null;
}

/**
 * Set area: fill the input with label "ფართი" (area in m²).
 */
function setArea(area: number): void {
  const input = findInputByLabelText("ფართი");
  if (!input) {
    LOG("setArea: input with label ფართი not found");
    return;
  }
  input.value = String(area);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  LOG("setArea: filled", area);
}

/**
 * Click the room-count option that matches the given number (1–9 or 10+).
 * Looks for a container with many numeric-option labels (rooms selector), then clicks the matching one.
 */
function setRooms(rooms: number): void {
  if (rooms < 1) return;
  const wantText = rooms >= 10 ? "10+" : String(rooms);
  const labels = document.querySelectorAll("label");
  for (const label of labels) {
    const mainSpan = label.querySelector("span");
    const mainText = (mainSpan?.textContent ?? label.textContent ?? "").trim();
    if (mainText !== wantText) continue;
    const wrapper = label.closest(
      "div.flex-wrap, div[class*='flex'][class*='gap']",
    );
    const siblingLabels = wrapper?.querySelectorAll("label") ?? [];
    if (siblingLabels.length >= 8) {
      (label as HTMLElement).click();
      LOG("setRooms: clicked", wantText);
      return;
    }
  }
  for (const label of labels) {
    if ((label.textContent ?? "").trim() === wantText) {
      (label as HTMLElement).click();
      LOG("setRooms: clicked (fallback)", wantText);
      return;
    }
  }
  LOG("setRooms: no option matched", rooms);
}

/**
 * Set floor: if value has "current/total" (e.g. "7/15"), fill both inputs;
 * if only a single number (e.g. "3") with no "/", fill only "სართულები სულ" (total floors).
 */
function setFloor(floor: string): void {
  const parts = floor
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
  const current = parts.length >= 2 ? parts[0] : undefined;
  const total = parts.length >= 1 ? parts.at(-1) : undefined;
  if (!total) return;
  if (current !== undefined) {
    const currentInput = findInputByLabelText("სართული");
    if (currentInput) {
      currentInput.value = current;
      currentInput.dispatchEvent(new Event("input", { bubbles: true }));
      currentInput.dispatchEvent(new Event("change", { bubbles: true }));
      LOG("setFloor: current", current);
    } else {
      LOG("setFloor: input სართული not found");
    }
  }
  const totalInput = findInputByLabelText("სართულები სულ");
  if (totalInput) {
    totalInput.value = total;
    totalInput.dispatchEvent(new Event("input", { bubbles: true }));
    totalInput.dispatchEvent(new Event("change", { bubbles: true }));
    LOG("setFloor: total", total);
  } else {
    LOG("setFloor: input სართულები სულ not found");
  }
}

/**
 * Set bedroom count: the beds selector appears after rooms is selected (same layout: labels 1, 2, 3…).
 * Find the second numeric-option group (first is rooms with many options, second is beds with fewer).
 */
function setBedroom(beds: number): void {
  if (beds < 1) return;
  const wantText = String(beds);
  const wrappers = document.querySelectorAll(
    'div[class*="luk-flex"][class*="luk-flex-wrap"][class*="luk-gap-3"], div.flex-wrap, div[class*="flex"][class*="gap"]',
  );
  let foundRooms = false;
  for (const wrapper of wrappers) {
    const labels = wrapper.querySelectorAll("label");
    const numericLabels = Array.from(labels).filter((l) => {
      const span = l.querySelector("span");
      const t = (span?.textContent ?? l.textContent ?? "").trim();
      return /^(\d+|10\+)$/.test(t);
    });
    if (numericLabels.length >= 8) {
      foundRooms = true;
      continue;
    }
    if (numericLabels.length >= 1 && foundRooms) {
      for (const label of numericLabels) {
        const span = label.querySelector("span");
        const t = (span?.textContent ?? label.textContent ?? "").trim();
        if (t === wantText) {
          (label as HTMLElement).click();
          LOG("setBedroom: clicked", wantText);
          return;
        }
      }
      LOG("setBedroom: beds option not found in second group", wantText);
      return;
    }
  }
  LOG("setBedroom: beds container not found (select rooms first?)");
}

/**
 * Set street/address: fill the input in [data-test-id="input-street"] (label "ქუჩა").
 */
function setStreet(address: string): void {
  const container = document.querySelector('[data-test-id="input-street"]');
  if (!container) {
    LOG("setStreet: container [data-test-id='input-street'] not found");
    return;
  }
  const input = container.querySelector("input");
  if (!input || !(input instanceof HTMLInputElement)) {
    LOG("setStreet: input not found");
    return;
  }
  input.value = address.trim();
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  LOG("setStreet: filled", address.trim());
}

/**
 * Set location: open dropdown, find the li whose first span matches any of location.ka/en/ru, then click that li.
 * Dropdown structure: .select-dropdown ul li, first span = location name (e.g. "თბილისი").
 */
function setLocationAsync(location: LocationTriple): Promise<void> {
  return new Promise((resolve) => {
    const container = document.querySelector('[data-test-id="input-location"]');
    if (!container) {
      LOG("setLocation: container [data-test-id='input-location'] not found");
      resolve();
      return;
    }

    const wantSet = new Set(
      [location.ka.trim(), location.en.trim(), location.ru.trim()].filter(
        Boolean,
      ),
    );
    if (wantSet.size === 0) {
      resolve();
      return;
    }

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
          resolve();
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
        resolve();
        return;
      }
      if (attempt < 8) {
        setTimeout(
          () => findAndClickInSelectDropdown(attempt + 1),
          100 + attempt * 80,
        );
      } else {
        LOG("setLocation: no option matched", [...wantSet]);
        resolve();
      }
    }

    setTimeout(() => findAndClickInSelectDropdown(0), 350);
  });
}

/** Label for project type select on the statement form (Georgian). */
const PROJECT_TYPE_SELECT_LABEL = "აირჩიეთ პროექტის ტიპი";

/**
 * Set project type: find custom select by label "აირჩიეთ პროექტის ტიპი", click to open,
 * then find the opened options list (ul.options-list inside luk-absolute dropdown) and click the matching li.
 * Dropdown structure: div.luk-absolute > ul.options-list > li (text directly in li).
 */
function setProjectTypeAsync(projectType: string): Promise<void> {
  return new Promise((resolve) => {
    const want = normalizeStatusText(projectType);
    if (!want) {
      resolve();
      return;
    }

    const candidates = document.querySelectorAll(
      ".luk-custom-select, [class*='custom-select'], [class*='luk-custom-select']",
    );
    let container: Element | null = null;
    for (const el of candidates) {
      const label = el.querySelector(".label, label, span[class*='label']");
      const text = (label?.textContent ?? "").trim();
      if (
        text.includes(PROJECT_TYPE_SELECT_LABEL) ||
        text.includes("პროექტის ტიპი")
      ) {
        container = el;
        break;
      }
    }
    if (!container) {
      LOG(
        "setProjectType: container with label",
        PROJECT_TYPE_SELECT_LABEL,
        "not found",
      );
      resolve();
      return;
    }

    const trigger = container.querySelector(
      "div[class*='cursor-pointer'], .luk-cursor-pointer, div",
    );
    const input = container.querySelector("input");
    if (input) input.focus();
    if (trigger instanceof HTMLElement) trigger.click();

    function findAndClickOption(attempt: number): void {
      const lists = document.querySelectorAll("ul.options-list");
      for (const ul of lists) {
        if (!isVisible(ul)) continue;
        const items = ul.querySelectorAll("li");
        for (const li of items) {
          const optionText = (li.textContent ?? "").trim();
          if (
            (optionText === want || optionText.includes(want)) &&
            li instanceof HTMLElement
          ) {
            li.click();
            LOG("setProjectType: clicked", optionText);
            resolve();
            return;
          }
        }
      }
      if (attempt < 12) {
        setTimeout(() => findAndClickOption(attempt + 1), 80 + attempt * 50);
      } else {
        LOG(
          "setProjectType: ul.options-list not visible or no option matched",
          want,
        );
        resolve();
      }
    }

    setTimeout(() => findAndClickOption(0), 350);
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Fill the MyHome statement create form: total_price input, GEL/USD toggle, condition, status, location, then photo upload.
 * Resolves when queued UI work (location/project dropdowns, beds, photo upload) has finished.
 */
export async function fillMyHomeStatementForm(
  payload: StatementFormPayload,
): Promise<void> {
  const {
    price,
    imageUrls,
    status,
    condition,
    projectType,
    propertyType,
    dealType,
    location: locationOption,
    address,
    area,
    rooms,
    beds,
    floor,
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

  fillPropertyType(propertyType ?? "");
  fillDealType(dealType ?? "");

  const location = locationOption ?? getLocationFromTitle(payload.title ?? "");
  await setLocationAsync(location);
  LOG("filling location:", location[lang], "lang:", lang);

  if (projectType?.trim()) {
    await delay(400);
    LOG("filling project type:", projectType);
    await setProjectTypeAsync(projectType.trim());
  }

  if (address?.trim()) {
    setStreet(address);
  } else {
    LOG("no address in payload, skipping street fill");
  }

  if (area != null) {
    setArea(area);
  }
  if (rooms != null) {
    setRooms(rooms);
  }
  if (floor?.trim()) {
    setFloor(floor.trim());
  }
  if (beds != null) {
    await delay(400);
    setBedroom(beds);
    await delay(200);
  }

  LOG(
    "imageUrls from payload:",
    imageUrls?.length ?? 0,
    imageUrls?.length ? "calling fillMyHomePhotoUpload" : "skipping photos",
  );
  if (imageUrls?.length) {
    await fillMyHomePhotoUpload(imageUrls);
  }
}

/**
 * Fetch images via background, build File list, and dispatch to the statement form photo upload (input + drag/drop).
 */
export function fillMyHomePhotoUpload(imageUrls: string[]): Promise<void> {
  return new Promise((resolve) => {
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
      resolve();
      return;
    }
    const urlsToFetch = imageUrls.slice(0, 16);
    LOG(
      "sending MESSAGE_FETCH_IMAGES to background, urls:",
      urlsToFetch.length,
    );
    chrome.runtime.sendMessage(
      { type: MESSAGE_FETCH_IMAGES, urls: urlsToFetch },
      (response: string[] | { error?: string }) => {
        if (chrome.runtime.lastError) {
          LOG("sendMessage error:", chrome.runtime.lastError.message);
          resolve();
          return;
        }
        LOG(
          "fillMyHomePhotoUpload response:",
          Array.isArray(response)
            ? `array length ${response.length}`
            : response,
        );
        if (!Array.isArray(response) || response.length === 0) {
          LOG(
            "fillMyHomePhotoUpload: no files to add (response not array or empty). If object:",
            response,
          );
          resolve();
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
          resolve();
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
        setTimeout(() => {
          dispatchDrop();
          setTimeout(resolve, 150);
        }, 300);
      },
    );
  });
}
