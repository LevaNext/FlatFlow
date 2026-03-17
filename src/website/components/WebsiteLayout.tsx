/**
 * Shared layout for website pages: navbar, outlet, footer.
 */
import {
  Check,
  ChevronDown,
  FileText,
  Globe,
  Heart,
  HelpCircle,
  Moon,
  Sun,
} from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanding } from "../context/LandingContext";

export function WebsiteLayout() {
  const { lang, setLang, dark, toggleTheme, t } = useLanding();

  return (
    <div className="flex flex-col justify-between landing-page min-h-screen bg-background text-foreground">
      {/* Gradient orbs */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-90"
          >
            <img
              src="/logo.png"
              alt="FlatFlow"
              className="h-9 w-9 rounded-lg object-contain"
            />
            <span className="text-lg font-semibold tracking-tight">
              FlatFlow
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="gap-1.5 text-muted-foreground w-fit px-2"
                  aria-label="Language"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase sm:inline">
                    {lang}
                  </span>
                  <ChevronDown className="h-3.5 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLang("ka")}>
                  <span className="inline-flex w-4 shrink-0 justify-center mr-2">
                    {lang === "ka" && <Check className="h-4 w-4" />}
                  </span>{" "}
                  ქართული
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang("en")}>
                  <span className="inline-flex w-4 shrink-0 justify-center mr-2">
                    {lang === "en" && <Check className="h-4 w-4" />}
                  </span>{" "}
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang("ru")}>
                  <span className="inline-flex w-4 shrink-0 justify-center mr-2">
                    {lang === "ru" && <Check className="h-4 w-4" />}
                  </span>{" "}
                  Русский
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              className="text-muted-foreground hover:text-foreground"
            >
              {dark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </nav>
      </header>

      <main id="main">
        <Outlet />
      </main>

      <footer className="bg-muted/30 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="FlatFlow"
              className="h-8 w-8 rounded-lg object-contain opacity-90"
            />
            <span className="font-semibold text-foreground">
              {t.footer.copyright}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground sm:justify-end">
            <Button
              asChild
              variant="link"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Link to="/privacy">
                <FileText className="h-4 w-4" />
                {t.footer.privacy}
              </Link>
            </Button>
            <Button
              asChild
              variant="link"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Link to="/faq">
                <HelpCircle className="h-4 w-4" />
                {t.footer.faq}
              </Link>
            </Button>
            <Button
              asChild
              variant="link"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Link to="/donation">
                <Heart className="h-4 w-4" />
                {t.footer.donation}
              </Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
