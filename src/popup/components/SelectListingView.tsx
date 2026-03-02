/**
 * Empty state when the active tab is myhome.ge root (homepage) with no path.
 * Prompts the user to navigate to a specific listing page.
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

export function SelectListingView(): React.ReactElement {
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
          <EmptyTitle>Select a Listing to Continue</EmptyTitle>
          <EmptyDescription>
            You&apos;re currently on the MyHome homepage. Please navigate to the
            specific listing page you want to upload or edit.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
