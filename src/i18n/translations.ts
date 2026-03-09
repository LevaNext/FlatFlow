/**
 * Translation loader: reads nested locale JSON and resolves dot-separated keys.
 * TranslationKey is derived from the locale shape so keys stay in sync with JSON.
 */

import en from "./locales/en/index.json";
import ka from "./locales/ka/index.json";
import ru from "./locales/ru/index.json";

export type Language = "ka" | "en" | "ru";

/** Recursively collect all dot-separated paths to string leaves in a nested object. */
type LeafPaths<T, Prefix extends string = ""> = T extends string
  ? Prefix
  : T extends Record<string, unknown>
    ? {
        [K in keyof T]: LeafPaths<
          T[K],
          Prefix extends "" ? K & string : `${Prefix}.${K & string}`
        >;
      }[keyof T] extends infer P
      ? P
      : never
    : never;

type LocaleShape = typeof en;
export type TranslationKey = LeafPaths<LocaleShape>;

export type Translations = Record<string, unknown>;

const localeByLang: Record<Language, Translations> = {
  en: en as Translations,
  ka: ka as Translations,
  ru: ru as Translations,
};

function getByPath(obj: Translations, path: string): string | undefined {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc !== null && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
  return typeof value === "string" ? value : undefined;
}

export function getTranslations(lang: Language): Translations {
  return localeByLang[lang] ?? localeByLang.en;
}

export function t(lang: Language, key: TranslationKey): string {
  const msg = getByPath(getTranslations(lang), key);
  return msg ?? key;
}
