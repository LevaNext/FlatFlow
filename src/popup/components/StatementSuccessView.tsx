/**
 * Full-page success/encouragement state when the active tab is statements.myhome.ge.
 * Renders only this UI (no tabs, no app content). Positive, friendly message.
 */

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./Empty";

function getLogoUrl(): string {
  if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
    return chrome.runtime.getURL("icons/icon128.png");
  }
  return "/icons/icon128.png";
}

export function StatementSuccessView(): React.ReactElement {
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
          <EmptyTitle>You&apos;re doing great!</EmptyTitle>
          <EmptyDescription>
            Nice job — you&apos;re already filling out a listing with my help.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
