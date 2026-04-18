/**
 * Full-page overlay on the listing tab (not the extension side panel).
 * Centered content (no panel chrome): brand label + step list. Copy follows page language (ka / en / ru).
 * Steps follow the same order as the MyHome parser phases (plus `wait` for listing-shell readiness).
 */

import {
  BLOCKING_OVERLAY_ROOT_CLASS,
  BODY_INTERACTION_LOCK_CLASS,
  blockingOverlayLockRuleCss,
} from "@/extension/blockingOverlayShared";
import {
  MYHOME_PARSE_PROGRESS_PHASE_ORDER,
  type MyHomeParseProgressPhase,
} from "@/parsing/myhome/myhome.parser";
import type { PageLang } from "@/parsing/myhome/selectors/getPageLang";

const OVERLAY_ID = "flatflow-parse-progress-overlay";
const OVERLAY_STYLE_ID = "flatflow-parse-progress-style";

export type ParseOverlayPhase = "wait" | MyHomeParseProgressPhase;

type StepCopy = Record<ParseOverlayPhase, string>;

const COPY: Record<PageLang, StepCopy> = {
  ka: {
    wait: "ლისტინგის გვერდის მზადყოფნამდე მოლოდინი…",
    title: "სათაური და გარიგების ტიპი…",
    propertyType: "უძრავი ქონების ტიპი…",
    images: "ფოტოები…",
    price: "ფასი…",
    address: "მისამართი…",
    listingMeta: "ID და სტატისტიკა…",
    listingAttributes: "ფართი, ოთახები…",
    status: "სტატუსი…",
    condition: "მდგომარეობა…",
    projectType: "პროექტის ტიპი…",
    pageLang: "ენა…",
  },
  en: {
    wait: "Listing page ready (shell)…",
    title: "Title & deal type…",
    propertyType: "Property type…",
    images: "Photos…",
    price: "Price…",
    address: "Address…",
    listingMeta: "ID & stats…",
    listingAttributes: "Area & rooms…",
    status: "Status…",
    condition: "Condition…",
    projectType: "Project type…",
    pageLang: "Page language…",
  },
  ru: {
    wait: "Ожидание готовности страницы объявления…",
    title: "Заголовок и тип сделки…",
    propertyType: "Тип недвижимости…",
    images: "Фотографии…",
    price: "Цена…",
    address: "Адрес…",
    listingMeta: "ID и статистика…",
    listingAttributes: "Площадь и комнаты…",
    status: "Статус…",
    condition: "Состояние…",
    projectType: "Тип проекта…",
    pageLang: "Язык страницы…",
  },
};

const PHASE_ORDER: ParseOverlayPhase[] = [
  "wait",
  ...MYHOME_PARSE_PROGRESS_PHASE_ORDER,
];

function copyFor(lang: PageLang): StepCopy {
  return COPY[lang] ?? COPY.en;
}

export type ParseListingProgressOverlay = Readonly<{
  mount: () => void;
  setStep: (phase: ParseOverlayPhase) => void;
  /** Mark every step complete (brief success state before `destroy`). */
  markAllComplete: () => void;
  destroy: () => void;
}>;

export function createParseListingProgressOverlay(
  doc: Document,
  lang: PageLang,
): ParseListingProgressOverlay {
  const labels = copyFor(lang);
  const stepEls = new Map<ParseOverlayPhase, HTMLLIElement>();

  let mounted = false;
  let wrap: HTMLDivElement | null = null;
  let styleEl: HTMLStyleElement | null = null;

  function buildDom(): void {
    styleEl = doc.createElement("style");
    styleEl.id = OVERLAY_STYLE_ID;
    styleEl.textContent = `
      @keyframes flatflow-parse-backdrop-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes flatflow-parse-card-in {
        from {
          opacity: 0;
          transform: translateY(1.25rem) scale(0.94);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      @keyframes flatflow-parse-step-in {
        from {
          opacity: 0;
          transform: translateX(-0.5rem);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes flatflow-parse-spin {
        to { transform: rotate(360deg); }
      }
      @keyframes flatflow-parse-active-row {
        0%, 100% { transform: translateX(0); }
        45% { transform: translateX(0.28rem); }
      }
      @keyframes flatflow-parse-content-success {
        0%, 100% { transform: scale(1); }
        45% { transform: scale(1.03); }
      }
      #${OVERLAY_ID} {
        animation: flatflow-parse-backdrop-in 0.35s ease both;
        /* Opaque scrim + light blur so brightness does not depend on listing photos underneath */
        backdrop-filter: blur(3px);
        -webkit-backdrop-filter: blur(3px);
        touch-action: none;
      }
      ${blockingOverlayLockRuleCss()}
      #${OVERLAY_ID} .flatflow-parse-card {
        animation: flatflow-parse-card-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both;
        max-width: min(26rem, calc(100vw - 2rem));
        width: 100%;
        padding: 1.5rem 1.25rem 1.35rem;
        background: transparent;
        border: none;
        box-shadow: none;
        border-radius: 0;
        text-shadow: 0 1px 12px rgba(0, 0, 0, 0.9), 0 0 2px rgba(0, 0, 0, 0.5);
      }
      #${OVERLAY_ID} .flatflow-parse-card.flatflow-parse-card--success {
        animation: flatflow-parse-content-success 0.55s ease both;
      }
      #${OVERLAY_ID} .flatflow-parse-brand {
        text-align: center;
        margin-bottom: 1rem;
      }
      #${OVERLAY_ID} .flatflow-parse-step {
        animation: flatflow-parse-step-in 0.42s ease backwards;
        animation-delay: calc(var(--ff-step-i, 0) * 0.038s);
        transition:
          opacity 0.28s ease,
          transform 0.28s ease,
          border-color 0.28s ease;
      }
      #${OVERLAY_ID} .flatflow-parse-step-icon {
        width: 1.125rem;
        height: 1.125rem;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #${OVERLAY_ID} .flatflow-parse-step.active .flatflow-parse-step-icon {
        border: 2px solid rgba(255, 255, 255, 0.35);
        border-top-color: #fff;
        border-radius: 50%;
        animation: flatflow-parse-spin 0.7s linear infinite;
      }
      #${OVERLAY_ID} .flatflow-parse-step.done .flatflow-parse-step-icon {
        border: none !important;
        animation: none !important;
        color: #86efac;
        font-size: 0.95rem;
        font-weight: 700;
      }
      #${OVERLAY_ID} .flatflow-parse-step.pending .flatflow-parse-step-icon {
        color: rgba(255, 255, 255, 0.25);
        font-size: 0.65rem;
      }
      #${OVERLAY_ID} .flatflow-parse-step.pending .flatflow-parse-step-label {
        opacity: 0.45;
      }
      #${OVERLAY_ID} .flatflow-parse-step.active .flatflow-parse-step-label {
        opacity: 1;
        font-weight: 600;
        animation: flatflow-parse-active-row 0.48s ease;
      }
      #${OVERLAY_ID} .flatflow-parse-step.done .flatflow-parse-step-label {
        opacity: 0.75;
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
      zIndex: "2147483647",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      overflow: "auto",
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      color: "#fff",
      fontFamily:
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      pointerEvents: "auto",
      userSelect: "none",
      WebkitUserSelect: "none",
    });

    const card = doc.createElement("div");
    card.className = "flatflow-parse-card";

    const brand = doc.createElement("div");
    brand.className = "flatflow-parse-brand";
    brand.textContent = "FlatFlow";
    Object.assign(brand.style, {
      fontSize: "0.65rem",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      opacity: "0.55",
      fontWeight: "600",
    });

    const ul = doc.createElement("ul");
    Object.assign(ul.style, {
      listStyle: "none",
      margin: "0",
      padding: "0",
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    });

    let stepIndex = 0;
    for (const phase of PHASE_ORDER) {
      const li = doc.createElement("li");
      li.className = "flatflow-parse-step pending";
      li.dataset.phase = phase;
      li.style.setProperty("--ff-step-i", String(stepIndex));
      stepIndex += 1;
      Object.assign(li.style, {
        display: "flex",
        alignItems: "flex-start",
        gap: "0.5rem",
        fontSize: "0.76rem",
        lineHeight: "1.32",
      });

      const icon = doc.createElement("span");
      icon.className = "flatflow-parse-step-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "•";

      const label = doc.createElement("span");
      label.className = "flatflow-parse-step-label";
      label.textContent = labels[phase];

      li.appendChild(icon);
      li.appendChild(label);
      ul.appendChild(li);
      stepEls.set(phase, li);
    }

    card.appendChild(brand);
    card.appendChild(ul);
    wrap.appendChild(card);
  }

  function markAllComplete(): void {
    for (const p of PHASE_ORDER) {
      const li = stepEls.get(p);
      if (!li) continue;
      const icon = li.querySelector(".flatflow-parse-step-icon");
      li.classList.remove("pending", "active", "done");
      li.classList.add("done");
      if (icon) icon.textContent = "✓";
    }
    const card = wrap?.querySelector(".flatflow-parse-card");
    if (card) card.classList.add("flatflow-parse-card--success");
  }

  function applyStep(phase: ParseOverlayPhase): void {
    const idx = PHASE_ORDER.indexOf(phase);
    if (idx < 0) return;
    for (let i = 0; i < PHASE_ORDER.length; i++) {
      const p = PHASE_ORDER[i];
      const li = stepEls.get(p);
      if (!li) continue;
      const icon = li.querySelector(".flatflow-parse-step-icon");
      li.classList.remove("pending", "active", "done");
      if (i < idx) {
        li.classList.add("done");
        if (icon) icon.textContent = "✓";
      } else if (i === idx) {
        li.classList.add("active");
        if (icon) icon.textContent = "";
      } else {
        li.classList.add("pending");
        if (icon) icon.textContent = "•";
      }
    }
    const card = wrap?.querySelector(".flatflow-parse-card");
    if (card) card.classList.remove("flatflow-parse-card--success");
  }

  let bodyPrev = { userSelect: "", webkitUserSelect: "" };

  return {
    mount: () => {
      if (mounted) return;
      doc.getElementById(OVERLAY_ID)?.remove();
      doc.body?.classList.remove(BODY_INTERACTION_LOCK_CLASS);
      doc.getElementById(OVERLAY_STYLE_ID)?.remove();
      buildDom();
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
      mounted = true;
      applyStep("wait");
    },

    setStep: (phase: ParseOverlayPhase) => {
      applyStep(phase);
    },

    markAllComplete: () => {
      markAllComplete();
    },

    destroy: () => {
      if (!mounted) return;
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
      stepEls.clear();
      mounted = false;
    },
  };
}
