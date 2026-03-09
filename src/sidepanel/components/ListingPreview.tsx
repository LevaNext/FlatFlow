import {
  BedDouble,
  Building2,
  Clock,
  Eye,
  LayoutGrid,
  MapPin,
  RefreshCw,
  Square,
} from "lucide-react";
import { useTranslation } from "@/i18n";
import type { ListingData, ListingPrice } from "@/types/listing";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Crect fill='%23e5e7eb' width='400' height='260'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='14'%3EImage%3C/text%3E%3C/svg%3E";

const NA = "N/A";

function or<T>(value: T | undefined | null, fallback: string = NA): string {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "number") return String(value);
  return String(value).trim() === "" ? fallback : String(value);
}

function formatPrice(price: ListingPrice): string {
  const symbol = price.currency === "GEL" ? "₾" : "$";
  return `${price.amount.toLocaleString()} ${symbol}`;
}

function parseListedAt(value: string | number | undefined): Date | null {
  if (value === undefined || value === null) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatListedAt(value: string | number | undefined): string {
  if (value === undefined || value === null) return NA;
  const date = parseListedAt(value);
  if (date !== null) {
    return date.toLocaleString("ka-GE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return typeof value === "string" && value.trim() ? value.trim() : NA;
}

type ListingPreviewProps = Readonly<{
  listing: ListingData;
  onRefresh?: () => void;
}>;

/**
 * Displays parsed listing as a card matching the design: image, price, title,
 * location, attributes (views, rooms, beds, area), district, timestamp. Uses N/A for missing fields.
 */
export function ListingPreview({
  listing,
  onRefresh,
}: ListingPreviewProps): React.ReactElement {
  const { t } = useTranslation();
  const imageUrl = listing.imageUrl ?? FALLBACK_IMAGE;
  const title = or(listing.title, t("listing.untitled"));
  const price = listing.price;
  const address = or(listing.address);
  const rooms = listing.rooms;
  const beds = listing.beds;
  const area = listing.area;
  const district = or(listing.district);
  const views = listing.views;
  const listedAt = formatListedAt(listing.listedAt);
  const listingId = listing.id;
  const floor = listing.floor;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      {/* Image */}
      <div className="relative aspect-[400/260] w-full bg-muted">
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow-sm transition hover:bg-white"
            aria-label="Refresh listing"
          >
            <RefreshCw className="size-4 stroke-[2] text-gray-800" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-3">
        {/* Price */}
        <span className="text-lg font-bold text-foreground">
          {price ? formatPrice(price) : NA}
        </span>

        {/* Title */}
        <p className="line-clamp-2 text-sm font-medium leading-tight text-foreground">
          {title}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          <span className="truncate">{address}</span>
        </div>

        {/* Attributes: views, rooms, beds, area, floor */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="size-4 shrink-0" />
            {views ?? NA}
          </span>
          <span className="flex items-center gap-1">
            <LayoutGrid className="size-4 shrink-0" />
            {rooms ?? NA}
          </span>
          <span className="flex items-center gap-1">
            <BedDouble className="size-4 shrink-0" />
            {beds ?? NA}
          </span>
          <span className="flex items-center gap-1">
            <Square className="size-4 shrink-0" />
            {area == null ? NA : `${area} m²`}
          </span>
          {floor != null && (
            <span className="flex items-center gap-1">
              <Building2 className="size-4 shrink-0" />
              {floor}
            </span>
          )}
        </div>

        {/* District */}
        <p className="text-sm text-muted-foreground">{district}</p>

        {/* Timestamp + ID */}
        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5 shrink-0" />
            {listedAt}
          </span>
          {listingId != null && (
            <span>
              ID: {listingId}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
