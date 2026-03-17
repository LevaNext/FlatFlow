/**
 * Runtime environment detection: Chrome Extension vs normal website.
 * Use this to branch logic, entry points, or feature flags.
 */

/**
 * True when the app is running inside a Chrome Extension context
 * (e.g. side panel, popup, options page). Relies on chrome.runtime.id
 * being set by the extension.
 */
export function isExtension(): boolean {
  const g = globalThis as { chrome?: { runtime?: { id?: string } } };
  return g.chrome !== undefined && !!g.chrome?.runtime?.id;
}

/**
 * True when the app is running as a normal website (browser tab, local dev server).
 */
export function isWebsite(): boolean {
  return !isExtension();
}
