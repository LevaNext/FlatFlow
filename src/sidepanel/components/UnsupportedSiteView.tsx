/**
 * When the active tab is not a supported site: show "Navigate to supported websites"
 * with two buttons — MyHome and SS.ge — that redirect the current tab.
 */

import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { MYHOME_GE, SS_GE } from "@/shared/constants";
import { getLogoUrl } from "@/utils/logo";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./Empty";

export function UnsupportedSiteView(): React.ReactElement {
  const { t } = useTranslation();
  const goTo = useCallback((url: string) => {
    if (typeof chrome === "undefined" || !chrome.tabs) return;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.id) chrome.tabs.update(tab.id, { url });
    });
  }, []);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden border-0 bg-background font-sans text-foreground side-panel-root-shadow">
      <Empty className="flex justify-evenly h-[100dvh]">
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
          <EmptyTitle className="mt-8">
            {t("unsupported.navigateTitle")}
          </EmptyTitle>
        </EmptyHeader>
        <EmptyContent className="flex w-full max-w-sm flex-col gap-3">
          <Button
            onClick={() => goTo(MYHOME_GE.baseUrl)}
            variant="glass"
            className="h-12 w-full"
          >
            {t("unsupported.goToMyHome")}
          </Button>
          <Button
            onClick={() => goTo(SS_GE.baseUrl)}
            variant="glass"
            className="h-12 w-full gap-2"
            disabled
          >
            <span>{t("unsupported.goToSs")}</span>
            <Badge
              variant="outline"
              className="border-primary shrink-0 text-primary"
            >
              {t("unsupported.soon")}
            </Badge>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
