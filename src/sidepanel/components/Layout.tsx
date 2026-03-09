/**
 * Side panel layout: header (title + settings), main content, footer (language).
 * Use for all supported pages so header and footer are always visible.
 */

import type { Language } from "@/i18n";
import { LayoutFooter } from "./LayoutFooter";
import { LayoutHeader, type Theme } from "./LayoutHeader";

export type { Theme };

export type { Language };

type LayoutProps = Readonly<{
  children: React.ReactNode;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
}>;

export function Layout({
  children,
  theme,
  onThemeChange,
  language,
  onLanguageChange,
}: LayoutProps): React.ReactElement {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden border-0 bg-background font-sans text-foreground side-panel-root-shadow">
      <LayoutHeader theme={theme} onThemeChange={onThemeChange} />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
      <LayoutFooter language={language} onLanguageChange={onLanguageChange} />
    </div>
  );
}
