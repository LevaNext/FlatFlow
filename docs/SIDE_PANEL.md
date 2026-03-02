# Side Panel Migration

The extension uses the **Chrome Side Panel API** instead of the action popup, so the UI stays open when clicking outside. The same UI that previously ran in the popup (parsing, upload, settings) now runs in the side panel.

## Summary of changes

- **manifest.json**: No `default_popup`; `side_panel.default_path` is `"index.html"`; `sidePanel` permission added.
- **background.ts**: `chrome.action.onClicked` opens the side panel via `chrome.sidePanel.open({ tabId })`.
- **Entry point**: `index.html` loads `main.tsx`, which mounts the **Popup** component (`src/popup/Popup.tsx`) — the full extension UI. Popup is the single app entry; the legacy `App` component is unused.
- **Vite**: Single build entry `index.html`; `popup.html` removed. `base: "./"` keeps extension asset URLs correct.

## How to test in Chrome

1. **Build the extension**
   ```bash
   pnpm run build:extension
   ```

2. **Load unpacked**
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist/` folder

3. **Open the side panel**
   - Go to any tab (e.g. a supported listing site)
   - Click the FlatFlow icon in the toolbar  
   → The side panel opens with the full extension UI (same as the previous popup).
   - You can also right‑click the icon → "Open side panel" if your Chrome version shows it.

4. **Verify behavior**
   - Panel stays open when clicking the page or other Chrome UI.
   - Closing the panel and clicking the icon again reopens it.
   - Content scripts and messaging should work as before (same extension context).

## Domain restriction (myhome.ge only)

The side panel is **enabled only on myhome.ge and www.myhome.ge** (http or https). Elsewhere it is disabled and the icon click does nothing.

- **Why the icon sometimes didn’t open the panel:** Chrome can open the side panel automatically when the icon is clicked (`openPanelOnActionClick: true`). In that case `action.onClicked` is **not** fired, so our code never ran. The fix is to call `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })` so the click is delivered to our listener; we then check the tab URL and call `chrome.sidePanel.open()` only for myhome.ge.
- **host_permissions** use `*://myhome.ge/*` and `*://www.myhome.ge/*` so both http and https are allowed.

## Common MV3 + Side Panel pitfalls

1. **`action.onClicked` only fires when there is no popup**  
   After removing `default_popup`, the icon click is handled by your background script. If you ever re-add a popup, the click will open the popup and `onClicked` will not run.

2. **Tab context**  
   `chrome.sidePanel.open({ tabId })` opens the panel for that tab. The side panel page runs in extension context; use messaging (e.g. `chrome.tabs.sendMessage`, `chrome.runtime.sendMessage`) to talk to the active tab or content scripts.

3. **Service worker lifecycle**  
   The background script is a service worker and can be terminated. Avoid keeping long-lived state only in the worker; use `chrome.storage` or the side panel page for state.

4. **Paths in the side panel page**  
   The side panel is loaded as `chrome-extension://<id>/index.html`. Vite’s `base: "./"` makes script/asset paths relative, so they resolve correctly. For links to extension pages, use `chrome.runtime.getURL("index.html")` (or the right path).

5. **Chrome version**  
   Side Panel API is available from Chrome 114+. Ensure your target Chrome version supports it.

6. **Panel size**  
   The side panel has a fixed width (set by the user). Design your UI to work in a narrow column (e.g. avoid wide tables or fixed large widths).
