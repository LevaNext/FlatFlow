/**
 * Full-page "Unsupported Site" empty state when the active tab is not myhome.ge.
 * Renders only this UI (no tabs, no app layout). "Go to MyHome" redirects the current tab.
 */

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./Empty";

const MYHOME_URL = "https://www.myhome.ge";

function getLogoUrl(): string {
  if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
    return chrome.runtime.getURL("icons/icon128.png");
  }
  return "/icons/icon128.png";
}

export function UnsupportedSiteView(): React.ReactElement {
  const goToMyHome = useCallback(() => {
    if (typeof chrome === "undefined" || !chrome.tabs) return;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.id) {
        chrome.tabs.update(tab.id, { url: MYHOME_URL });
      }
    });
  }, []);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden border-0 bg-background font-sans text-foreground popup-root-shadow">
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <img
              src={getLogoUrl()}
              alt=""
              className="h-16 w-16 rounded-full object-contain"
              width={64}
              height={64}
            />
          </EmptyMedia>
          <EmptyTitle>Unsupported Website</EmptyTitle>
          <EmptyDescription>
            Side detection could not be completed. This extension only supports
            myhome.ge.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={goToMyHome}>Go to MyHome</Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
