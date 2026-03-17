/**
 * Detects page language from html lang attribute or language switcher (Eng / Рус / ქართ).
 * Used when parsing listing so lang can be saved with the listing and used when filling the statement form.
 */

export type PageLang = "ka" | "en" | "ru";

function fromHtmlLang(root: Element): PageLang | null {
  const lang = (root.getAttribute("lang") ?? "").trim().toLowerCase();
  if (lang.startsWith("en")) return "en";
  if (lang.startsWith("ru")) return "ru";
  if (lang.startsWith("ka") || lang === "ka") return "ka";
  return null;
}

function fromPath(doc: Document): PageLang | null {
  try {
    const path = (doc.defaultView?.location?.pathname ?? "").toLowerCase();
    if (path.includes("/en") || path.startsWith("/en/")) return "en";
    if (path.includes("/ru") || path.startsWith("/ru/")) return "ru";
  } catch {
    // ignore
  }
  return null;
}

function fromSwitcher(body: HTMLElement): PageLang | null {
  const all = body.querySelectorAll("a, button, [role='button']");
  for (const el of all) {
    const text = (el.textContent ?? "").trim();
    const isActive =
      el.getAttribute("aria-current") === "page" ||
      el.classList.contains("active");
    if (!isActive) continue;
    if (/^Eng$/i.test(text)) return "en";
    if (/^Рус$/i.test(text)) return "ru";
    if (/ქართ|ქარ/.test(text)) return "ka";
  }
  return null;
}

/**
 * Returns the current page language. Checks documentElement.lang, then URL path (/en/, /ru/),
 * then language switcher (Eng, Рус, ქართ) with active state. Defaults to "ka".
 */
export function getPageLang(doc: Document): PageLang {
  const fromRoot = fromHtmlLang(doc.documentElement);
  if (fromRoot) return fromRoot;

  const fromUrl = fromPath(doc);
  if (fromUrl) return fromUrl;

  if (doc.body) {
    const fromUi = fromSwitcher(doc.body);
    if (fromUi) return fromUi;
  }

  return "ka";
}
