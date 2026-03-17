/**
 * Shared logo URL for extension (chrome-extension://) or dev (public path).
 */
export function getLogoUrl(): string {
  if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
    return chrome.runtime.getURL("logo.png");
  }
  return "/logo.png";
}
