# Extension (Chrome Manifest v3)

- **Side panel UI** – `src/sidepanel/SidePanel.tsx` (React) is mounted from `main.tsx`; the panel is opened via the toolbar icon and uses `index.html` as its default path in the manifest.
- **Content script** – `content.ts` runs on `https://www.myhome.ge/*`, `https://ss.ge/*`, and `https://statements.myhome.ge/*`. On listing pages it responds to parse requests; on the statement create page it reads stored listing data and delegates to site-specific fill modules in `fill/` (myhome, ss).
- **Fill** – `fill/myhome.ts` and `fill/ss.ts` implement statement form fill (price, currency, photo upload) per site; `fill/shared.ts` provides helpers (e.g. `dataUrlToFile`).
- **Background** – `background.ts` is the service worker (e.g. handles image fetch for photo upload).
- **Manifest** – `public/manifest.json` (MV3) is copied to `dist/` on build.

## Build & load

1. Build: `pnpm build` (builds app/side panel, content script, and background; output in `dist/`).
2. In Chrome: go to `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, select the **`dist`** folder.

The toolbar icon opens the FlatFlow side panel. Tailwind and Shadcn styles are applied via `src/index.css` imported in the app entry.
