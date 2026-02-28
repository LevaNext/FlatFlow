# Extension (Chrome Manifest v3)

This folder is reserved for:

- **Content scripts** – inject into web pages
- **Popup UI** – extension popup (e.g. React build entry)
- **Background service worker** – Manifest v3 `service_worker` script

For a multi-entry build, configure Vite to output:

- `dist/popup.html` + `dist/assets/popup-*.js` for the popup
- `dist/content.js` for content script(s)
- `dist/background.js` for the service worker

Place your `manifest.json` (Manifest v3) in `public/` or generate it into `dist/` during build.
