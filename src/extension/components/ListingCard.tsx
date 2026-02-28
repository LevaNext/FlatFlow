import { Card, CardContent, CardHeader } from "@/components/ui/card";

import type { MockListing } from "../detection";

interface ListingCardProps {
  listing: MockListing;
}

export function ListingCard({ listing }: ListingCardProps): React.ReactElement {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 pb-0">
        <div className="flex gap-3">
          <img
            src={listing.imageUrl}
            alt=""
            className="h-14 w-20 shrink-0 rounded object-cover"
          />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="truncate text-sm font-medium leading-tight">
              {listing.title}
            </p>
            <p className="text-sm font-semibold text-primary">
              {listing.price}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-2" />
    </Card>
  );
}
