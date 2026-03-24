/**
 * Landing page copy in Georgian (default) and English.
 */
export type LandingLang = "ka" | "en";

export const DEFAULT_LANDING_LANG: LandingLang = "ka";

export const LANG_STORAGE_KEY = "flatflow-lang";

export function isLandingLang(
  value: string | null | undefined,
): value is LandingLang {
  return value === "ka" || value === "en";
}

/** Used for `/` and legacy `/faq`-style redirects (localStorage, then browser). */
export function getPreferredLandingLang(): LandingLang {
  if (typeof window === "undefined") return DEFAULT_LANDING_LANG;
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (isLandingLang(stored)) {
      return stored;
    }
    if (stored === "ru") {
      localStorage.setItem(LANG_STORAGE_KEY, "ka");
      return "ka";
    }
  } catch {}
  const nav = navigator.language.toLowerCase();
  if (nav.startsWith("ka")) return "ka";
  return "en";
}

export const landingTranslations = {
  ka: {
    nav: {
      home: "მთავარი",
      faq: "FAQ",
      privacy: "კონფიდენციალურობის პოლიტიკა",
    },
    hero: {
      headline: "განცხადებების ავტომატური შევსება ერთ კლიკში",
      subtext: "",
      cta: "დააყენე Chrome Extension",
      soon: "ss.ge — მალე (Soon)",
      mockBadge: "✓ FlatFlow ავტომატურად ავსებს ველებს",
    },
    features: {
      title: "ფუნქციები",
      autoFill: "ავტომატური შევსება",
      autoFillSub: "ერთი კლიკით შევსება",
      saveTime: "დროის დაზოგვა",
      saveTimeSub: "შეამცირე გამეორება",
      accurateData: "ზუსტი მონაცემების გადატანა",
      accurateDataSub: "შეცდომების გარეშე",
      manifestV3: "Chrome Manifest V3 მხარდაჭერა",
      manifestV3Sub: "თანამედროვე ტექნოლოგია",
    },
    howItWorks: {
      title: "როგორ მუშაობს",
      step1: "გახსენი განცხადება",
      step2: "FlatFlow პარსავს მონაცემებს",
      step3: "ახალ გვერდზე ავტომატურად ავსებს ველებს",
    },
    faq: {
      title: "ხშირი კითხვები",
      q1: "როგორ მუშაობს?",
      q2: "არის თუ არა უსაფრთხო?",
      q3: "რა საიტებს უჭერს მხარს?",
      q4: "უფასოა?",
      a1: "FlatFlow ფარულად იკითხავს განცხადების გვერდს, ამოწმებს მონაცემებს და ახალ განცხადების ფორმაზე ავტომატურად ავსებს ველებს. ყველაფერი ხდება თქვენს ბრაუზერში.",
      a2: "დიახ. ჩვენ არ ვაგზავნით და არ ვინახავთ თქვენს მონაცემებს. ყველაფერი მუშაობს ლოკალურად თქვენს მოწყობილობაზე.",
      a3: "ამჟამად მხარდაჭერილია myhome.ge. ss.ge მალე დაემატება.",
      a4: "დიახ, FlatFlow უფასოა.",
    },
    privacy: {
      title: "კონფიდენციალურობის პოლიტიკა",
      lastUpdated: "ბოლო განახლება: მარტი 2025",
      noStorage: "ჩვენ არ ვინახავთ თქვენს მონაცემებს",
      local: "ყველაფერი მუშაობს ლოკალურად",
    },
    homeDonation: {
      eyebrow: "მხარდაჭერა",
      title: "SS.ge-ის ინტეგრაცია — სრული მხარდაჭერა",
      body: "შემოწირულება SS.ge-ის სრულ ინტეგრაციას ემსახურება FlatFlow-ში. გადაიხადეთ KISA-ს საშუალებით.",
      ctaKisa: "შემოწირულება KISA-ზე",
      qrCaption: "სკანირება",
    },
    footer: {
      privacy: "კონფიდენციალურობის პოლიტიკა",
      faq: "FAQ",
      copyright: "FlatFlow",
    },
  },
  en: {
    nav: {
      home: "Home",
      faq: "FAQ",
      privacy: "Privacy Policy",
    },
    hero: {
      headline: "Auto-fill listings in one click",
      subtext: "",
      cta: "Install Chrome Extension",
      soon: "ss.ge — Coming soon",
      mockBadge: "✓ FlatFlow auto-fills the fields",
    },
    features: {
      title: "Features",
      autoFill: "Auto-fill",
      autoFillSub: "One-click form filling",
      saveTime: "Save time",
      saveTimeSub: "Less repetition",
      accurateData: "Accurate data transfer",
      accurateDataSub: "No manual errors",
      manifestV3: "Chrome Manifest V3 support",
      manifestV3Sub: "Modern extension standard",
    },
    howItWorks: {
      title: "How it works",
      step1: "Open a listing",
      step2: "FlatFlow parses the data",
      step3: "Auto-fills fields on the new page",
    },
    faq: {
      title: "FAQ",
      q1: "How does it work?",
      q2: "Is it safe?",
      q3: "Which sites are supported?",
      q4: "Is it free?",
      a1: "FlatFlow reads the listing page in the background, extracts the data, and auto-fills the new listing form. Everything happens in your browser.",
      a2: "Yes. We do not send or store your data. Everything runs locally on your device.",
      a3: "Currently supported: myhome.ge. ss.ge is coming soon.",
      a4: "Yes, FlatFlow is free.",
    },
    privacy: {
      title: "Privacy Policy",
      lastUpdated: "Last updated: March 2025",
      noStorage: "We don't store your data",
      local: "Everything runs locally",
    },
    homeDonation: {
      eyebrow: "SS.ge",
      title: "Full support for SS.ge integration",
      body: "Donations fund completing SS.ge support in FlatFlow. Give via KISA—scan the QR or open the link.",
      ctaKisa: "Donate on KISA",
      qrCaption: "Scan",
    },
    footer: {
      privacy: "Privacy Policy",
      faq: "FAQ",
      copyright: "FlatFlow",
    },
  },
} as const;
