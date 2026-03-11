/**
 * Location names in Georgian (ka), English (en), and Russian (ru).
 * Used to derive location from listing title (last word) and to fill the statement form in the correct language.
 */

export interface LocationOption {
  ka: string;
  en: string;
  ru: string;
}

export const LOCATIONS: LocationOption[] = [
  { ka: "თბილისი", en: "Tbilisi", ru: "Тбилиси" },
  { ka: "ბათუმი", en: "Batumi", ru: "Батуми" },
  { ka: "ქუთაისი", en: "Qutaisi", ru: "Кутаиси" },
  { ka: "რუსთავი", en: "Rustavi", ru: "Рустави" },
  { ka: "ზუგდიდი", en: "Zugdidi", ru: "Зугдиди" },
  { ka: "თელავი", en: "Telavi", ru: "Телави" },
  { ka: "გორი", en: "Gori", ru: "Гори" },
  { ka: "ბაკურიანი", en: "Bakuriani", ru: "Бакуриани" },
  { ka: "ბორჯომი", en: "Borjomi", ru: "Боржоми" },
  { ka: "გუდაური", en: "Gudauri", ru: "Гудаури" },
  { ka: "ჯავა", en: "Java", ru: "Джава" },
  {
    ka: "აფხაზეთის ავტონომიური რესპუბლიკა",
    en: "Autonomous Republic of Abkhazia",
    ru: "Автономная Республика Абхазия",
  },
  {
    ka: "დმანისის რაიონი",
    en: "Dmanisi Municipality",
    ru: "Дманисский муниципалитет",
  },
  {
    ka: "ცხინვალის რაიონი",
    en: "Tskhinvali District",
    ru: "Цхинвальский Район",
  },
  {
    ka: "სენაკის რაიონი",
    en: "Senaki Municipality",
    ru: "Муниципалитет Сенаки",
  },
  {
    ka: "საჩხერის რაიონი",
    en: "Sachkhere Municipality",
    ru: "Сачхерский муниципалитет",
  },
  {
    ka: "ონის რაიონი",
    en: "Oni Municipality",
    ru: "Они Муниципалиты",
  },
  {
    ka: "ნინოწმინდის რაიონი",
    en: "Ninotsminda Municipality",
    ru: "Ниноцминдский муниципалитет",
  },
  { ka: "აბასთუმანი", en: "Abastumani", ru: "Абастумани" },
  { ka: "აბაშა", en: "Abasha", ru: "Абаша" },
];

const DEFAULT_LOCATION: LocationOption = LOCATIONS[0]; // Tbilisi

/**
 * Get the last word from a title string (trimmed, split by whitespace).
 */
function getLastWord(title: string): string {
  const t = title.replaceAll(/\s+/g, " ").trim();
  if (!t) return "";
  const parts = t.split(" ");
  return parts.at(-1) ?? "";
}

/**
 * Find a location by matching the given string against ka, en, or ru (case-insensitive).
 */
function findLocationByString(str: string): LocationOption | undefined {
  if (!str) return undefined;
  const lower = str.trim().toLowerCase();
  return LOCATIONS.find(
    (loc) =>
      loc.ka.trim().toLowerCase() === lower ||
      loc.en.trim().toLowerCase() === lower ||
      loc.ru.trim().toLowerCase() === lower,
  );
}

/**
 * Derive location from listing title: use the last word and match against locations.
 * If the last word is not in the locations list, return Tbilisi.
 */
export function getLocationFromTitle(
  title: string | undefined,
): LocationOption {
  if (!title || typeof title !== "string") return DEFAULT_LOCATION;
  const lastWord = getLastWord(title);
  const found = findLocationByString(lastWord);
  return found ?? DEFAULT_LOCATION;
}
