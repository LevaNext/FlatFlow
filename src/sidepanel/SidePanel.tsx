import { useCallback, useEffect, useRef, useState } from "react";
import {
  MESSAGE_CLOSE_SIDE_PANEL,
  MESSAGE_PANEL_CLOSED,
  MESSAGE_PARSE_LISTING,
  STORAGE_KEY_ACTIVE_FILL_LISTING_ID,
  STORAGE_KEY_STATEMENT_FILL_ACTIVE,
} from "@/extension/messages";
import { useActiveTabDomain } from "@/hooks/useActiveTabDomain";
import { type TranslationKey, TranslationProvider, t } from "@/i18n";
import { detectSite, type SiteId } from "@/parsing";
import {
  clearParsedListing,
  getParsedListing,
  normalizeListingPageUrl,
  type ParsedListingPayload,
  saveParsedListing,
} from "@/storage/parsedListingStorage";
import type { ListingData } from "@/types/listing";
import type { ParserError } from "@/types/parser";
import "../index.css";
import { MYHOME_GE, SS_GE } from "@/shared/constants";
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

interface ParseRequestContext {
  requestId: string;
  pageUrl: string;
}

function createRequestId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `parse-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

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
  const activeParseRequestRef = useRef<ParseRequestContext | null>(null);
  const activeParsedPayloadRef = useRef<ParsedListingPayload | null>(null);

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
      void chrome.storage.session.set({
        [STORAGE_KEY_SIDE_PANEL_OPEN]: false,
      });
      void chrome.storage.local.set({
        [STORAGE_KEY_STATEMENT_FILL_ACTIVE]: false,
      });
      void chrome.storage.local.remove(STORAGE_KEY_ACTIVE_FILL_LISTING_ID);
      chrome.runtime
        .sendMessage({ type: MESSAGE_PANEL_CLOSED })
        .catch(() => {});
    };

    chrome.runtime.onMessage.addListener(onMessage);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      chrome.runtime.onMessage.removeListener(onMessage);
      window.removeEventListener("pagehide", onPageHide);
      void chrome.storage.session.set({
        [STORAGE_KEY_SIDE_PANEL_OPEN]: false,
      });
      void chrome.storage.local.set({
        [STORAGE_KEY_STATEMENT_FILL_ACTIVE]: false,
      });
      void chrome.storage.local.remove(STORAGE_KEY_ACTIVE_FILL_LISTING_ID);
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
    (response: ParseMessageResponse, context: ParseRequestContext) => {
      const activeRequest = activeParseRequestRef.current;
      if (
        activeRequest?.requestId !== context.requestId ||
        activeRequest.pageUrl !== context.pageUrl
      ) {
        console.debug("[FlatFlow] ignoring stale parse response", {
          responseRequestId: context.requestId,
          activeRequestId: activeRequest?.requestId,
          responsePageUrl: context.pageUrl,
          activePageUrl: activeRequest?.pageUrl,
        });
        return;
      }

      setLoading(false);
      const errs = response?.errors ?? [];
      setParsingErrors(errs);
      if (response?.listing) {
        const listing = response.listing;
        if (!listing.listingId) {
          setError(tForLang("errors.failedParse"));
          return;
        }

        setListing(listing);
        setError(null);
        if (listing.propertyType != null || listing.dealType != null) {
          console.debug(
            "[FlatFlow] saving listing with propertyType:",
            listing.propertyType,
            "dealType:",
            listing.dealType,
            "listingId:",
            listing.listingId,
          );
        }
        const payload: ParsedListingPayload = {
          data: listing,
          errors: errs,
          meta: {
            listingId: listing.listingId,
            source: listing.source,
            parsedAt: Date.now(),
            pageUrl: normalizeListingPageUrl(context.pageUrl),
          },
        };
        activeParsedPayloadRef.current = payload;
        saveParsedListing(payload).then(onListingSaved);
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
      context: ParseRequestContext,
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
      handleParseResponse(response, context);
    },
    [handleParseResponse, onScriptInjected, tForLang],
  );

  const makeParseMessageHandler = useCallback(
    (
      tabId: number,
      retried: boolean,
      context: ParseRequestContext,
      retry: () => void,
    ) =>
      (
        response:
          | {
              listing?: ListingData;
              error?: string;
            }
          | undefined,
      ) => {
        onParseMessageReceived(response, tabId, retried, context, retry);
      },
    [onParseMessageReceived],
  );

  const trySendParseMessage = useCallback(
    (tabId: number, retried: boolean, context: ParseRequestContext) => {
      const retry = () => trySendParseMessage(tabId, true, context);
      chrome.tabs.sendMessage(
        tabId,
        { type: MESSAGE_PARSE_LISTING, requestId: context.requestId },
        makeParseMessageHandler(tabId, retried, context, retry),
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
    activeParseRequestRef.current = null;
    activeParsedPayloadRef.current = null;

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
          void clearParsedListing();
          setError(tForLang("errors.unsupportedSite"));
          setLoading(false);
          return;
        }

        if (detected === "ss") {
          void clearParsedListing();
          setError(null);
          setLoading(false);
          return;
        }

        if (!tab.id) {
          setError(tForLang("errors.couldNotAccessTab"));
          setLoading(false);
          return;
        }

        const context = { requestId: createRequestId(), pageUrl: tab.url };
        activeParseRequestRef.current = context;
        trySendParseMessage(tab.id, false, context);
      },
    );
  }, [trySendParseMessage, tForLang]);

  // Listing detail: reuse cached parse for the same tab URL; otherwise parse once.
  useEffect(() => {
    if (!isListingDetailPage || tabUrl == null) return;

    const normalized = normalizeListingPageUrl(tabUrl);
    setListing(null);
    setParsingErrors([]);
    setError(null);
    setSiteId(null);
    setLoading(true);
    activeParseRequestRef.current = null;
    activeParsedPayloadRef.current = null;

    void (async () => {
      const stored = await getParsedListing();
      if (
        stored.ok &&
        stored.value.data.listingId === stored.value.meta.listingId &&
        stored.value.meta.pageUrl != null &&
        normalizeListingPageUrl(stored.value.meta.pageUrl) === normalized
      ) {
        setListing(stored.value.data);
        setParsingErrors(stored.value.errors);
        setSiteId(stored.value.meta.source);
        setError(null);
        setLoading(false);
        activeParsedPayloadRef.current = stored.value;
        return;
      }

      requestListingFromCurrentTab();
    })();
  }, [isListingDetailPage, tabUrl, requestListingFromCurrentTab]);

  useEffect(() => {
    if (isLoading || isListingDetailPage) return;
    setListing(null);
    setParsingErrors([]);
    setError(null);
    activeParseRequestRef.current = null;
    activeParsedPayloadRef.current = null;
  }, [isLoading, isListingDetailPage]);

  const openStatementPage = useCallback(
    (url: string) => {
      if (typeof chrome === "undefined" || !chrome.tabs) return;
      const payload = activeParsedPayloadRef.current;
      const currentListing = listing;
      const currentListingId = currentListing?.listingId;
      if (
        payload != null &&
        currentListingId != null &&
        payload.data.listingId === currentListingId
      ) {
        console.debug("[FlatFlow] opening statement for listing", {
          listingId: currentListingId,
          imageCount: currentListing?.imageUrls?.length ?? 0,
        });
        void saveParsedListing(payload);
        void chrome.storage.local.set({
          [STORAGE_KEY_STATEMENT_FILL_ACTIVE]: true,
          [STORAGE_KEY_ACTIVE_FILL_LISTING_ID]: currentListingId,
        });
      } else {
        console.debug("[FlatFlow] opening blank statement; no active listing");
        void clearParsedListing();
        void chrome.storage.local.set({
          [STORAGE_KEY_STATEMENT_FILL_ACTIVE]: false,
        });
        void chrome.storage.local.remove(STORAGE_KEY_ACTIVE_FILL_LISTING_ID);
      }

      setListing(null);
      setParsingErrors([]);
      setSiteId(null);
      setError(null);
      activeParseRequestRef.current = null;
      activeParsedPayloadRef.current = null;
      chrome.tabs.create({ url });
    },
    [listing],
  );

  const handleUploadMyHome = useCallback(() => {
    if (typeof chrome === "undefined" || !chrome.tabs) return;
    // Keep parsed listing in storage so the statement page content script can read it and fill price + photos.
    // Do not clear here; the statement page reads from storage on load.
    openStatementPage(MYHOME_GE.statementUrl);
  }, [openStatementPage]);

  const handleUploadSs = useCallback(() => {
    if (typeof chrome === "undefined" || !chrome.tabs) return;
    openStatementPage(SS_GE.statementUrl);
  }, [openStatementPage]);

  const renderCurrentPageContent = (): React.ReactElement => {
    if (loading) {
      return <LoadingLogo />;
    }
    if (siteId === "unsupported") {
      return (
        <>
          <UnsupportedMessage />
          <UploadButtons
            siteId={siteId}
            onMyHomeClick={handleUploadMyHome}
            onSsClick={handleUploadSs}
          />
        </>
      );
    }
    if (siteId === "ss") {
      return (
        <UploadButtons
          siteId={siteId}
          onMyHomeClick={handleUploadMyHome}
          onSsClick={handleUploadSs}
        />
      );
    }
    if (siteId === "myhome") {
      if (error && !listing) {
        return (
          <>
            <p className="text-sm text-destructive">{error}</p>
            <UploadButtons
              siteId={siteId}
              onMyHomeClick={handleUploadMyHome}
              onSsClick={handleUploadSs}
            />
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
            <UploadButtons
              siteId={siteId}
              onMyHomeClick={handleUploadMyHome}
              onSsClick={handleUploadSs}
            />
          </>
        );
      }
      return <LoadingLogo />;
    }
    return (
      <UploadButtons
        siteId={siteId}
        onMyHomeClick={handleUploadMyHome}
        onSsClick={handleUploadSs}
      />
    );
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
