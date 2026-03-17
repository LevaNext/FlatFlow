/**
 * Empty state when the active tab is myhome.ge root (homepage) with no path.
 * Prompts the user to navigate to a specific listing page.
 */

import { useTranslation } from "@/i18n";
import { getLogoUrl } from "@/utils/logo";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./Empty";

export function SelectListingView(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <Empty className="flex-1 overflow-auto">
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
        <EmptyTitle>{t("selectListing.title")}</EmptyTitle>
        <EmptyDescription>{t("selectListing.description")}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
