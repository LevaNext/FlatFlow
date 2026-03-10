import { getLogoUrl } from "@/utils/logo";

/**
 * Bouncing logo used while waiting for page/parse (same style as content script overlay).
 */
export function LoadingLogo(): React.ReactElement {
  const src = getLogoUrl();
  if (!src) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }
  return (
    <div className="flex flex-1 items-center justify-center">
      <img
        src={src}
        alt=""
        className="flatflow-loading-logo h-16 w-16 object-contain"
        aria-hidden
      />
    </div>
  );
}
