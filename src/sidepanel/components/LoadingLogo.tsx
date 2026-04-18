import { getLogoUrl } from "@/utils/logo";

export type LoadingLogoProps = Readonly<{
  /** Shown under the logo (e.g. “Parsing listing…”). */
  message?: string;
}>;

/**
 * Bouncing logo while waiting for tab info or parse (same motion as content-script overlay).
 */
export function LoadingLogo({ message }: LoadingLogoProps): React.ReactElement {
  const src = getLogoUrl();
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-6"
      aria-busy="true"
      aria-live="polite"
    >
      {src ? (
        <img
          src={src}
          alt=""
          className="flatflow-loading-logo h-16 w-16 object-contain"
          aria-hidden
        />
      ) : (
        <div className="text-sm text-muted-foreground">Loading…</div>
      )}
      {message ? (
        <p className="max-w-[14rem] text-center text-sm leading-snug text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}
