// Optional content script for myhome.ge – runs when user is on the site.
// Add DOM or messaging logic here as needed.
// Note: This script does not use Shadow DOM. If you add a Shadow DOM root (e.g. for
// an in-page UI), inject the same popup styles (border-radius, overflow: hidden)
// into the shadow root so the extension UI keeps a consistent rounded look.
console.log("[FlatFlow] Content script loaded on", window.location.hostname);
