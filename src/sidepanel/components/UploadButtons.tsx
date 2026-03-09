import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import type { SiteId } from "@/parsing";

type UploadButtonsProps = Readonly<{
  siteId: SiteId | null;
  onMyHomeClick: () => void;
}>;

export function UploadButtons({
  siteId,
  onMyHomeClick,
}: UploadButtonsProps): React.ReactElement {
  const { t } = useTranslation();
  const myHomeEnabled = siteId === "myhome";

  return (
    <div className="flex flex-col gap-2">
      <Button
        size="sm"
        variant={myHomeEnabled ? "default" : "outline"}
        onClick={onMyHomeClick}
        disabled={!myHomeEnabled}
        className="w-full"
      >
        {t("upload.myHome")}
      </Button>
    </div>
  );
}
