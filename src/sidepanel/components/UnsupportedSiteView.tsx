/**
 * Full-page "Unsupported Site" empty state when the active tab is not myhome.ge.
 * Renders only this UI (no tabs, no app layout). "Go to MyHome" redirects the current tab.
 */

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { getLogoUrl } from "@/utils/logo";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./Empty";

const MYHOME_URL = "https://www.myhome.ge";

export function UnsupportedSiteView(): React.ReactElement {
  const { t } = useTranslation();
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
    <div className="flex h-full w-full flex-col overflow-hidden border-0 bg-background font-sans text-foreground side-panel-root-shadow">
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <img
              src={getLogoUrl()}
              alt={t("common.altLogo")}
              className="h-16 w-auto max-w-[200px] object-contain object-center"
              width={200}
              height={64}
            />
          </EmptyMedia>
          <EmptyTitle>{t("unsupported.title")}</EmptyTitle>
          <EmptyDescription>{t("unsupported.description")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={goToMyHome}>{t("unsupported.goToMyHome")}</Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
