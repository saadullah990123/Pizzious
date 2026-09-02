# Pizzious Project Instructions

## Project shape

- This is a Next.js 14 App Router application using TypeScript, React, Tailwind CSS, PostgreSQL, and Drizzle ORM.
- Use the `@/*` import alias for modules under `src/*`.
- Storefront UI lives in `src/app/page.tsx` and `src/components/`; admin UI lives under `src/app/admin/`. Keep admin-only visual changes inside the admin surface unless the request explicitly includes the storefront.
- Route handlers live under `src/app/api/`. Reuse existing database methods and response shapes before adding new abstractions.

## Data and security

- Database schema is defined in `src/db/schema.ts`; database access and the local JSON fallback are implemented in `src/db/index.ts`.
- `DATABASE_URL` enables PostgreSQL. Without it, local development uses `data/pizzious-store.json`; do not rely on that file for production persistence.
- Run `npm run db:push` after schema changes against the configured database.
- Admin API routes must use `verifyAdminApiRequest` from `src/lib/auth.ts`. Do not weaken session validation or expose admin data through public routes.
- Production requires `ADMIN_SESSION_SECRET`; never add secrets to source control or hard-code production credentials.

## UI conventions

- Preserve the existing Pizzious orange/flame brand and Tailwind patterns.
- Maintain readable contrast in both light admin panels and dark controls. Check responsive behavior for narrow screens when changing modals, tables, or forms.
- Do not change storefront styling while fixing admin pages unless explicitly requested.

## Validation

- Install dependencies with `npm install`.
- Start development with `npm run dev`.
- Type-check with `npx tsc --noEmit`.
- Build with `npm run build`.
- API verification scripts expect a running app at `http://localhost:3001`: `node scripts/verify-all.mjs`. Start Next on that port when using the script.
- `npm run lint` may prompt to create ESLint configuration in a fresh checkout. Do not accept an unrelated configuration change automatically; resolve dependency/configuration issues deliberately.

## Change discipline

- Prefer small, local edits that match neighboring code.
- Do not edit generated `.next/` output or commit local environment files.
- Update types and focused validation when changing route contracts, database fields, or shared components.
