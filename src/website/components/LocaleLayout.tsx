/**
 * Validates `/:lang`, syncs preference to localStorage, and provides controlled LandingProvider.
 */
import { useCallback, useEffect } from "react";
import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { LandingProvider } from "../context/LandingContext";
import {
  DEFAULT_LANDING_LANG,
  getPreferredLandingLang,
  isLandingLang,
  LANG_STORAGE_KEY,
  type LandingLang,
} from "../landingTranslations";

export function RootLocaleRedirect(): React.ReactElement {
  const preferred = getPreferredLandingLang();
  return <Navigate to={`/${preferred}`} replace />;
}

function replaceLocaleInPath(pathname: string, next: LandingLang): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return `/${next}`;
  parts[0] = next;
  return `/${parts.join("/")}`;
}

export function LocaleLayout(): React.ReactElement {
  const { lang: langParam } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const lang = isLandingLang(langParam) ? langParam : null;

  useEffect(() => {
    if (!lang) return;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {}
  }, [lang]);

  const setLang = useCallback(
    (next: LandingLang) => {
      const path =
        replaceLocaleInPath(location.pathname, next) +
        location.search +
        location.hash;
      navigate(path);
    },
    [location.hash, location.pathname, location.search, navigate],
  );

  if (!lang) {
    const segments = location.pathname.split("/").filter(Boolean);
    segments.shift();
    const rest = segments.length ? `/${segments.join("/")}` : "";
    return <Navigate to={`/${DEFAULT_LANDING_LANG}${rest}`} replace />;
  }

  return (
    <LandingProvider lang={lang} setLang={setLang}>
      <Outlet />
    </LandingProvider>
  );
}

export function LegacyFaqRedirect(): React.ReactElement {
  return <Navigate to={`/${getPreferredLandingLang()}/faq`} replace />;
}

export function LegacyPrivacyRedirect(): React.ReactElement {
  return <Navigate to={`/${getPreferredLandingLang()}/privacy`} replace />;
}

export function LegacyDonationRedirect(): React.ReactElement {
  return (
    <Navigate
      to={{ pathname: `/${getPreferredLandingLang()}`, hash: "donation" }}
      replace
    />
  );
}

export function DonationHashRedirect(): React.ReactElement {
  const { lang } = useParams<{ lang: string }>();
  const target = isLandingLang(lang) ? lang : DEFAULT_LANDING_LANG;
  return <Navigate to={{ pathname: `/${target}`, hash: "donation" }} replace />;
}

export function UnknownPathRedirect(): React.ReactElement {
  return <Navigate to={`/${getPreferredLandingLang()}`} replace />;
}

export function FallbackWithinLocale(): React.ReactElement {
  const { lang } = useParams<{ lang: string }>();
  const target = isLandingLang(lang) ? lang : DEFAULT_LANDING_LANG;
  return <Navigate to={`/${target}`} replace />;
}
