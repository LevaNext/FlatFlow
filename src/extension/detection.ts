/**
 * URL-based listing detection (visual MVP – no scraping).
 * Detects myhome.ge (supported), ss.ge (coming soon), or unsupported.
 */

export type ListingSource = "myhome" | "ss" | "unsupported";

export interface MockListing {
  title: string;
  price: string;
  imageUrl: string;
}

export interface DetectionResult {
  type: ListingSource;
  listing?: MockListing;
  error?: string;
}

const MOCK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60' viewBox='0 0 80 60'%3E%3Crect fill='%23e5e7eb' width='80' height='60'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='10'%3EImage%3C/text%3E%3C/svg%3E";

function getHost(url: string): string | null {
  try {
    const u = new URL(url);
    return u.hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Detect listing source from URL and return mock listing for myhome/ss.
 */
export function detectFromUrl(url: string): DetectionResult {
  const host = getHost(url);
  if (!host) {
    return {
      type: "unsupported",
      error: "Invalid URL",
    };
  }

  if (host === "www.myhome.ge" || host === "myhome.ge") {
    return {
      type: "myhome",
      listing: {
        title: "Listing from myhome.ge",
        price: "125,000 ₾",
        imageUrl: MOCK_IMAGE,
      },
    };
  }

  if (host === "www.ss.ge" || host === "ss.ge") {
    return {
      type: "ss",
      listing: {
        title: "Listing from ss.ge",
        price: "—",
        imageUrl: MOCK_IMAGE,
      },
    };
  }

  return {
    type: "unsupported",
    error: "Unsupported website",
  };
}

/**
 * Error message for the Errors tab.
 */
export function getErrorMessage(result: DetectionResult): string {
  if (result.type !== "unsupported") return "";
  return result.error ?? "Unsupported website";
}
