/**
 * Waits for listing page to be ready before scraping: target elements present
 * and DOM stable (no mutations for debounce period). Uses MutationObserver.
 * Reusable for any site by passing configurable selectors.
 */

const OVERLAY_ID = "flatflow-wait-overlay";

/** Extension logo URL for overlay; fallback to icon if logo not listed in manifest. */
function getLogoUrl(): string {
  if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
    return chrome.runtime.getURL("logo.png");
  }
  return "";
}

const DEFAULT_DEBOUNCE_MS = 900;
const DEFAULT_TIMEOUT_MS = 10_000;

export interface WaitForPageReadyOptions {
  /** CSS selectors; at least one must match for page to be considered ready. */
  selectors: string[];
  /** Start scraping only after no DOM mutations for this many ms. */
  debounceMs?: number;
  /** Max wait time; resolves anyway after this (and scraping can proceed). */
  timeoutMs?: number;
}

function hasAnyElement(doc: Document, selectors: string[]): boolean {
  for (const sel of selectors) {
    try {
      if (doc.querySelector(sel)) return true;
    } catch {
      // invalid selector, skip
    }
  }
  return false;
}

function createOverlay(doc: Document): () => void {
  if (doc.getElementById(OVERLAY_ID)) return () => {};

  const style = doc.createElement("style");
  style.textContent = `
    @keyframes flatflow-bounce {
      0%, 100% { transform: translate(-50%, -50%) translateY(0); }
      50% { transform: translate(-50%, -50%) translateY(-12px); }
    }
    #${OVERLAY_ID} .flatflow-logo-wrap {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      animation: flatflow-bounce 0.9s ease-in-out infinite;
    }
  `;

  const wrap = doc.createElement("div");
  wrap.id = OVERLAY_ID;
  wrap.setAttribute("aria-live", "polite");
  wrap.setAttribute("aria-busy", "true");
  Object.assign(wrap.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483647",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "18px",
    color: "#fff",
    pointerEvents: "auto",
    userSelect: "none",
    WebkitUserSelect: "none",
  });

  const logoWrap = doc.createElement("div");
  logoWrap.className = "flatflow-logo-wrap";
  const logoUrl = getLogoUrl();
  if (logoUrl) {
    const img = doc.createElement("img");
    img.src = logoUrl;
    img.alt = "FlatFlow";
    Object.assign(img.style, {
      display: "block",
      width: "64px",
      height: "64px",
      objectFit: "contain",
    });
    logoWrap.appendChild(img);
  }
  wrap.appendChild(logoWrap);

  const body = doc.body;
  const prevPointerEvents = body.style.pointerEvents;
  const prevUserSelect = body.style.userSelect;
  const prevWebkitUserSelect = body.style.getPropertyValue(
    "-webkit-user-select",
  );
  body.style.pointerEvents = "none";
  body.style.userSelect = "none";
  body.style.setProperty("-webkit-user-select", "none");

  doc.head.appendChild(style);
  body.appendChild(wrap);

  return () => {
    body.style.pointerEvents = prevPointerEvents;
    body.style.userSelect = prevUserSelect;
    if (prevWebkitUserSelect)
      body.style.setProperty("-webkit-user-select", prevWebkitUserSelect);
    else body.style.removeProperty("-webkit-user-select");
    style.remove();
    wrap.remove();
  };
}

/**
 * Waits until (1) at least one of the given selectors matches an element in the DOM,
 * and (2) the DOM has been stable (no mutations) for debounceMs. Uses MutationObserver
 * so elements added later by React/SPA are detected. If elements already exist, starts
 * the stability timer immediately. Resolves after timeoutMs regardless.
 */
export function waitForPageReady(
  doc: Document,
  options: WaitForPageReadyOptions,
): Promise<void> {
  const {
    selectors,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  if (selectors.length === 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const removeOverlay = createOverlay(doc);
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let resolved = false;

    function finish() {
      if (resolved) return;
      resolved = true;
      if (debounceTimer != null) clearTimeout(debounceTimer);
      if (timeoutId != null) clearTimeout(timeoutId);
      observer.disconnect();
      removeOverlay();
      resolve();
    }

    function scheduleDebounce() {
      if (!hasAnyElement(doc, selectors)) return;
      if (debounceTimer != null) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(finish, debounceMs);
    }

    const observer = new MutationObserver(() => {
      scheduleDebounce();
    });

    observer.observe(doc.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    // If elements already exist, start debounce immediately
    scheduleDebounce();

    timeoutId = setTimeout(finish, timeoutMs);
  });
}
