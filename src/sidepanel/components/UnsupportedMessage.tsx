import { useTranslation } from "@/i18n";

export function UnsupportedMessage(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <p className="text-sm text-muted-foreground">{t("unsupported.message")}</p>
  );
}
