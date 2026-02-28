# Flatflow

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
flatflow/
├── src/
│   ├── extension/    # Content scripts + popup UI (Chrome Manifest v3)
│   ├── components/   # Reusable + Shadcn UI components
│   ├── pages/        # Dashboard / admin (optional)
│   ├── styles/       # Extra Tailwind/global styles
│   ├── lib/          # Utils (e.g. cn for Shadcn)
│   └── App.tsx
├── public/
│   └── icons/        # Extension icons
├── package.json
├── tsconfig.json
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

The `src/extension/` folder is intended for:

- Content scripts
- Popup UI (separate Vite entry if needed)
- Background service worker

See `src/extension/README.md` for build notes.
