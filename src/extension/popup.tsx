import {
  AlertCircle,
  Link as LinkIcon,
  Moon,
  Search,
  Settings,
  Sun,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ListingCard } from "./components/ListingCard";
import {
  detectFromUrl,
  getErrorMessage,
  type ListingSource,
  type MockListing,
} from "./detection";

function UploadButtons({
  source,
  onMyHomeClick,
}: {
  source: ListingSource | null;
  onMyHomeClick: () => void;
}): React.ReactElement {
  const myHomeEnabled = source === "myhome";

  return (
    <div className="flex flex-col gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={onMyHomeClick}
        disabled={!myHomeEnabled}
        className="w-full"
      >
        Upload to myhome.ge
      </Button>
      <Button size="sm" variant="outline" disabled className="w-full">
        Upload to ss.ge{" "}
        <Badge variant="secondary" className="ml-1.5">
          Coming soon
        </Badge>
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
  const [theme, setTheme] = useState<Theme>("dark");
  const [language, setLanguage] = useState<Language>("en");
  const [pastedUrl, setPastedUrl] = useState("");
  const [detectedListing, setDetectedListing] = useState<MockListing | null>(
    null,
  );
  const [detectionSource, setDetectionSource] = useState<ListingSource | null>(
    null,
  );
  const [detectionError, setDetectionError] = useState<string | null>(null);
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

  const addError = useCallback((message: string) => {
    errorIdRef.current += 1;
    const entry = {
      id: errorIdRef.current,
      message: `${new Date().toLocaleTimeString()}: ${message}`,
    };
    setErrorsList((prev) => [...prev, entry]);
  }, []);

  const runDetection = useCallback(
    (url: string) => {
      setDetectionError(null);
      setDetectedListing(null);
      setDetectionSource(null);
      const result = detectFromUrl(url);
      if (result.type === "unsupported") {
        const msg = getErrorMessage(result);
        setDetectionError(msg);
        addError(msg);
        return;
      }
      setDetectionSource(result.type);
      if (result.listing) setDetectedListing(result.listing);
    },
    [addError],
  );

  const handleDetectCurrentPage = useCallback(() => {
    if (typeof chrome === "undefined" || !chrome.tabs) {
      setDetectionError("Extension context not available");
      addError("Extension context not available");
      return;
    }
    chrome.tabs.query(
      { active: true, currentWindow: true },
      (tabs: chrome.tabs.Tab[]) => {
        const tab = tabs[0];
        if (!tab?.url) {
          setDetectionError("No URL available");
          addError("No URL available");
          return;
        }
        runDetection(tab.url);
      },
    );
  }, [runDetection, addError]);

  const handleDetectPastedUrl = useCallback(() => {
    const trimmed = pastedUrl.trim();
    if (!trimmed) {
      setDetectionError("Please paste a URL");
      addError("Please paste a URL");
      return;
    }
    runDetection(trimmed);
  }, [pastedUrl, runDetection, addError]);

  const handleUploadMyHome = useCallback(() => {
    alert("Upload to myhome.ge (MVP)");
  }, []);

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current" className="text-xs">
            Current Page
          </TabsTrigger>
          <TabsTrigger value="paste" className="text-xs">
            Paste URL
          </TabsTrigger>
          <TabsTrigger value="errors" className="text-xs">
            Errors
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="current"
          className="mt-3 flex flex-1 flex-col gap-3"
        >
          <Button
            size="sm"
            variant="outline"
            onClick={handleDetectCurrentPage}
            className="w-full"
          >
            <Search className="mr-2 size-4" />
            Detect Current Page
          </Button>
          {detectionError && (
            <p className="text-sm text-destructive">{detectionError}</p>
          )}
          {detectedListing && (
            <>
              <ListingCard listing={detectedListing} />
              <UploadButtons
                source={detectionSource}
                onMyHomeClick={handleUploadMyHome}
              />
            </>
          )}
        </TabsContent>
        <TabsContent value="paste" className="mt-3 flex flex-1 flex-col gap-3">
          <Input
            placeholder="Paste listing URL..."
            value={pastedUrl}
            onChange={(e) => setPastedUrl(e.target.value)}
            className="h-9"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleDetectPastedUrl}
            className="w-full"
          >
            <LinkIcon className="mr-2 size-4" />
            Detect Listing
          </Button>
          {detectionError && (
            <p className="text-sm text-destructive">{detectionError}</p>
          )}
          {detectedListing && (
            <>
              <ListingCard listing={detectedListing} />
              <UploadButtons
                source={detectionSource}
                onMyHomeClick={handleUploadMyHome}
              />
            </>
          )}
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

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<Popup />);
}
