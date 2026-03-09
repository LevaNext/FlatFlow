/**
 * Full-page success/encouragement state when the active tab is statements.myhome.ge.
 * Renders only this UI (no tabs, no app content). Positive, friendly message.
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

export function StatementSuccessView(): React.ReactElement {
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
        <EmptyTitle>{t("statementSuccess.title")}</EmptyTitle>
        <EmptyDescription>{t("statementSuccess.description")}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
