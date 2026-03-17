import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";
import type { Language, TranslationKey } from "./translations";
import { t as tFn } from "./translations";

type T = (key: TranslationKey) => string;

const TranslationContext = createContext<{ language: Language; t: T } | null>(
  null,
);

export function TranslationProvider({
  language,
  children,
}: Readonly<{ language: Language; children: ReactNode }>): React.ReactElement {
  const t = useCallback<T>(
    (key: TranslationKey) => tFn(language, key),
    [language],
  );
  const value = useMemo(() => ({ language, t }), [language, t]);
  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation(): { language: Language; t: T } {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within TranslationProvider");
  }
  return ctx;
}
