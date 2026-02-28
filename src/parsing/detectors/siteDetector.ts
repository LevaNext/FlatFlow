/**
 * Website detection from URL. Parsing-only: no upload or navigation logic.
 */

export type SiteId = "myhome" | "ss" | "unsupported";

const MYHOME_HOSTS = ["www.myhome.ge", "myhome.ge"] as const;
const SS_HOSTS = ["www.ss.ge", "ss.ge"] as const;

function getHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isMyHome(host: string): boolean {
  return MYHOME_HOSTS.includes(host as (typeof MYHOME_HOSTS)[number]);
}

function isSs(host: string): boolean {
  return SS_HOSTS.includes(host as (typeof SS_HOSTS)[number]);
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
