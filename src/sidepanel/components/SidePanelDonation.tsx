/**
 * KISA donation block: same QR asset as flatflow.ge landing (HomeDonationSection).
 */

import { ExternalLink } from "lucide-react";
import donationQr from "@/assets/donation-kisa-qr.png";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { KISA_DONATE_URL } from "@/shared/constants";

export function SidePanelDonation(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-border/70 bg-muted/25 px-2.5 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
        {t("donation.eyebrow")}
      </p>
      <div className="mt-1.5 flex gap-2.5">
        <div className="shrink-0">
          <div className="rounded-md border border-border bg-card p-1 shadow-sm">
            <img
              src={donationQr}
              alt=""
              width={176}
              height={176}
              className="h-[4.5rem] w-[4.5rem] rounded-sm object-contain"
            />
          </div>
          <p className="mt-0.5 text-center text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("donation.qrCaption")}
          </p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <p className="text-xs font-semibold leading-snug text-foreground">
            {t("donation.title")}
          </p>
          <p className="text-[11px] leading-snug text-muted-foreground">
            {t("donation.body")}
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="mt-0.5 h-8 w-full shrink-0 gap-0 px-2 text-[11px]"
          >
            <a href={KISA_DONATE_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-3 w-3 shrink-0" />
              {t("donation.ctaKisa")}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
