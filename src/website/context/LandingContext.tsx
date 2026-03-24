/**
 * Shared language and theme state for the website (landing, FAQ, Privacy).
 * `lang` is controlled by the locale segment in the URL (see LocaleLayout).
 */
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { LandingLang } from "../landingTranslations";
import { landingTranslations } from "../landingTranslations";

type LandingContextValue = {
  lang: LandingLang;
  setLang: (lang: LandingLang) => void;
  dark: boolean;
  toggleTheme: () => void;
  t: (typeof landingTranslations)[LandingLang];
};

const LandingContext = createContext<LandingContextValue | null>(null);

function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const stored = localStorage.getItem("flatflow-theme");
      if (stored === "light") return false;
      if (stored === "dark") return true;
    } catch {}
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      try {
        localStorage.setItem("flatflow-theme", "dark");
      } catch {}
    } else {
      root.classList.remove("dark");
      try {
        localStorage.setItem("flatflow-theme", "light");
      } catch {}
    }
  }, [dark]);

  const toggle = useCallback(() => setDark((d) => !d), []);
  return { dark, toggle };
}

export function LandingProvider({
  children,
  lang,
  setLang,
}: Readonly<{
  children: ReactNode;
  lang: LandingLang;
  setLang: (lang: LandingLang) => void;
}>) {
  const { dark, toggle } = useTheme();
  const t = landingTranslations[lang];

  useEffect(() => {
    document.documentElement.lang = lang === "ka" ? "ka" : "en";
  }, [lang]);

  const value = useMemo<LandingContextValue>(
    () => ({
      lang,
      setLang,
      dark,
      toggleTheme: toggle,
      t,
    }),
    [lang, setLang, dark, toggle, t],
  );

  return (
    <LandingContext.Provider value={value}>{children}</LandingContext.Provider>
  );
}

export function useLanding() {
  const ctx = useContext(LandingContext);
  if (!ctx) throw new Error("useLanding must be used within LandingProvider");
  return ctx;
}
