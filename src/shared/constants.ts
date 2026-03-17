/**
 * Shared constants used by both website and extension.
 * Keep this file free of extension-only APIs (e.g. chrome).
 */

export const APP_NAME = "FlatFlow";

/** Supported site identifiers (global list). */
export const SUPPORTED_SITE_IDS = ["myhome", "ss"] as const;
export type SupportedSiteId = (typeof SUPPORTED_SITE_IDS)[number];

/** myhome.ge: listing site and statement create host. */
export const MYHOME_GE = {
  id: "myhome",
  hosts: ["www.myhome.ge", "myhome.ge"] as const,
  domain: "myhome.ge",
  statementHost: "statements.myhome.ge",
  baseUrl: "https://www.myhome.ge",
  statementUrl:
    "https://statements.myhome.ge/ka/statement/create?referrer=myhome",
} as const;

/** ss.ge: listing site (parsing/statement support coming). */
export const SS_GE = {
  id: "ss",
  hosts: ["www.ss.ge", "ss.ge"] as const,
  domain: "ss.ge",
  statementHost: "statements.ss.ge",
  baseUrl: "https://www.ss.ge",
} as const;

/** Supported hostnames (no www) for extension icon behavior. */
export const SUPPORTED_DOMAINS = [MYHOME_GE.domain, SS_GE.domain] as const;

/** Landing page URL when user clicks extension on a non-supported site. */
export const LANDING_PAGE_URL = "http://localhost:5173";
