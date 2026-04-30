/**
 * SS.ge statement form fill for the create listing wizard.
 * Current implementation focuses on first-step chips in #create-app-type:
 * - property type
 * - deal type
 */

import { MESSAGE_FETCH_IMAGES } from "@/extension/messages";
import { dataUrlToFile } from "./shared";
import type { StatementFormPayload } from "./types";

const LOG = (msg: string, ...args: unknown[]) =>
  console.log("[FlatFlow]", msg, ...args);

function normalizeText(value: string): string {
  return value.replaceAll(/\s+/g, " ").trim();
}

function dispatchRealClick(target: HTMLElement): void {
  LOG("SS fill: dispatching full click event sequence", {
    text: normalizeText(target.textContent ?? ""),
    className: target.className,
  });
  target.dispatchEvent(
    new MouseEvent("pointerdown", { bubbles: true, cancelable: true }),
  );
  target.dispatchEvent(
    new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
  );
  target.dispatchEvent(
    new MouseEvent("pointerup", { bubbles: true, cancelable: true }),
  );
  target.dispatchEvent(
    new MouseEvent("mouseup", { bubbles: true, cancelable: true }),
  );
  target.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true }),
  );
}

function getChipTexts(container: Element): string[] {
  const chips = container.querySelectorAll(
    "div.sc-dcc3c3bd-3, div[role='button']",
  );
  const texts: string[] = [];
  for (const chip of chips) {
    const text = normalizeText(chip.textContent ?? "");
    if (text) texts.push(text);
  }
  return texts;
}

function clickChipByText(
  container: Element,
  wantedText: string,
  contextLabel: string,
): boolean {
  const normalizedWanted = normalizeText(wantedText);
  if (!normalizedWanted) {
    LOG(`SS fill: ${contextLabel} wanted text is empty`);
    return false;
  }

  const chips = container.querySelectorAll(
    "div.sc-dcc3c3bd-3, div[role='button']",
  );
  LOG(`SS fill: ${contextLabel} searching`, {
    wanted: normalizedWanted,
    chipCount: chips.length,
    chips: getChipTexts(container),
  });
  const wantedLower = normalizedWanted.toLowerCase();
  for (const chip of chips) {
    const text = normalizeText(chip.textContent ?? "");
    if (!text) continue;
    const textLower = text.toLowerCase();
    const match =
      text === normalizedWanted ||
      textLower === wantedLower ||
      text.includes(normalizedWanted) ||
      textLower.includes(wantedLower) ||
      normalizedWanted.includes(text) ||
      wantedLower.includes(textLower);
    LOG(`SS fill: ${contextLabel} candidate`, { text, match });
    if (!match || !(chip instanceof HTMLElement)) continue;
    dispatchRealClick(chip);
    const selectedAfterClick =
      chip.classList.contains("kTGkLK") ||
      chip.getAttribute("aria-pressed") === "true";
    LOG(`SS fill: ${contextLabel} clicked candidate`, {
      text,
      selectedAfterClick,
      className: chip.className,
    });
    return true;
  }
  LOG(`SS fill: ${contextLabel} no matching chip`, {
    wanted: normalizedWanted,
    chips: getChipTexts(container),
  });
  return false;
}

function getCreateAppTypeRoot(): Element | null {
  return document.querySelector("#create-app-type");
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

function findDescriptionTextarea(): HTMLTextAreaElement | null {
  const selectors = [
    'textarea[placeholder="დაწერეთ დამატებითი აღწერა"]',
    'textarea[placeholder*="აღწერა"]',
    "div.relative.flex-grow textarea",
    "textarea",
  ];
  for (const selector of selectors) {
    const textarea = document.querySelector(selector);
    if (textarea instanceof HTMLTextAreaElement) return textarea;
  }
  return null;
}

function setTextareaValue(textarea: HTMLTextAreaElement, value: string): void {
  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )?.set;
  if (valueSetter) {
    valueSetter.call(textarea, value);
  } else {
    textarea.value = value;
  }
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.dispatchEvent(new Event("change", { bubbles: true }));
}

async function fillDescriptionWithRetry(
  description: string | undefined,
  shouldContinue: () => boolean,
): Promise<void> {
  const value = description?.trim();
  if (!value) {
    LOG("SS fill: no description in payload");
    return;
  }

  for (let attempt = 1; attempt <= 12; attempt += 1) {
    if (!shouldContinue()) {
      LOG("SS fill: cancelled before description fill");
      return;
    }

    const textarea = findDescriptionTextarea();
    if (textarea) {
      setTextareaValue(textarea, value);
      LOG("SS fill: description filled", {
        length: value.length,
        attempt,
      });
      return;
    }

    await wait(250);
  }

  LOG("SS fill: description textarea not found");
}

function findUnfinishedPlacementModal(): Element | null {
  const candidates = document.querySelectorAll(
    "div.sc-427d9738-2, div.sc-b3bd94d2-0",
  );
  for (const candidate of candidates) {
    const modal =
      candidate.closest("div.sc-427d9738-2") ??
      candidate.closest("div.sc-b3bd94d2-0") ??
      candidate;
    const title = normalizeText(
      modal.querySelector("h1, h2, h3, h4, h5, h6, .title")?.textContent ?? "",
    );
    const modalText = normalizeText(modal.textContent ?? "");
    if (
      title.includes("განთავსების გაგრძელება") ||
      modalText.includes("დაუსრულებელი განცხადება")
    ) {
      return modal;
    }
  }
  return null;
}

function clickNewPlacementModalIfPresent(): boolean {
  const modal = findUnfinishedPlacementModal();
  if (!modal) return false;

  const buttons = modal.querySelectorAll("button");
  for (const button of buttons) {
    const text = normalizeText(button.textContent ?? "");
    if (
      !text.includes("დაამატე ახალი განცხადება") &&
      !text.toLowerCase().includes("new")
    ) {
      continue;
    }
    if (!(button instanceof HTMLElement)) continue;
    LOG("SS fill: found unfinished listing modal, clicking new listing", {
      text,
    });
    dispatchRealClick(button);
    return true;
  }

  LOG("SS fill: unfinished listing modal found but new button missing", {
    modalText: normalizeText(modal.textContent ?? ""),
  });
  return false;
}

async function ensureFreshSsListingFlow(
  listingId: string | undefined,
  shouldContinue: () => boolean,
): Promise<boolean> {
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    if (!shouldContinue()) return false;
    const clickedNew = clickNewPlacementModalIfPresent();
    if (!clickedNew && !findUnfinishedPlacementModal()) return true;

    LOG("SS fill: waiting after add new listing modal action", {
      listingId,
      attempt,
      clickedNew,
    });
    await wait(450);
  }

  const modalStillOpen = findUnfinishedPlacementModal() != null;
  LOG("SS fill: fresh listing preflight finished", {
    listingId,
    modalStillOpen,
  });
  return !modalStillOpen;
}

function findSectionContainerByHeading(headingText: string): Element | null {
  const root = getCreateAppTypeRoot();
  if (!root) return null;
  const normalizedHeading = normalizeText(headingText).toLowerCase();
  const headings = root.querySelectorAll("p, h2, h3, h4");
  for (const heading of headings) {
    const text = normalizeText(heading.textContent ?? "").toLowerCase();
    if (!text.includes(normalizedHeading)) continue;
    const next = heading.nextElementSibling;
    if (next?.classList.contains("sc-dcc3c3bd-2")) return next;
    if (next) return next;
  }
  return null;
}

function selectPropertyType(propertyType: string): void {
  const root = getCreateAppTypeRoot();
  if (!root) {
    LOG("SS fill: #create-app-type root not found");
    return;
  }
  LOG("SS fill: propertyType root found", {
    className: root.className,
  });

  const container =
    findSectionContainerByHeading("უძრავი ქონების ტიპი") ??
    root.querySelectorAll(".sc-dcc3c3bd-2")[1] ??
    null;
  if (!container) {
    LOG("SS fill: property type container not found");
    return;
  }

  const clicked = clickChipByText(container, propertyType, "propertyType");
  LOG(
    "SS fill: property type",
    propertyType,
    clicked ? "selected" : "not found",
  );
}

function selectDealType(dealType: string): void {
  const root = getCreateAppTypeRoot();
  if (!root) {
    LOG("SS fill: #create-app-type root not found");
    return;
  }
  LOG("SS fill: dealType root found", {
    className: root.className,
  });

  const container =
    findSectionContainerByHeading("გარიგების ტიპი") ??
    root.querySelectorAll(".sc-dcc3c3bd-2")[2] ??
    null;
  if (!container) {
    LOG("SS fill: deal type container not found");
    return;
  }

  const clicked = clickChipByText(container, dealType, "dealType");
  LOG("SS fill: deal type", dealType, clicked ? "selected" : "not found");
}

function ensureRealEstateCategorySelected(): void {
  const root = getCreateAppTypeRoot();
  if (!root) {
    LOG("SS fill: category root not found");
    return;
  }
  const categoryContainer = root.querySelectorAll(".sc-dcc3c3bd-2")[0] ?? null;
  if (!categoryContainer) {
    LOG("SS fill: category container not found");
    return;
  }
  const ok = clickChipByText(categoryContainer, "უძრავი ქონება", "category");
  if (ok) LOG("SS fill: clicked category უძრავი ქონება");
}

function fillWithRetry(payload: {
  propertyType?: string;
  dealType?: string;
  maxAttempts?: number;
  delayMs?: number;
}): Promise<void> {
  return new Promise((resolve) => {
    const propertyType = payload.propertyType?.trim();
    const dealType = payload.dealType?.trim();
    const maxAttempts = payload.maxAttempts ?? 18;
    const delayMs = payload.delayMs ?? 250;

    let attempt = 0;
    const run = () => {
      attempt += 1;
      LOG("SS fill: retry attempt", {
        attempt,
        maxAttempts,
        propertyType,
        dealType,
      });
      const startedNew = clickNewPlacementModalIfPresent();
      if (startedNew) {
        LOG("SS fill: clicked add new listing, waiting next retry");
        globalThis.setTimeout(run, delayMs);
        return;
      }
      ensureRealEstateCategorySelected();

      if (propertyType) selectPropertyType(propertyType);
      if (dealType) selectDealType(dealType);

      const root = getCreateAppTypeRoot();
      const selectedNow = !!root?.querySelector(".sc-dcc3c3bd-3.kTGkLK");
      LOG("SS fill: selected state after attempt", {
        attempt,
        selectedNow,
        selectedTexts: Array.from(
          root?.querySelectorAll(".sc-dcc3c3bd-3.kTGkLK") ?? [],
        ).map((el) => normalizeText(el.textContent ?? "")),
      });
      if (selectedNow || attempt >= maxAttempts) {
        LOG("SS fill: stop retry", selectedNow ? "selected" : "max-attempts", {
          attempt,
          propertyType,
          dealType,
        });
        resolve();
        return;
      }
      globalThis.setTimeout(run, delayMs);
    };

    run();
  });
}

function canonicalizeImageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    parsed.pathname = parsed.pathname
      .replace(/_thumb(?=[^/]*$)/i, "")
      .replace(/\/thumbs?\//i, "/");
    return `${parsed.hostname.toLowerCase()}${parsed.pathname}`;
  } catch {
    return url
      .replace(/[?#].*$/, "")
      .replace(/_thumb(?=[^/]*$)/i, "")
      .replace(/\/thumbs?\//i, "/");
  }
}

function fillSsPhotoUpload(
  imageUrls: string[],
  listingId?: string,
  shouldContinue: () => boolean = () => true,
): Promise<void> {
  return new Promise((resolve) => {
    const canonicalImageUrls = new Set<string>();
    const uniqueImageUrls = imageUrls
      .map((url) => url.trim())
      .filter((url) => {
        if (!url) return false;
        const canonicalUrl = canonicalizeImageUrl(url);
        if (canonicalImageUrls.has(canonicalUrl)) return false;
        canonicalImageUrls.add(canonicalUrl);
        return true;
      });
    if (
      uniqueImageUrls.length === 0 ||
      typeof chrome === "undefined" ||
      !chrome.runtime?.sendMessage ||
      !shouldContinue()
    ) {
      LOG("SS fill: photo upload skipped", {
        hasUrls: uniqueImageUrls.length > 0,
        hasRuntime:
          typeof chrome !== "undefined" && !!chrome.runtime?.sendMessage,
        cancelled: !shouldContinue(),
      });
      resolve();
      return;
    }

    const urlsToFetch = uniqueImageUrls.slice(0, 16);
    LOG("SS fill: requesting images from background", {
      listingId,
      total: imageUrls.length,
      uniqueTotal: uniqueImageUrls.length,
      fetchCount: urlsToFetch.length,
    });
    chrome.runtime.sendMessage(
      { type: MESSAGE_FETCH_IMAGES, urls: urlsToFetch, listingId },
      (response: string[] | { error?: string }) => {
        if (!shouldContinue()) {
          LOG("SS fill: photo upload cancelled before dispatch", {
            listingId,
          });
          resolve();
          return;
        }
        if (chrome.runtime.lastError) {
          LOG(
            "SS fill: MESSAGE_FETCH_IMAGES failed",
            chrome.runtime.lastError.message,
          );
          resolve();
          return;
        }
        if (!Array.isArray(response) || response.length === 0) {
          LOG("SS fill: no image data returned", response);
          resolve();
          return;
        }

        const uniqueDataUrls = Array.from(new Set(response));
        const files = uniqueDataUrls.map((dataUrl, i) =>
          dataUrlToFile(dataUrl, i),
        );
        const wrapper = document.querySelector(
          'div[role="presentation"].sc-8e765712-1, div[role="presentation"]',
        );
        const fileInput = wrapper?.querySelector(
          'input[type="file"][accept*="image"]',
        ) as HTMLInputElement | null;

        if (!wrapper && !fileInput) {
          LOG("SS fill: photo dropzone/input not found");
          resolve();
          return;
        }

        const dt = new DataTransfer();
        for (const file of files) dt.items.add(file);
        const eventOpts = { bubbles: true, cancelable: true, dataTransfer: dt };

        if (fileInput) {
          try {
            fileInput.files = dt.files;
            // SS.ge processes selected files on change; dispatching input as well can add the same batch twice.
            fileInput.dispatchEvent(new Event("change", { bubbles: true }));
            LOG("SS fill: assigned files to input", { count: dt.files.length });
          } catch (err) {
            LOG(
              "SS fill: assigning input.files failed",
              (err as Error)?.message,
            );
          }
        }

        if (!fileInput && wrapper) {
          wrapper.dispatchEvent(new DragEvent("dragenter", eventOpts));
          wrapper.dispatchEvent(new DragEvent("dragover", eventOpts));
          wrapper.dispatchEvent(new DragEvent("drop", eventOpts));
          LOG("SS fill: dispatched drop events on wrapper", {
            files: files.length,
          });
        } else if (fileInput) {
          LOG("SS fill: skipped drop events because input upload succeeded", {
            files: files.length,
          });
        }

        resolve();
      },
    );
  });
}

/**
 * Fill the SS create form first step.
 */
export async function fillSsStatementForm(
  payload: StatementFormPayload,
): Promise<void> {
  const listingId = payload.listingId;
  const shouldContinue = payload.shouldContinue ?? (() => true);
  const propertyType = payload.propertyType?.trim();
  const dealType = payload.dealType?.trim();
  const description = payload.description?.trim();
  const imageUrls = payload.imageUrls ?? [];

  LOG("SS fill: start", {
    listingId,
    propertyType,
    dealType,
    hasDescription: !!description,
    imageCount: imageUrls.length,
  });

  if (!shouldContinue()) {
    LOG("SS fill: cancelled before start", { listingId });
    return;
  }

  const freshFlowReady = await ensureFreshSsListingFlow(
    listingId,
    shouldContinue,
  );
  if (!freshFlowReady) {
    LOG("SS fill: fresh listing flow not ready, skipping fill", { listingId });
    return;
  }

  if (propertyType || dealType) {
    // The first wizard step hydrates asynchronously, so retry until selected.
    await new Promise<void>((resolve) => {
      globalThis.setTimeout(() => {
        if (!shouldContinue()) {
          LOG("SS fill: cancelled before property/deal fill", { listingId });
          resolve();
          return;
        }
        void fillWithRetry({ propertyType, dealType }).finally(resolve);
      }, 350);
    });
  } else {
    LOG("SS fill: no propertyType/dealType in payload");
  }

  await fillDescriptionWithRetry(description, shouldContinue);

  if (imageUrls.length > 0) {
    if (!shouldContinue()) {
      LOG("SS fill: cancelled before image upload", { listingId });
      return;
    }
    await new Promise<void>((resolve) => {
      globalThis.setTimeout(() => {
        if (!shouldContinue()) {
          LOG("SS fill: cancelled during image upload delay", { listingId });
          resolve();
          return;
        }
        void fillSsPhotoUpload(imageUrls, listingId, shouldContinue).finally(
          resolve,
        );
      }, 450);
    });
  } else {
    LOG("SS fill: no images in payload");
  }
}
