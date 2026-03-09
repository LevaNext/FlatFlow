/**
 * Layout footer: language selector (ka, en, ru).
 */

import Flag from "react-world-flags";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Language } from "@/i18n";
import { useTranslation } from "@/i18n";

const LANGUAGE_FLAG_CODE: Record<Language, string> = {
  ka: "ge",
  en: "gb",
  ru: "ru",
};

type LayoutFooterProps = Readonly<{
  language: Language;
  onLanguageChange: (language: Language) => void;
}>;

export function LayoutFooter({
  language,
  onLanguageChange,
}: LayoutFooterProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <footer className="flex shrink-0 w-full border-t border-border px-3 py-2">
      <ToggleGroup
        type="single"
        value={language}
        onValueChange={(v) => {
          if (v) onLanguageChange(v as Language);
        }}
        variant="outline"
        size="sm"
        className="flex w-full rounded-lg border border-border p-0.5"
      >
        <ToggleGroupItem
          value="ka"
          aria-label={t("lang.ka")}
          className="flex-1 gap-1.5 px-3"
          title={t("lang.ka")}
        >
          <Flag code={LANGUAGE_FLAG_CODE.ka} className="size-4 shrink-0" />
          <span className="text-xs">{t("lang.shortKa")}</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="en"
          aria-label={t("lang.en")}
          className="flex-1 gap-1.5 px-3"
          title={t("lang.en")}
        >
          <Flag code={LANGUAGE_FLAG_CODE.en} className="size-4 shrink-0" />
          <span className="text-xs">{t("lang.shortEn")}</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="ru"
          aria-label={t("lang.ru")}
          className="flex-1 gap-1.5 px-3"
          title={t("lang.ru")}
        >
          <Flag code={LANGUAGE_FLAG_CODE.ru} className="size-4 shrink-0" />
          <span className="text-xs">{t("lang.shortRu")}</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </footer>
  );
}
