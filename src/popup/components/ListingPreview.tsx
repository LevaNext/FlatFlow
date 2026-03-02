import type { ListingData, ListingPrice } from "@/types/listing";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60' viewBox='0 0 80 60'%3E%3Crect fill='%23e5e7eb' width='80' height='60'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='10'%3EImage%3C/text%3E%3C/svg%3E";

function formatPrice(price: ListingPrice): string {
  const symbol = price.currency === "GEL" ? "₾" : "$";
  return `${price.amount.toLocaleString()} ${symbol}`;
}

interface ListingPreviewProps {
  listing: ListingData;
}

/**
 * Displays parsed listing data. No upload or form logic.
 */
export function ListingPreview({
  listing,
}: ListingPreviewProps): React.ReactElement {
  const imageUrl = listing.imageUrl ?? FALLBACK_IMAGE;
  const title = listing.title ?? "Untitled listing";
  const hasPrice = listing.price != null;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex gap-3 p-3">
        <img
          src={imageUrl}
          alt=""
          className="h-20 w-24 shrink-0 rounded object-cover"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="line-clamp-2 text-sm font-medium leading-tight text-card-foreground">
            {title}
          </p>
          {hasPrice && listing.price && (
            <p className="text-sm font-semibold text-primary">
              {formatPrice(listing.price)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
