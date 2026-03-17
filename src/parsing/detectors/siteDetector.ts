/**
 * Website detection from URL. Parsing-only: no upload or navigation logic.
 */

import { MYHOME_GE, SS_GE } from "@/shared/constants";

export type SiteId = "myhome" | "ss" | "unsupported";

function getHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isMyHome(host: string): boolean {
  return MYHOME_GE.hosts.includes(host as (typeof MYHOME_GE.hosts)[number]);
}

function isSs(host: string): boolean {
  return SS_GE.hosts.includes(host as (typeof SS_GE.hosts)[number]);
}

/**
 * Detect which site the URL belongs to.
 */
export function detectSite(url: string): SiteId {
  const host = getHostname(url);
  if (!host) return "unsupported";
  if (isMyHome(host)) return "myhome";
  if (isSs(host)) return "ss";
  return "unsupported";
}
