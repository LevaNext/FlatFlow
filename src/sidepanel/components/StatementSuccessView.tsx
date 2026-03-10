/**
 * Full-page success/encouragement state when the active tab is statements.myhome.ge.
 * Renders only this UI (no tabs, no app content). Positive, friendly message.
 */

import { Smile } from "lucide-react";
import { useTranslation } from "@/i18n";
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
          <Smile
            className="h-16 w-16 text-primary"
            strokeWidth={1.5}
            aria-hidden
          />
        </EmptyMedia>
        <EmptyTitle>{t("statementSuccess.title")}</EmptyTitle>
        <EmptyDescription>{t("statementSuccess.description")}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
