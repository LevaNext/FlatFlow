import { AlertCircle, Moon, Settings, Sun } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MESSAGE_PARSE_LISTING } from "@/extension/messages";
import { useActiveTabDomain } from "@/hooks/useActiveTabDomain";
import { detectSite, type SiteId } from "@/parsing";
import {
  getParsedListing,
  type SaveResult,
  saveParsedListing,
} from "@/storage/parsedListingStorage";
import type { ListingData } from "@/types/listing";
import type { ParserError } from "@/types/parser";
import "../index.css";
import { ListingPreview } from "./components/ListingPreview";
import { ParsingErrors } from "./components/ParsingErrors";
import { SelectListingView } from "./components/SelectListingView";
import { StatementSuccessView } from "./components/StatementSuccessView";
import { UnsupportedMessage } from "./components/UnsupportedMessage";
import { UnsupportedSiteView } from "./components/UnsupportedSiteView";

const SS_COMING_SOON = "SS.ge parsing coming soon";
const MYHOME_STATEMENT_URL =
  "https://statements.myhome.ge/ka/statement/create?referrer=myhome";

function UploadButtons({
  siteId,
  onMyHomeClick,
}: Readonly<{
  siteId: SiteId | null;
  onMyHomeClick: () => void;
}>): React.ReactElement {
  const myHomeEnabled = siteId === "myhome";

  return (
    <div className="flex flex-col gap-2">
      <Button
        size="sm"
        variant={myHomeEnabled ? "default" : "outline"}
        onClick={onMyHomeClick}
        disabled={!myHomeEnabled}
        className="w-full"
      >
        Upload to MyHome
      </Button>
    </div>
  );
}

type Theme = "dark" | "light";
type Language = "en" | "ka";

const LANGUAGE_LABELS: Record<Language, string> = {
  en: "EN",
  ka: "KA",
};

function Popup(): React.ReactElement {
  const { isSupported, isStatementPage, isMyHomeRoot, isLoading } =
    useActiveTabDomain();
  const [theme, setTheme] = useState<Theme>("dark");
  const [language, setLanguage] = useState<Language>("en");
  const [siteId, setSiteId] = useState<SiteId | null>(null);
  const [listing, setListing] = useState<ListingData | null>(null);
  const [parsingErrors, setParsingErrors] = useState<ParserError[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorsList, setErrorsList] = useState<
    { id: number; message: string }[]
  >([]);
  const errorIdRef = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    getParsedListing().then((result) => {
      if (result.ok) {
        setListing(result.value.data);
        setParsingErrors(result.value.errors);
        setSiteId(result.value.meta.source);
      }
    });
  }, []);

  const addError = useCallback((message: string) => {
    errorIdRef.current += 1;
    setErrorsList((prev) => [
      ...prev,
      {
        id: errorIdRef.current,
        message: `${new Date().toLocaleTimeString()}: ${message}`,
      },
    ]);
  }, []);

  type ParseMessageResponse =
    | {
        listing?: ListingData | null;
        errors?: ParserError[];
        error?: string;
      }
    | undefined;

  const onListingSaved = useCallback(
    (saveResult: SaveResult) => {
      if (!saveResult.ok) {
        addError(`Storage: ${saveResult.error}`);
      }
    },
    [addError],
  );

  const handleParseResponse = useCallback(
    (response: ParseMessageResponse) => {
      setLoading(false);
      const errs = response?.errors ?? [];
      setParsingErrors(errs);
      if (errs.length > 0) {
        for (const e of errs) {
          addError(`[${e.code}] ${e.message}`);
        }
      }
      if (response?.listing) {
        setListing(response.listing);
        setError(null);
        saveParsedListing({
          data: response.listing,
          errors: errs,
          meta: {
            source: response.listing.source,
            parsedAt: Date.now(),
          },
        }).then(onListingSaved);
      } else {
        setError(response?.error ?? "Failed to parse listing");
        if (response?.error) addError(response.error);
      }
    },
    [addError, onListingSaved],
  );

  const onScriptInjected = useCallback(
    (retry: () => void) => {
      if (chrome.runtime.lastError) {
        setLoading(false);
        setError(
          "Could not read page. Refresh the listing page and try again.",
        );
        addError(
          chrome.runtime.lastError?.message ??
            "Content script injection failed",
        );
        return;
      }
      retry();
    },
    [addError],
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
        setError(
          "Could not read page. Refresh the listing page and try again.",
        );
        addError(chrome.runtime.lastError?.message ?? "Content script error");
        return;
      }
      handleParseResponse(response);
    },
    [addError, handleParseResponse, onScriptInjected],
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
      setError("Extension context not available");
      addError("Extension context not available");
      setLoading(false);
      return;
    }

    chrome.tabs.query(
      { active: true, currentWindow: true },
      (tabs: chrome.tabs.Tab[]) => {
        const tab = tabs[0];
        if (!tab?.url) {
          setError("No URL available");
          addError("No URL available");
          setLoading(false);
          return;
        }

        const detected = detectSite(tab.url);
        setSiteId(detected);

        if (detected === "unsupported") {
          setError("This website is not supported yet");
          addError("Unsupported website");
          setLoading(false);
          return;
        }

        if (detected === "ss") {
          setError(null);
          setLoading(false);
          return;
        }

        if (!tab.id) {
          setError("Could not access tab");
          setLoading(false);
          return;
        }

        trySendParseMessage(tab.id, false);
      },
    );
  }, [addError, trySendParseMessage]);

  // When the active tab is myhome.ge with a path (listing page), parse listing. Skip at root (isMyHomeRoot).
  useEffect(() => {
    if (!isSupported || isMyHomeRoot) return;
    requestListingFromCurrentTab();
  }, [isSupported, isMyHomeRoot, requestListingFromCurrentTab]);

  const handleUploadMyHome = useCallback(() => {
    if (typeof chrome === "undefined" || !chrome.tabs) return;
    // Keep parsed listing in storage so the statement page content script can read it and fill price + photos.
    // Do not clear here; the statement page reads from storage on load.
    setListing(null);
    setParsingErrors([]);
    setSiteId(null);
    setError(null);
    chrome.tabs.create({ url: MYHOME_STATEMENT_URL });
  }, []);

  const renderCurrentPageContent = (): React.ReactElement => {
    if (loading) {
      return <p className="text-sm text-muted-foreground">Parsing listing…</p>;
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
          <p className="text-sm text-muted-foreground">{SS_COMING_SOON}</p>
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
            <ListingPreview listing={listing} />
            {parsingErrors.length > 0 && (
              <ParsingErrors errors={parsingErrors} />
            )}
            <UploadButtons siteId={siteId} onMyHomeClick={handleUploadMyHome} />
          </>
        );
      }
    }
    return <UploadButtons siteId={siteId} onMyHomeClick={handleUploadMyHome} />;
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background text-muted-foreground text-sm">
        Checking…
      </div>
    );
  }
  // statements.myhome.ge → success/encouragement state only
  if (isStatementPage) {
    return <StatementSuccessView />;
  }
  // myhome.ge at root only (no path) → "Select a Listing" empty state
  if (isMyHomeRoot) {
    return <SelectListingView />;
  }
  // Any other domain → unsupported
  if (!isSupported) {
    return <UnsupportedSiteView />;
  }
  // myhome.ge with path (listing pages) → normal app UI

  return (
    <div className="flex h-full w-full flex-col overflow-hidden border-0 bg-background font-sans text-foreground popup-root-shadow">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <h1 className="text-lg font-semibold tracking-tight text-foreground shrink-0">
          FlatFlow
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              aria-label="Settings"
            >
              <Settings className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2">
            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Theme
            </DropdownMenuLabel>
            <ToggleGroup
              type="single"
              value={theme}
              onValueChange={(v) => {
                if (v) setTheme(v as Theme);
              }}
              variant="outline"
              size="sm"
              className="mb-1 w-full rounded-md border border-border p-0.5"
            >
              <ToggleGroupItem
                value="dark"
                aria-label="Dark"
                className="flex-1 px-3"
                title="Dark"
              >
                <Moon className="mr-1.5 size-4" />
                Dark
              </ToggleGroupItem>
              <ToggleGroupItem
                value="light"
                aria-label="Light"
                className="flex-1 px-3"
                title="Light"
              >
                <Sun className="mr-1.5 size-4" />
                Light
              </ToggleGroupItem>
            </ToggleGroup>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Language
            </DropdownMenuLabel>
            <ToggleGroup
              type="single"
              value={language}
              onValueChange={(v) => {
                if (v) setLanguage(v as Language);
              }}
              variant="outline"
              size="sm"
              className="w-full rounded-md border border-border p-0.5"
            >
              <ToggleGroupItem
                value="en"
                aria-label="English"
                className="flex-1 px-3 text-xs"
                title="English"
              >
                {LANGUAGE_LABELS.en}
              </ToggleGroupItem>
              <ToggleGroupItem
                value="ka"
                aria-label="Georgian"
                className="flex-1 px-3 text-xs"
                title="ქართული"
              >
                {LANGUAGE_LABELS.ka}
              </ToggleGroupItem>
            </ToggleGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Tabs defaultValue="current" className="flex flex-1 flex-col px-3 py-2">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current" className="text-xs">
            Current Page
          </TabsTrigger>
          <TabsTrigger value="errors" className="text-xs">
            Errors
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="current"
          className="mt-3 flex flex-1 flex-col gap-3"
        >
          {renderCurrentPageContent()}
        </TabsContent>
        <TabsContent value="errors" className="mt-3 flex-1 overflow-auto">
          {errorsList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No errors yet.</p>
          ) : (
            <div className="space-y-2">
              {errorsList.map(({ id, message }) => (
                <Card key={id}>
                  <CardContent className="flex items-center gap-2 p-3">
                    <AlertCircle className="size-4 shrink-0 text-destructive" />
                    <span className="text-sm">{message}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Popup;
