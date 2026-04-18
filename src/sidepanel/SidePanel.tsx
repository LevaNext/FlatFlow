import { useCallback, useEffect, useRef, useState } from "react";
import {
  MESSAGE_CLOSE_SIDE_PANEL,
  MESSAGE_PANEL_CLOSED,
  MESSAGE_PARSE_LISTING,
} from "@/extension/messages";
import { useActiveTabDomain } from "@/hooks/useActiveTabDomain";
import { type TranslationKey, TranslationProvider, t } from "@/i18n";
import { detectSite, type SiteId } from "@/parsing";
import {
  getParsedListing,
  normalizeListingPageUrl,
  saveParsedListing,
} from "@/storage/parsedListingStorage";
import type { ListingData } from "@/types/listing";
import type { ParserError } from "@/types/parser";
import "../index.css";
import { MYHOME_GE } from "@/shared/constants";
import { type Language, Layout, type Theme } from "./components/Layout";
import { ListingPreview } from "./components/ListingPreview";
import { LoadingLogo } from "./components/LoadingLogo";
import { ParsingErrors } from "./components/ParsingErrors";
import { SelectListingView } from "./components/SelectListingView";
import { StatementSuccessView } from "./components/StatementSuccessView";
import { UnsupportedMessage } from "./components/UnsupportedMessage";
import { UnsupportedSiteView } from "./components/UnsupportedSiteView";
import { UploadButtons } from "./components/UploadButtons";

const STORAGE_KEY_SIDE_PANEL_OPEN = "sidePanelOpen";

function SidePanel(): React.ReactElement {
  const {
    isSupported,
    isStatementPage,
    isMyHomeRoot,
    isListingDetailPage,
    isLoading,
    tabUrl,
  } = useActiveTabDomain();
  const [theme, setTheme] = useState<Theme>("dark");
  const [language, setLanguage] = useState<Language>("ka");
  const [siteId, setSiteId] = useState<SiteId | null>(null);
  const [listing, setListing] = useState<ListingData | null>(null);
  const [parsingErrors, setParsingErrors] = useState<ParserError[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  /** Tab URL of the last parse request (used when saving `pageUrl` to storage). */
  const lastParseTabUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Track panel open/closed so extension icon click can toggle (close when open)
  useEffect(() => {
    void chrome.storage.session.set({ [STORAGE_KEY_SIDE_PANEL_OPEN]: true });

    const onMessage = (message: { type: string }) => {
      if (message.type === MESSAGE_CLOSE_SIDE_PANEL) {
        window.close();
      }
    };

    const onPageHide = () => {
      void chrome.storage.session.set({ [STORAGE_KEY_SIDE_PANEL_OPEN]: false });
      chrome.runtime
        .sendMessage({ type: MESSAGE_PANEL_CLOSED })
        .catch(() => {});
    };

    chrome.runtime.onMessage.addListener(onMessage);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      chrome.runtime.onMessage.removeListener(onMessage);
      window.removeEventListener("pagehide", onPageHide);
      void chrome.storage.session.set({ [STORAGE_KEY_SIDE_PANEL_OPEN]: false });
    };
  }, []);

  const tForLang = useCallback(
    (key: TranslationKey) => t(language, key),
    [language],
  );

  type ParseMessageResponse =
    | {
        listing?: ListingData | null;
        errors?: ParserError[];
        error?: string;
      }
    | undefined;

  const onListingSaved = useCallback(() => {}, []);

  const handleParseResponse = useCallback(
    (response: ParseMessageResponse) => {
      setLoading(false);
      const errs = response?.errors ?? [];
      setParsingErrors(errs);
      if (response?.listing) {
        setListing(response.listing);
        setError(null);
        if (
          response.listing.propertyType != null ||
          response.listing.dealType != null
        ) {
          console.debug(
            "[FlatFlow] saving listing with propertyType:",
            response.listing.propertyType,
            "dealType:",
            response.listing.dealType,
          );
        }
        const rawUrl = lastParseTabUrlRef.current;
        saveParsedListing({
          data: response.listing,
          errors: errs,
          meta: {
            source: response.listing.source,
            parsedAt: Date.now(),
            ...(rawUrl ? { pageUrl: normalizeListingPageUrl(rawUrl) } : {}),
          },
        }).then(onListingSaved);
      } else {
        setError(response?.error ?? tForLang("errors.failedParse"));
      }
    },
    [onListingSaved, tForLang],
  );

  const onScriptInjected = useCallback(
    (retry: () => void) => {
      if (chrome.runtime.lastError) {
        setLoading(false);
        setError(tForLang("errors.refreshPage"));
        return;
      }
      retry();
    },
    [tForLang],
  );

  const onParseMessageReceived = useCallback(
    (
      response: { listing?: ListingData; error?: string } | undefined,
      tabId: number,
      retried: boolean,
      retry: () => void,
    ) => {
      if (chrome.runtime.lastError) {
        if (!retried && chrome.scripting?.executeScript) {
          chrome.scripting.executeScript(
            { target: { tabId }, files: ["content.js"] },
            () => onScriptInjected(retry),
          );
          return;
        }
        setLoading(false);
        setError(tForLang("errors.refreshPage"));
        return;
      }
      handleParseResponse(response);
    },
    [handleParseResponse, onScriptInjected, tForLang],
  );

  const makeParseMessageHandler = useCallback(
    (tabId: number, retried: boolean, retry: () => void) =>
      (
        response:
          | {
              listing?: ListingData;
              error?: string;
            }
          | undefined,
      ) => {
        onParseMessageReceived(response, tabId, retried, retry);
      },
    [onParseMessageReceived],
  );

  const trySendParseMessage = useCallback(
    (tabId: number, retried: boolean) => {
      const retry = () => trySendParseMessage(tabId, true);
      chrome.tabs.sendMessage(
        tabId,
        { type: MESSAGE_PARSE_LISTING },
        makeParseMessageHandler(tabId, retried, retry),
      );
    },
    [makeParseMessageHandler],
  );

  const requestListingFromCurrentTab = useCallback(() => {
    setError(null);
    setListing(null);
    setParsingErrors([]);
    setSiteId(null);
    setLoading(true);

    if (typeof chrome === "undefined" || !chrome.tabs) {
      setError(tForLang("errors.extensionContext"));
      setLoading(false);
      return;
    }

    chrome.tabs.query(
      { active: true, currentWindow: true },
      (tabs: chrome.tabs.Tab[]) => {
        const tab = tabs[0];
        if (!tab?.url) {
          setError(tForLang("errors.noUrl"));
          setLoading(false);
          return;
        }

        const detected = detectSite(tab.url);
        setSiteId(detected);

        if (detected === "unsupported") {
          setError(tForLang("errors.unsupportedSite"));
          setLoading(false);
          return;
        }

        if (detected === "ss") {
          setError(null);
          setLoading(false);
          return;
        }

        if (!tab.id) {
          setError(tForLang("errors.couldNotAccessTab"));
          setLoading(false);
          return;
        }

        lastParseTabUrlRef.current = tab.url ?? null;
        trySendParseMessage(tab.id, false);
      },
    );
  }, [trySendParseMessage, tForLang]);

  // Listing detail: reuse cached parse for the same tab URL; otherwise parse once.
  useEffect(() => {
    if (!isListingDetailPage || tabUrl == null) return;

    const normalized = normalizeListingPageUrl(tabUrl);

    void (async () => {
      const stored = await getParsedListing();
      if (
        stored.ok &&
        stored.value.meta.pageUrl != null &&
        normalizeListingPageUrl(stored.value.meta.pageUrl) === normalized
      ) {
        setListing(stored.value.data);
        setParsingErrors(stored.value.errors);
        setSiteId(stored.value.meta.source);
        setError(null);
        setLoading(false);
        return;
      }

      requestListingFromCurrentTab();
    })();
  }, [isListingDetailPage, tabUrl, requestListingFromCurrentTab]);

  const handleUploadMyHome = useCallback(() => {
    if (typeof chrome === "undefined" || !chrome.tabs) return;
    // Keep parsed listing in storage so the statement page content script can read it and fill price + photos.
    // Do not clear here; the statement page reads from storage on load.
    setListing(null);
    setParsingErrors([]);
    setSiteId(null);
    setError(null);
    chrome.tabs.create({ url: MYHOME_GE.statementUrl });
  }, []);

  const renderCurrentPageContent = (): React.ReactElement => {
    if (loading) {
      return <LoadingLogo />;
    }
    if (siteId === "unsupported") {
      return (
        <>
          <UnsupportedMessage />
          <UploadButtons siteId={siteId} onMyHomeClick={handleUploadMyHome} />
        </>
      );
    }
    if (siteId === "ss") {
      return (
        <>
          <p className="text-sm text-muted-foreground">
            {tForLang("status.ssComingSoon")}
          </p>
          <UploadButtons siteId={siteId} onMyHomeClick={handleUploadMyHome} />
        </>
      );
    }
    if (siteId === "myhome") {
      if (error && !listing) {
        return (
          <>
            <p className="text-sm text-destructive">{error}</p>
            <UploadButtons siteId={siteId} onMyHomeClick={handleUploadMyHome} />
          </>
        );
      }
      if (listing) {
        return (
          <>
            <ListingPreview
              listing={listing}
              onRefresh={requestListingFromCurrentTab}
            />
            {parsingErrors.length > 0 && (
              <ParsingErrors errors={parsingErrors} />
            )}
            <UploadButtons siteId={siteId} onMyHomeClick={handleUploadMyHome} />
          </>
        );
      }
      return <LoadingLogo />;
    }
    return <UploadButtons siteId={siteId} onMyHomeClick={handleUploadMyHome} />;
  };

  // Unsupported domain → full-page only, no header/footer
  if (!isSupported) {
    return (
      <TranslationProvider language={language}>
        <UnsupportedSiteView />
      </TranslationProvider>
    );
  }

  // Supported: always show layout with header and footer
  const mainContent = (() => {
    if (isLoading) {
      return <LoadingLogo />;
    }
    if (isStatementPage) {
      return <StatementSuccessView />;
    }
    if (isMyHomeRoot || !isListingDetailPage) {
      return <SelectListingView />;
    }
    // myhome.ge/pr/... (listing detail only) → debounce loader then listing card + upload
    return (
      <div className="flex flex-1 flex-col gap-3 overflow-auto px-3 py-2">
        {renderCurrentPageContent()}
      </div>
    );
  })();

  return (
    <TranslationProvider language={language}>
      <Layout
        theme={theme}
        onThemeChange={setTheme}
        language={language}
        onLanguageChange={setLanguage}
      >
        {mainContent}
      </Layout>
    </TranslationProvider>
  );
}

export default SidePanel;
