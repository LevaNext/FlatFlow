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

function clickContinuePlacementModalIfPresent(): boolean {
  const modals = document.querySelectorAll("div.sc-427d9738-2");
  for (const modal of modals) {
    const title = normalizeText(
      modal.querySelector("h1, h2, h3, h4, h5, h6, .title")?.textContent ?? "",
    );
    const modalText = normalizeText(modal.textContent ?? "");
    if (
      !title.includes("განთავსების გაგრძელება") &&
      !modalText.includes("დაუსრულებელი განცხადება")
    ) {
      continue;
    }

    const buttons = modal.querySelectorAll("button");
    for (const button of buttons) {
      const text = normalizeText(button.textContent ?? "");
      if (!text.includes("გააგრძელე განთავსება")) continue;
      if (!(button instanceof HTMLElement)) continue;
      LOG("SS fill: found continue placement modal, clicking button", { text });
      dispatchRealClick(button);
      return true;
    }

    LOG("SS fill: continue modal found but target button missing", {
      title,
      modalText,
    });
  }
  return false;
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
      const continued = clickContinuePlacementModalIfPresent();
      if (continued) {
        LOG("SS fill: clicked continue placement, waiting next retry");
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

function fillSsPhotoUpload(imageUrls: string[]): Promise<void> {
  return new Promise((resolve) => {
    if (
      imageUrls.length === 0 ||
      typeof chrome === "undefined" ||
      !chrome.runtime?.sendMessage
    ) {
      LOG("SS fill: photo upload skipped", {
        hasUrls: imageUrls.length > 0,
        hasRuntime:
          typeof chrome !== "undefined" && !!chrome.runtime?.sendMessage,
      });
      resolve();
      return;
    }

    const urlsToFetch = imageUrls.slice(0, 16);
    LOG("SS fill: requesting images from background", {
      total: imageUrls.length,
      fetchCount: urlsToFetch.length,
    });
    chrome.runtime.sendMessage(
      { type: MESSAGE_FETCH_IMAGES, urls: urlsToFetch },
      (response: string[] | { error?: string }) => {
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

        const files = response.map((dataUrl, i) => dataUrlToFile(dataUrl, i));
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
            fileInput.dispatchEvent(new Event("input", { bubbles: true }));
            fileInput.dispatchEvent(new Event("change", { bubbles: true }));
            LOG("SS fill: assigned files to input", { count: dt.files.length });
          } catch (err) {
            LOG(
              "SS fill: assigning input.files failed",
              (err as Error)?.message,
            );
          }
        }

        if (wrapper) {
          wrapper.dispatchEvent(new DragEvent("dragenter", eventOpts));
          wrapper.dispatchEvent(new DragEvent("dragover", eventOpts));
          wrapper.dispatchEvent(new DragEvent("drop", eventOpts));
          LOG("SS fill: dispatched drop events on wrapper", {
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
  const propertyType = payload.propertyType?.trim();
  const dealType = payload.dealType?.trim();
  const imageUrls = payload.imageUrls ?? [];

  LOG("SS fill: start", {
    propertyType,
    dealType,
    imageCount: imageUrls.length,
  });

  if (propertyType || dealType) {
    // The first wizard step hydrates asynchronously, so retry until selected.
    await new Promise<void>((resolve) => {
      globalThis.setTimeout(() => {
        void fillWithRetry({ propertyType, dealType }).finally(resolve);
      }, 350);
    });
  } else {
    LOG("SS fill: no propertyType/dealType in payload");
  }

  if (imageUrls.length > 0) {
    await new Promise<void>((resolve) => {
      globalThis.setTimeout(() => {
        void fillSsPhotoUpload(imageUrls).finally(resolve);
      }, 450);
    });
  } else {
    LOG("SS fill: no images in payload");
  }
}
