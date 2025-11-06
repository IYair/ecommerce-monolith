# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **monolithic ecommerce application** with a unified Express.js proxy server that routes requests to two separate services:

- **Backend:** Strapi CMS (Headless CMS) on port 1337
- **Frontend:** Next.js 16 (App Router) on port 3001
- **Unified Server:** Express proxy on port 3000 routing `/admin` and `/api` to Strapi, everything else to Next.js

## Architecture

### Monolithic Proxy Pattern

- Single unified server (`server.js`) proxies all requests
- Backend and frontend run independently but are served through one external port (3000)
- Shared TypeScript types in `/shared/types/index.ts` used by both frontend and backend

### Tech Stack

**Frontend:**

- Next.js 16.0.1 with App Router and React Server Components
- React 19.2.0 with React Compiler enabled
- TypeScript (strict mode)
- Tailwind CSS 4.x with CSS variables for dynamic theming
- shadcn/ui (New York style)
- State: Zustand for cart (localStorage persistence), React Query for server state
- Payments: Stripe
- Drawer: Vaul (for cart drawer with animations)

**Backend:**

- Strapi 5.30.1 (Headless CMS)
- PostgreSQL (production) / SQLite (development)
- Color Picker plugin for dynamic theme configuration

**Infrastructure:**

- Node.js 18+
- Express.js proxy
- Docker & Docker Compose

## Key Commands

### Development

```bash
npm run dev              # Start all services (Strapi, Next.js, proxy)
npm run dev:backend      # Strapi only (port 1337)
npm run dev:frontend     # Next.js only (port 3001)
npm start                # Unified proxy server (port 3000)
```

### Building

```bash
npm run build            # Build all services
npm run build:backend    # Build Strapi
npm run build:frontend   # Build Next.js
```

### Installation

```bash
npm run setup            # Install dependencies for root, backend, frontend
```

### Strapi CLI

```bash
npm run strapi           # Run Strapi CLI commands
```

### Access Points

- Store: http://localhost:3000
- Strapi Admin: http://localhost:3000/admin
- API: http://localhost:3000/api
- Health Check: http://localhost:3000/health

### Code Quality & Validation

```bash
npm run lint                 # Lint frontend + backend
npm run format               # Format all code with Prettier
npm run format:check         # Check formatting without changes
npm run typecheck            # Type check all TypeScript
npm run validate             # Run all quality checks (format, lint, typecheck)
```

### Bundle Analysis

```bash
cd frontend
npm run analyze              # Generate bundle size report
```

## Code Quality Tools

This project uses a comprehensive set of tools for code quality:

### Prettier (Code Formatting)

- **Config:** `.prettierrc.json`
- **Style:** 2 spaces, single quotes, trailing commas (ES5)
- **Line width:** 100 characters
- **Import sorting:** Automatic (React → Next.js → Third-party → Internal → Relative)
- **Runs:** Automatically on commit via pre-commit hook

### ESLint (Linting)

**Frontend:**

- Next.js recommended rules
- Import ordering enforcement
- Unused imports auto-removal (eslint-plugin-unused-imports)
- File size warnings (500 lines)
- TypeScript type-aware rules

**Backend:**

- TypeScript ESLint rules (relaxed for Strapi)
- Import ordering
- File size warnings (500 lines)
- Node.js environment configuration

### Pre-commit Hooks (Husky + lint-staged)

Automatically run on `git commit`:

1. Prettier formats staged files
2. ESLint checks and auto-fixes staged files
3. TypeScript type checks frontend

**Config:** `.lintstagedrc.json`, `.husky/pre-commit`

### Commit Message Linting (commitlint)

Enforces [Conventional Commits](https://www.conventionalcommits.org/):

- Format: `type(scope): subject`
- Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- Max length: 100 characters
- **Config:** `.commitlintrc.json`, `.husky/commit-msg`

### EditorConfig

- **Config:** `.editorconfig`
- Ensures consistent editor settings (charset, indentation, line endings)

### Bundle Analyzer

- **Package:** `@next/bundle-analyzer`
- Generates visual report of bundle composition
- Run: `cd frontend && npm run analyze`
- Opens interactive HTML report in browser

## Directory Structure

```
ecommerce-monolith/
├── backend/           # Strapi CMS (port 1337)
│   └── src/api/       # Content types (product, category, order, site-setting, theme-setting, etc.)
├── frontend/          # Next.js app (port 3001)
│   └── src/
│       ├── app/       # App Router pages and layouts
│       ├── components/# React components (Header, Footer, ProductCard, CartDrawer, etc.)
│       │   └── ui/    # shadcn/ui components
│       ├── lib/       # API client (api.ts), utilities (utils.ts), providers
│       └── store/     # Zustand stores (cart.ts)
├── shared/            # Shared TypeScript types
│   └── types/index.ts
└── server.js          # Express proxy server (port 3000)
```

## Important Patterns

### TypeScript

- **Shared Types:** All types defined in `/shared/types/index.ts` - update this when modifying data structures
- **Strict Mode:** Full type safety enabled
- **Path Aliases:** `@/*` maps to `src/*` in frontend
- **No SVG Creation:** Per user preference, do not create SVG files

### Component Patterns

- **'use client' Directive:** Mark client components explicitly (hooks, event handlers, browser APIs)
- **Server Components:** Default in App Router - no directive needed
- **Dynamic Theming:** All components use inline styles with CSS variables:
  ```typescript
  style={{ color: 'rgb(var(--color-primary))' }}
  ```
- **RGB Format:** Colors in `rgb(var(--color-name))` format for opacity support

### Styling

- **CSS Variables:** RGB format for all colors (`--color-primary`, `--color-foreground`, etc.)
- **Theme System:** Dynamic themes configured via Strapi's `theme-setting` content type
- **ThemeProvider:** Fetches theme from Strapi and injects CSS variables into `:root`
- **Tailwind + Inline Styles:** Use Tailwind for layout, inline styles for theme-dependent colors

### State Management

- **Cart:** Zustand with localStorage middleware (`/store/cart.ts`)
- **Server Data:** React Query with 1-minute stale time
- **Theme:** Context API via ThemeProvider

### API Communication

- **Centralized Client:** All API calls through `/lib/api.ts`
- **JWT Auth:** Token stored in localStorage, added via axios interceptor
- **Type Safety:** All responses typed using shared types
- **Error Handling:** Try-catch with fallback defaults for CMS content

### Data Fetching

- **React Query:** Primary data fetching with `useQuery`
- **Client-Side:** All pages use 'use client' - no SSR data fetching currently
- **Loading States:** Skeleton loaders during fetch
- **Fallback Content:** Hardcoded defaults if CMS content not configured

## Critical Configuration

### Environment Variables

Three separate `.env` files (root, backend, frontend) must be kept in sync:

- Database: `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_NAME`
- Strapi Secrets: `STRAPI_ADMIN_JWT_SECRET`, `STRAPI_API_TOKEN_SALT`, `STRAPI_APP_KEYS`, `STRAPI_JWT_SECRET`, `STRAPI_TRANSFER_TOKEN_SALT`
- Stripe: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- URLs: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_STRAPI_URL`, `NEXT_PUBLIC_SITE_URL`

### TypeScript Config

- `frontend/tsconfig.json` excludes `backend` and `../backend` directories
- Strict mode enabled
- Path alias: `@/*` → `src/*`

### Next.js Config

- React Compiler enabled for automatic optimization
- Image optimization disabled in development (configured for localhost)
- Supports image domains: localhost:1337, localhost:3000

### Strapi Permissions

**Critical:** For theme system to work, enable public permissions:

1. Settings → Users & Permissions → Roles → Public
2. Enable `find` permission for:
   - `product`
   - `category`
   - `theme-setting`
   - `site-setting`
   - `hero-section`
   - `feature-card`
   - `navigation-link`

## Component Development

### Adding New Components

1. Create in `/frontend/src/components/` (or `/components/ui/` for primitives)
2. Use 'use client' if component uses hooks, events, or browser APIs
3. Apply theme colors via inline styles:
   ```typescript
   style={{ color: 'rgb(var(--color-foreground))' }}
   ```
4. Import and use in pages/layouts

### Updating shadcn/ui Components

All shadcn/ui components already use theme colors. When adding new ones:

```bash
cd frontend
npx shadcn@latest add <component-name>
```

Then update to use CSS variables following the pattern in existing components.

### Cart Drawer Pattern

Uses Vaul drawer (not Sheet) for smooth animations:

- `<Drawer direction="right">` for sidebar
- `<DrawerContent direction="right">` for content
- `<DrawerClose>` for close triggers

## Content Management

### Strapi Content Types

- **product:** Products with images, pricing, variants, stock
- **category:** Product categories with images
- **order:** Customer orders
- **site-setting:** Global site configuration
- **theme-setting:** Dynamic theme colors (17 color variables)
- **hero-section:** Homepage hero configuration
- **feature-card:** Homepage feature cards
- **navigation-link:** Dynamic navigation links

### Adding Custom Content Types

1. Create in `/backend/src/api/<name>/content-types/`
2. Update `/shared/types/index.ts` with TypeScript types
3. Add API endpoints in `/lib/api.ts`
4. Enable public permissions in Strapi admin

### Dynamic Theming

Theme configured via Strapi:

1. Admin → Content Manager → Theme Settings
2. Configure 17 colors using color picker
3. ThemeProvider fetches and applies to `:root` as CSS variables
4. 5-minute cache with React Query

## Database

### Development

Uses SQLite by default (easier setup):

```
backend/.tmp/data.db
```

### Production

Uses PostgreSQL configured via environment variables:

```env
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=ecommerce_db
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your_password
```

## Deployment

### CI/CD Pipeline

The project includes automated CI/CD pipelines via GitHub Actions:

**Continuous Integration (`.github/workflows/ci.yml`):**

- Runs on PRs and pushes to main
- Code quality checks (lint, format, typecheck)
- Build verification for frontend and backend
- Unit and E2E tests (when configured)

**Continuous Deployment (`.github/workflows/deploy.yml`):**

- Builds multi-stage Docker image
- Pushes to GitHub Container Registry (GHCR)
- Deploys to Dokploy server via SSH

For complete CI/CD setup instructions, see [CI_CD.md](./CI_CD.md).

**Required GitHub Secrets:**

- Build: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_STRAPI_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Deploy: `DOKPLOY_HOST`, `DOKPLOY_USERNAME`, `DOKPLOY_SSH_KEY`, `DOKPLOY_PROJECT_PATH`

### Docker Compose

```bash
docker-compose up -d
```

Starts PostgreSQL + App in production mode.

### Manual

```bash
npm run build
NODE_ENV=production npm start
```

### Health Checks

Endpoint `/health` returns JSON status for monitoring.

## Common Workflows

### Adding a Product

1. Strapi Admin → Content Manager → Products → Create New
2. Fill fields: name, slug, description, price, SKU, stock, category
3. Upload images
4. Toggle "featured" if needed
5. Publish

### Modifying Theme

1. Strapi Admin → Content Manager → Theme Settings
2. Use color pickers to change colors
3. Save
4. Frontend updates automatically (5-minute cache)

### Adding New Pages

1. Create `frontend/src/app/<route>/page.tsx`
2. Add 'use client' if using hooks
3. Import components and build page
4. Update navigation in Header.tsx or via Strapi navigation links

### Extending Product Model

1. Edit `backend/src/api/product/content-types/product/schema.json`
2. Update `shared/types/index.ts` interface
3. Rebuild Strapi: `npm run build:backend`
4. Update frontend components to use new fields

## Debugging

### Theme Not Applying

1. Check Strapi permissions (public `find` on `theme-setting`)
2. Verify `curl http://localhost:1337/api/theme-setting` returns data
3. Check browser console for "[ThemeProvider] Applying theme" message
4. Clear React Query cache (refresh page)

### API Errors

1. Check Strapi is running on port 1337
2. Verify permissions enabled for content type
3. Check browser Network tab for actual error
4. Verify JWT token in localStorage if auth-protected

### Build Errors

1. Ensure `backend` and `../backend` excluded in `tsconfig.json`
2. Run `npx tsc --noEmit` to check TypeScript errors
3. Clear `.next` folder: `rm -rf frontend/.next`
4. Rebuild: `npm run build`

### Port Conflicts

```bash
# Find process
lsof -ti:3000
# Kill it
kill -9 <PID>
```

## Special Notes

- **React Compiler:** Enabled - avoid manual useMemo/useCallback unless profiling shows benefit
- **Proxy Server:** All requests go through port 3000 - don't bypass it
- **Drawer vs Sheet:** Use Drawer (Vaul) for cart, Sheet for other overlays
- **Image Optimization:** Disabled - images served directly from Strapi
- **Hot Reload:** Both Strapi and Next.js support hot reload in development
- **Concurrently:** `npm run dev` uses concurrently to run multiple services
- **Graceful Shutdown:** SIGTERM/SIGINT handlers in server.js
- **Multi-Stage Docker:** Optimized build with separate Strapi → Next.js → Runtime stages

## Troubleshooting Checklist

- [ ] All services running (Strapi on 1337, Next.js on 3001, Proxy on 3000)
- [ ] Database connection working (check `.env` credentials)
- [ ] Strapi admin accessible at /admin
- [ ] Public permissions enabled for all content types
- [ ] Theme settings configured in Strapi
- [ ] JWT token in localStorage (if authenticated)
- [ ] CORS configured correctly in `backend/config/middlewares.ts`
- [ ] Environment variables set in all three `.env` files
- [ ] Dependencies installed: `npm run setup`
- [ ] No port conflicts
