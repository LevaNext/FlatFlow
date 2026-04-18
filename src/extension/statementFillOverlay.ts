/**
 * Full-page loader on the statement/create tab while autofill runs.
 */

import {
  BLOCKING_OVERLAY_ROOT_CLASS,
  BODY_INTERACTION_LOCK_CLASS,
  blockingOverlayLockRuleCss,
} from "@/extension/blockingOverlayShared";
import type { PageLang } from "@/parsing/myhome/selectors/getPageLang";

const OVERLAY_ID = "flatflow-statement-fill-overlay";
const STYLE_ID = "flatflow-statement-fill-style";

const MESSAGES: Record<PageLang, string> = {
  ka: "ველების შევსება…",
  en: "Filling in the form…",
  ru: "Заполнение полей…",
};

export type StatementFillOverlay = Readonly<{
  show: () => void;
  hide: () => void;
}>;

export function createStatementFillOverlay(
  doc: Document,
  lang: PageLang,
): StatementFillOverlay {
  let wrap: HTMLDivElement | null = null;
  let styleEl: HTMLStyleElement | null = null;
  let visible = false;
  let bodyPrev = { userSelect: "", webkitUserSelect: "" };

  function build(): void {
    styleEl = doc.createElement("style");
    styleEl.id = STYLE_ID;
    styleEl.textContent = `
      @keyframes flatflow-fill-spin {
        to { transform: rotate(360deg); }
      }
      #${OVERLAY_ID} {
        backdrop-filter: blur(3px);
        -webkit-backdrop-filter: blur(3px);
        touch-action: none;
      }
      ${blockingOverlayLockRuleCss()}
      #${OVERLAY_ID} .flatflow-fill-spinner {
        width: 2.25rem;
        height: 2.25rem;
        border: 3px solid rgba(255, 255, 255, 0.25);
        border-top-color: #fff;
        border-radius: 50%;
        animation: flatflow-fill-spin 0.75s linear infinite;
      }
      #${OVERLAY_ID} .flatflow-fill-label {
        text-shadow: 0 1px 12px rgba(0, 0, 0, 0.9);
      }
    `;

    wrap = doc.createElement("div");
    wrap.id = OVERLAY_ID;
    wrap.classList.add(BLOCKING_OVERLAY_ROOT_CLASS);
    wrap.setAttribute("aria-busy", "true");
    wrap.setAttribute("aria-live", "polite");
    Object.assign(wrap.style, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483646",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "1rem",
      padding: "1rem",
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      color: "#fff",
      fontFamily:
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      pointerEvents: "auto",
      userSelect: "none",
      WebkitUserSelect: "none",
    });

    const spinner = doc.createElement("div");
    spinner.className = "flatflow-fill-spinner";
    spinner.setAttribute("aria-hidden", "true");

    const label = doc.createElement("p");
    label.className = "flatflow-fill-label";
    label.textContent = MESSAGES[lang] ?? MESSAGES.en;
    Object.assign(label.style, {
      margin: "0",
      fontSize: "0.9rem",
      fontWeight: "500",
      textAlign: "center",
    });

    wrap.appendChild(spinner);
    wrap.appendChild(label);
  }

  return {
    show: () => {
      if (visible) return;
      doc.getElementById(OVERLAY_ID)?.remove();
      doc.body?.classList.remove(BODY_INTERACTION_LOCK_CLASS);
      doc.getElementById(STYLE_ID)?.remove();
      build();
      if (!wrap || !styleEl) return;
      const body = doc.body;
      bodyPrev = {
        userSelect: body.style.userSelect,
        webkitUserSelect: body.style.getPropertyValue("-webkit-user-select"),
      };
      body.style.userSelect = "none";
      body.style.setProperty("-webkit-user-select", "none");
      body.classList.add(BODY_INTERACTION_LOCK_CLASS);
      doc.head.appendChild(styleEl);
      body.appendChild(wrap);
      visible = true;
    },

    hide: () => {
      if (!visible) return;
      const body = doc.body;
      body.classList.remove(BODY_INTERACTION_LOCK_CLASS);
      body.style.userSelect = bodyPrev.userSelect;
      if (bodyPrev.webkitUserSelect)
        body.style.setProperty(
          "-webkit-user-select",
          bodyPrev.webkitUserSelect,
        );
      else body.style.removeProperty("-webkit-user-select");
      styleEl?.remove();
      wrap?.remove();
      styleEl = null;
      wrap = null;
      visible = false;
    },
  };
}
