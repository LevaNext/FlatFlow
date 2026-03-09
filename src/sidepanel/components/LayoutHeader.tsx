/**
 * Layout header: app title + theme settings dropdown.
 */

import { Moon, Settings, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTranslation } from "@/i18n";

export type Theme = "dark" | "light";

type LayoutHeaderProps = Readonly<{
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}>;

export function LayoutHeader({
  theme,
  onThemeChange,
}: LayoutHeaderProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2">
      <h1 className="text-lg font-semibold tracking-tight text-foreground shrink-0">
        {t("app.title")}
      </h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label={t("app.settingsAria")}
          >
            <Settings className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-2">
          <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            {t("theme.label")}
          </DropdownMenuLabel>
          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={(v) => {
              if (v) onThemeChange(v as Theme);
            }}
            variant="outline"
            size="sm"
            className="w-full rounded-md border border-border p-0.5"
          >
            <ToggleGroupItem
              value="dark"
              aria-label={t("theme.dark")}
              className="flex-1 px-3"
              title={t("theme.dark")}
            >
              <Moon className="mr-1.5 size-4" />
              {t("theme.dark")}
            </ToggleGroupItem>
            <ToggleGroupItem
              value="light"
              aria-label={t("theme.light")}
              className="flex-1 px-3"
              title={t("theme.light")}
            >
              <Sun className="mr-1.5 size-4" />
              {t("theme.light")}
            </ToggleGroupItem>
          </ToggleGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
