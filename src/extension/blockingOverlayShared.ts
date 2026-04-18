/**
 * Shared CSS hooks for full-page extension overlays that block interaction with the host page.
 */

export const BODY_INTERACTION_LOCK_CLASS = "flatflow-page-interaction-locked";

/** Applied to the overlay root so it stays clickable while the lock is active. */
export const BLOCKING_OVERLAY_ROOT_CLASS = "flatflow-blocking-overlay";

export function blockingOverlayLockRuleCss(): string {
  return `body.${BODY_INTERACTION_LOCK_CLASS} > *:not(.${BLOCKING_OVERLAY_ROOT_CLASS}){pointer-events:none!important;}`;
}
