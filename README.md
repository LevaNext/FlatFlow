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
│   │   ├── fill/            # Statement form fill by site (myhome, ss)
│   │   ├── content.ts       # Content script (parse + fill orchestration)
│   │   ├── background.ts    # Service worker (e.g. image fetch)
│   │   ├── messages.ts      # Message types
│   │   └── README.md
│   ├── parsing/             # DOM parsers by site (myhome, ss)
│   ├── popup/               # Side panel UI (Popup.tsx + components)
│   ├── storage/             # Parsed listing storage
│   ├── components/ui/       # Shared Shadcn UI primitives
│   ├── lib/                 # Utils (e.g. cn for Shadcn)
│   ├── index.css            # Global + Tailwind
│   ├── App.tsx              # App shell
│   └── main.tsx
├── public/
│   ├── manifest.json        # Extension manifest
│   ├── logo.png
│   └── icons/               # 16, 32, 48, 128px
├── index.html               # Side panel + web app entry
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

The extension uses a **side panel** (React UI from `src/popup/Popup.tsx`) and a **content script** for listing parsing and statement form fill.

- **Side panel:** `index.html` → Vite app → `src/main.tsx` mounts `src/popup/Popup.tsx` (runs when the panel is opened).
- **Content script:** `src/extension/content.ts` → `dist/content.js` (runs on myhome.ge, ss.ge, statements.myhome.ge; parses listing DOM and fills statement form from storage).
- **Background:** `src/extension/background.ts` → `dist/background.js` (service worker; e.g. fetches images for photo upload).
- **Manifest:** `public/manifest.json` (copied to `dist/`)

**Load in Chrome:** `pnpm build` → open `chrome://extensions` → Developer mode → Load unpacked → select the **`dist`** folder.

See `src/extension/README.md` for more.
