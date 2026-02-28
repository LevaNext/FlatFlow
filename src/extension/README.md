# Extension (Chrome Manifest v3)

- **Popup UI** – `popup.tsx` (React) + `popup.html` at repo root; built to `dist/popup.html`
- **Components** – `components/` holds extension-specific UI (e.g. `ListingCard.tsx`)
- **Content script** – `content.ts` runs on `https://www.myhome.ge/*`; built to `dist/content.js`
- **Detection** – `detection.ts` handles listing URL/source (myhome, ss, etc.)
- **Manifest** – `public/manifest.json` (MV3) is copied to `dist/` on build

## Build & load

1. Build: `pnpm build` (outputs app + extension to `dist/`).
2. In Chrome: go to `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, select the **`dist`** folder.

The toolbar icon opens the FlatFlow popup (heading + “Upload Listing” button). Tailwind and Shadcn styles are applied via `src/index.css` imported in `popup.tsx`.

## Adding a background service worker

To add a MV3 `service_worker`, add another Vite entry (e.g. `src/extension/background.ts`) and reference it in `manifest.json` as `"background": { "service_worker": "background.js" }`.
