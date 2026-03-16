/**
 * React hook: active tab domain and support status for the Side Panel.
 * Uses chrome.tabs.query({ active: true, currentWindow: true }) and
 * listens to tab activation/URL changes so the UI updates when the user
 * navigates to/from myhome.ge without closing the panel.
 */

import { useCallback, useEffect, useState } from "react";
import { MYHOME_GE } from "@/shared/constants";

/** Main listing site: show normal app UI (parse listing, upload, etc.) */
const SUPPORTED_DOMAIN = MYHOME_GE.domain;
/** Statement create page: show success/encouragement state only */
const STATEMENT_DOMAIN = MYHOME_GE.statementHost;

function getDomainFromUrl(url: string | undefined): string | null {
  if (url == null || typeof url !== "string" || url.trim() === "") return null;
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith("chrome://") ||
    trimmed.startsWith("chrome-extension://") ||
    trimmed === "about:blank"
  ) {
    return null;
  }
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

/** True for myhome.ge and statements.myhome.ge (so panel shows app UI or statement success). */
function isSupportedDomain(domain: string | null): boolean {
  return domain === SUPPORTED_DOMAIN || domain === STATEMENT_DOMAIN;
}

function isStatementPageDomain(domain: string | null): boolean {
  return domain === STATEMENT_DOMAIN;
}

/** Pathname from URL; null if unparseable. Root is "" or "/". */
function getPathname(url: string | null | undefined): string | null {
  if (url == null || typeof url !== "string" || url.trim() === "") return null;
  try {
    return new URL(url).pathname;
  } catch {
    return null;
  }
}

/** True when path is root only: "" or "/" (no segments). */
function isRootPath(pathname: string | null): boolean {
  if (pathname == null) return false;
  const p = pathname.trim();
  return p === "" || p === "/";
}

/** True when on myhome.ge listing detail page (path contains /pr/). Only then show debounce loader and parse. */
function isListingDetailPath(
  pathname: string | null,
  domain: string | null,
): boolean {
  if (domain !== SUPPORTED_DOMAIN || pathname == null) return false;
  return pathname.toLowerCase().includes("/pr/");
}

function queryActiveTab(): Promise<{
  url: string | null;
  domain: string | null;
  pathname: string | null;
}> {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.tabs) {
      resolve({ url: null, domain: null, pathname: null });
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      const url = tab?.url ?? null;
      const domain = getDomainFromUrl(url ?? undefined);
      const pathname = getPathname(url);
      resolve({ url: url ?? null, domain, pathname });
    });
  });
}

export interface UseActiveTabDomainResult {
  /** Normalized hostname (no www), or null if unparseable / chrome page */
  domain: string | null;
  /** True only for myhome.ge / www.myhome.ge (listing pages; show normal app UI when not at root) */
  isSupported: boolean;
  /** True when hostname is statements.myhome.ge (show success state only) */
  isStatementPage: boolean;
  /** True when on myhome.ge at root only (pathname "/" or ""); show "Select a Listing" empty state */
  isMyHomeRoot: boolean;
  /** True when on myhome.ge listing detail page (path contains /pr/); only then show debounce loader and parse */
  isListingDetailPage: boolean;
  /** Current tab URL when available; use as dependency to re-run effects when URL changes (e.g. navigate within myhome) */
  tabUrl: string | null;
  /** True until the first tab query has completed (avoids flashing Unsupported when actually on myhome.ge) */
  isLoading: boolean;
  /** Re-run the query (e.g. after user clicks "Go to MyHome") */
  refresh: () => void;
}

export function useActiveTabDomain(): UseActiveTabDomainResult {
  const [domain, setDomain] = useState<string | null>(null);
  const [tabUrl, setTabUrl] = useState<string | null>(null);
  const [pathname, setPathname] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const update = useCallback(() => {
    queryActiveTab().then(({ url, domain: d, pathname: p }) => {
      setDomain(d);
      setTabUrl(url);
      setPathname(p);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    update();
  }, [update]);

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.tabs) return;
    const onActivated = () => update();
    const onUpdated = (
      _tabId: number,
      changeInfo: { url?: string; status?: string },
    ) => {
      const urlChanged = "url" in changeInfo && changeInfo.url != null;
      const loadComplete = changeInfo.status === "complete";
      if (urlChanged || loadComplete) update();
    };
    chrome.tabs.onActivated.addListener(onActivated);
    chrome.tabs.onUpdated.addListener(onUpdated);
    return () => {
      chrome.tabs.onActivated.removeListener(onActivated);
      chrome.tabs.onUpdated.removeListener(onUpdated);
    };
  }, [update]);

  const isSupported = isSupportedDomain(domain);
  const isStatementPage = isStatementPageDomain(domain);
  const isMyHomeRoot = domain === SUPPORTED_DOMAIN && isRootPath(pathname);
  const isListingDetailPage = isListingDetailPath(pathname, domain);

  return {
    domain,
    isSupported,
    isStatementPage,
    isMyHomeRoot,
    isListingDetailPage,
    tabUrl,
    isLoading,
    refresh: update,
  };
}
