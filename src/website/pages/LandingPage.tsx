/**
 * Website-only landing page. Shown when the app runs as a normal website.
 */
import { APP_NAME } from "@/shared/constants";

export function LandingPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-foreground">
      <h1 className="mb-4 text-3xl font-bold">Welcome to {APP_NAME}</h1>
      <p className="mb-6 text-muted-foreground">
        Use the FlatFlow Chrome Extension to automatically repost listings from
        supported sites.
      </p>
      <p className="text-sm text-muted-foreground">
        Install the extension from the Chrome Web Store to get started.
      </p>
    </div>
  );
}
