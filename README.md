# FlatFlow

**Vite + React + TypeScript**, with Tailwind CSS and Shadcn UI. Uses **pnpm** for package management.

```bash
pnpm install   # install dependencies
pnpm dev       # start dev server
```

## Stack

- **Vite** – build tool
- **React 19** + **TypeScript** – UI and types
- **Tailwind CSS v3** – utility-first CSS
- **Shadcn UI** – components (add via `pnpm dlx shadcn@latest add <component>`)
- **Lucide React** – icons
- **Biome** – lint and format (replaces ESLint + Prettier)

## Project structure

```
FlatFlow/
├── src/
│   ├── extension/           # Chrome extension (Manifest v3)
│   │   ├── components/      # Extension-only UI (e.g. ListingCard)
│   │   ├── popup.tsx        # Popup UI
│   │   ├── content.ts       # Content script (myhome.ge)
│   │   ├── detection.ts     # Listing URL/source detection
│   │   └── README.md
│   ├── components/ui/       # Shared Shadcn UI primitives
│   ├── lib/                 # Utils (e.g. cn for Shadcn)
│   ├── index.css            # Global + Tailwind
│   ├── App.tsx              # Web app (dev/placeholder)
│   └── main.tsx
├── public/
│   ├── manifest.json        # Extension manifest
│   ├── logo.png
│   └── icons/               # 16, 32, 48, 128px
├── index.html               # Web app entry
├── popup.html               # Extension popup entry
├── package.json
├── vite.config.ts
└── tailwind.config.cjs
```

## Scripts

Use **pnpm** (see `packageManager` in `package.json`).

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Biome check (lint + format) |
| `pnpm lint:fix` | Biome check and apply fixes |
| `pnpm format` | Biome format only |

## Light / dark mode

Tailwind and Shadcn use **class-based** dark mode. Toggle by adding or removing the `dark` class on `<html>`:

- Light: default (no class)
- Dark: `<html class="dark">`

CSS variables for both themes are defined in `src/index.css`.

## Shadcn UI

Add components with:

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
# etc.
```

Components are added under `src/components/ui/`. Path alias `@/` points to `src/`.

## Extension (Chrome Manifest v3)

The extension popup (heading “FlatFlow” + “Upload Listing” button) and optional content script for myhome.ge are built with the app.

- **Popup:** `src/extension/popup.tsx` + root `popup.html` → `dist/popup.html`
- **Content script:** `src/extension/content.ts` → `dist/content.js` (runs on `https://www.myhome.ge/*`)
- **Manifest:** `public/manifest.json` (copied to `dist/`)

**Load in Chrome:** `pnpm build` → open `chrome://extensions` → Developer mode → Load unpacked → select the **`dist`** folder.

See `src/extension/README.md` for more.
