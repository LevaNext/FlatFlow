import { CopyPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import type { SiteId } from "@/parsing";

type UploadButtonsProps = Readonly<{
  siteId: SiteId | null;
  onMyHomeClick: () => void;
  onSsClick: () => void;
}>;

export function UploadButtons({
  siteId,
  onMyHomeClick,
  onSsClick,
}: UploadButtonsProps): React.ReactElement {
  const { t } = useTranslation();
  const myHomeActive = siteId === "myhome";
  const ssActive = siteId === "ss";

  return (
    <div className="flex flex-col gap-2">
      <Button
        size="sm"
        variant={myHomeActive ? "default" : "outline"}
        onClick={onMyHomeClick}
        className="w-full"
      >
        <CopyPlus />
        {t("upload.myHome")}
      </Button>
      <Button
        size="sm"
        variant={ssActive ? "default" : "outline"}
        onClick={onSsClick}
        className="w-full"
      >
        <CopyPlus />
        {t("upload.ss")}
      </Button>
    </div>
  );
}
