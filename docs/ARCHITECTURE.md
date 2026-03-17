# FlatFlow architecture: Website + Extension

The project runs in two modes:

- **Website**: normal web app (e.g. landing page) when opened in a browser tab or via dev server.
- **Extension**: Chrome Extension UI (side panel) when loaded as a Manifest V3 extension.

## Folder structure

```
src/
├── env/
│   └── context.ts          # Runtime detection: isExtension() / isWebsite()
├── website/                 # Website-only code
│   ├── main.tsx             # Website entry (index.html)
│   └── pages/
│       └── LandingPage.tsx
├── extension-ui/            # Extension UI entry only
│   └── main.tsx             # Extension entry (sidepanel.html) → mounts SidePanel
├── sidepanel/               # Extension UI (side panel / popup)
│   ├── SidePanel.tsx
│   └── components/
├── extension/               # Extension logic (no React UI)
│   ├── background.ts
│   ├── content.ts
│   └── ...
├── components/              # Shared UI (used by website and/or extension)
├── hooks/
├── i18n/
├── parsing/
├── storage/
└── ...
```

## Entry points

| Context   | HTML file      | Script entry              | Renders        |
|----------|----------------|---------------------------|----------------|
| Website  | `index.html`   | `src/website/main.tsx`    | LandingPage    |
| Extension| `sidepanel.html` | `src/extension-ui/main.tsx` | SidePanel   |

- **Website**: do not import extension-only code (e.g. `chrome.*`, sidepanel) in `src/website/`.
- **Extension UI**: can import `sidepanel/`, `extension/`, and shared code.

## Runtime detection

Use `src/env/context.ts` when you need to branch at runtime (e.g. inside a shared component):

```ts
import { isExtension, isWebsite } from "@/env/context";

if (isExtension()) {
  // Use chrome APIs, extension UI
}
if (isWebsite()) {
  // Web-only behavior
}
```

## Build and run

- **Website (dev)**: `pnpm dev` → opens `index.html` (website).
- **Extension (dev)**: Build once with `pnpm build`, then load `dist/` as unpacked extension; side panel uses `sidepanel.html`.
- **Build**: `pnpm build` produces both `index.html` (website) and `sidepanel.html` (extension UI) in `dist/`.

## Shared code

- Put code used by both website and extension under `src/` (e.g. `components/`, `lib/`, `i18n/`).
- For shared logic that must not depend on extension APIs, use `src/shared/` or keep it in `lib/` and avoid `chrome` there.
