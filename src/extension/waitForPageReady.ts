/**
 * Waits for listing page to be ready before scraping. Two strategies:
 * - domQuiet: any selector matches, then DOM has no mutations for debounceMs (legacy; slow on busy pages).
 * - allMatchedSettle: each selector string must match (use commas inside one string for OR); then a short
 *   settle timer runs once — lazy images/ads won't keep resetting the wait.
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
const DEFAULT_SETTLE_MS = 320;
const DEFAULT_TIMEOUT_MS = 10_000;

export type WaitForPageReadyMode = "domQuiet" | "allMatchedSettle";

export interface WaitForPageReadyOptions {
  /**
   * Selector groups. In domQuiet mode: at least one must match. In allMatchedSettle mode: every entry
   * must match (each entry may be a comma list, i.e. OR within the group).
   */
  selectors: string[];
  mode?: WaitForPageReadyMode;
  /** domQuiet only: resolve after no mutations for this long. */
  debounceMs?: number;
  /** allMatchedSettle only: after all groups match, wait this long then resolve. */
  settleMs?: number;
  /** Max wait time; resolves anyway after this (and scraping can proceed). */
  timeoutMs?: number;
  /**
   * When true, skip the default full-page logo overlay. Use when the caller shows its own
   * progress UI (e.g. {@link createParseListingProgressOverlay}).
   */
  omitOverlay?: boolean;
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

/** True when every group matches at least one element (invalid selector → group fails). */
function allSelectorGroupsMatch(doc: Document, groups: string[]): boolean {
  for (const sel of groups) {
    try {
      if (!doc.querySelector(sel)) return false;
    } catch {
      return false;
    }
  }
  return true;
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
 * Waits for readiness per `mode`, then resolves. Uses MutationObserver so SPA inserts are detected.
 * Always resolves after timeoutMs regardless.
 */
export function waitForPageReady(
  doc: Document,
  options: WaitForPageReadyOptions,
): Promise<void> {
  const {
    selectors,
    mode = "domQuiet",
    debounceMs = DEFAULT_DEBOUNCE_MS,
    settleMs = DEFAULT_SETTLE_MS,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    omitOverlay = false,
  } = options;

  if (selectors.length === 0) {
    return Promise.resolve();
  }

  const root = doc.body ?? doc.documentElement;
  if (!root) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const removeOverlay = omitOverlay ? () => {} : createOverlay(doc);
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let resolved = false;

    function finish() {
      if (resolved) return;
      resolved = true;
      if (debounceTimer != null) clearTimeout(debounceTimer);
      if (settleTimer != null) clearTimeout(settleTimer);
      if (timeoutId != null) clearTimeout(timeoutId);
      observer.disconnect();
      removeOverlay();
      resolve();
    }

    function scheduleDomQuiet() {
      if (!hasAnyElement(doc, selectors)) return;
      if (debounceTimer != null) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(finish, debounceMs);
    }

    /** Listing shell: all groups present, then one short settle; do not reset on unrelated mutations. */
    function scheduleAllMatchedSettle() {
      if (!allSelectorGroupsMatch(doc, selectors)) {
        if (settleTimer != null) {
          clearTimeout(settleTimer);
          settleTimer = null;
        }
        return;
      }
      if (settleTimer == null) {
        settleTimer = setTimeout(finish, settleMs);
      }
    }

    const tick =
      mode === "allMatchedSettle" ? scheduleAllMatchedSettle : scheduleDomQuiet;

    const observer = new MutationObserver(() => {
      tick();
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    tick();

    timeoutId = setTimeout(finish, timeoutMs);
  });
}
