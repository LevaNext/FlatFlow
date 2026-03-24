import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { LANDING_PAGE_URL } from "@/shared/constants";

export function UnsupportedMessage(): React.ReactElement {
  const { t } = useTranslation();
  const openFlatFlowSite = () => {
    if (typeof chrome === "undefined" || !chrome.tabs) return;
    chrome.tabs.create({ url: LANDING_PAGE_URL });
  };
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        {t("unsupported.message")}
      </p>
      <Button
        type="button"
        variant="link"
        className="h-auto justify-start p-0 text-sm text-primary"
        onClick={openFlatFlowSite}
      >
        {t("unsupported.goToFlatFlow")}
      </Button>
    </div>
  );
}
