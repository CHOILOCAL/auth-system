# SecureAuth — Production Auth + Board

A production-grade Vite + React 19 + TypeScript application with Supabase
auth (email + Kakao OAuth), a fully RLS-protected board CRUD, and a strict
data-minimization posture.

- **Frontend:** Vite, React 19, TypeScript, Tailwind v4, SCSS Modules,
  shadcn/ui, Wouter, react-hook-form, Zod
- **Data:** TanStack Query v5 (server state) + React Context (auth state)
- **Backend / BaaS:** Supabase (Postgres + Auth + RLS, PKCE flow)
- **External:** Kakao OAuth (delegated through Supabase, minimal scope)

---

## Table of contents

1. [Architecture](#architecture)
2. [Privacy posture](#privacy-posture)
3. [Directory layout](#directory-layout)
4. [Local setup](#local-setup)
5. [Environment variables](#environment-variables)
6. [Database setup (SQL)](#database-setup-sql)
7. [Supabase dashboard configuration](#supabase-dashboard-configuration)
8. [Kakao Developer Console setup](#kakao-developer-console-setup)
9. [Available scripts](#available-scripts)
10. [Code conventions](#code-conventions)
11. [Security notes](#security-notes)

---

## Architecture

```
ErrorBoundary
└── QueryClientProvider          ← TanStack Query (server state)
    └── ThemeProvider
        └── AuthProvider         ← Supabase session + profile (client state)
            └── TooltipProvider
                └── <Router />   ← Wouter
```

**Server state** (posts, profile fetches) lives in TanStack Query.
**Client state** (theme, sidebar) lives in component-local `useState`.
**Auth/session** is a React Context that subscribes to
`supabase.auth.onAuthStateChange`.

Data flow for a typical board mutation:

```
UI form → zod validate → useCreatePost mutation
        → optimistic cache patch  (✓ instant UI)
        → Supabase REST insert    (✓ RLS enforces author = auth.uid())
        → reconcile / invalidate  (✓ canonical data wins)
```

---

## Privacy posture

We follow **data-minimization** as a hard constraint:

| Concern | Stance |
| --- | --- |
| Email collection | `auth.users.email` exists in Supabase's internal schema (required to dispatch OAuth callbacks). Our `profiles` table no longer makes email mandatory and we never read or display it from any UI. |
| Phone numbers | Not requested, not stored. |
| Kakao consent items | We request **only `profile_nickname`** via `signInWithOAuth({ scopes: 'profile_nickname' })`. Configure the same in the Kakao Developer Console under "동의항목" (Consent Items). |
| LocalStorage | Supabase persists session JWTs under a single key (`supabase-auth-token`). We do not write any custom user data to localStorage. Clearing storage logs the user out cleanly. |
| Display field | `profiles.nickname` (2–32 chars). Anything that previously read `email` or `full_name` has been migrated to read `nickname`. |

If you previously deployed an earlier version of this app that wrote email to
`profiles`, run [`add_nickname.sql`](client/src/lib/supabase/add_nickname.sql)
to backfill nicknames safely; you can later drop `email`/`full_name` once
your data has settled.

---

## Directory layout

```
auth-system/
├── client/
│   ├── index.html
│   └── src/
│       ├── App.tsx                         # Provider tree + router
│       ├── main.tsx
│       ├── index.css                       # Tailwind v4 entry + tokens
│       ├── components/                     # Cross-feature primitives
│       │   ├── auth/ProtectedRoute.tsx     # Route guard + PublicOnlyRoute
│       │   ├── layout/DashboardLayout.tsx  # Sidebar + header
│       │   ├── ui/                         # shadcn/ui (Radix-based)
│       │   └── ErrorBoundary.tsx
│       ├── contexts/                       # AuthContext, ThemeContext
│       ├── features/
│       │   ├── auth/index.ts               # Barrel for the auth surface
│       │   └── board/                      # ★ Board CRUD feature
│       │       ├── api/posts.ts            # Supabase service layer
│       │       ├── components/             # PostFormDialog, DeletePostDialog
│       │       ├── hooks/usePosts.ts       # TanStack Query hooks
│       │       ├── pages/                  # BoardListPage, BoardDetailPage
│       │       ├── schemas/index.ts        # Zod schemas
│       │       ├── styles/board.module.scss
│       │       ├── types/index.ts
│       │       └── index.ts                # Public surface
│       ├── hooks/                          # Cross-feature hooks (auth actions)
│       ├── lib/
│       │   ├── queryClient.ts              # TanStack QueryClient + queryKeys
│       │   ├── routes.ts                   # ROUTES enum
│       │   ├── utils.ts                    # cn(), date helpers
│       │   ├── supabase/
│       │   │   ├── client.ts               # Singleton Supabase client (PKCE)
│       │   │   ├── auth.ts                 # Auth service (sign in/up/OAuth)
│       │   │   ├── database.types.ts       # Hand-maintained DB types
│       │   │   ├── schema.sql              # profiles + RLS + triggers
│       │   │   ├── posts.schema.sql        # posts + RLS
│       │   │   └── add_nickname.sql        # Migration helper
│       │   └── utils/password.ts
│       ├── pages/                          # Auth & dashboard pages
│       ├── styles/modules/                 # SCSS module mixins
│       └── types/index.ts                  # Cross-cutting TS types
├── server/index.ts                         # Express prod static server
├── shared/                                 # Code shared client+server
├── eslint.config.js                        # ESLint flat config
├── tsconfig.json                           # Path aliases (@/, @shared/)
├── vite.config.ts                          # Plugins + aliases (no secrets)
├── .env.example                            # Template (commit this)
└── .env.local                              # Real secrets (gitignored)
```

---

## Local setup

```bash
# 1. Install
npm install --legacy-peer-deps

# 2. Create .env.local from the template
cp .env.example .env.local           # macOS / Linux
copy .env.example .env.local         # Windows PowerShell / cmd
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_KAKAO_REST_API_KEY

# 3. Apply database migrations (see "Database setup" below)

# 4. Run
npm run dev                          # http://localhost:3000
```

> The `--legacy-peer-deps` flag is needed because the existing
> `@builder.io/vite-plugin-jsx-loc` dev plugin pins `vite ^4 || ^5` while we
> ship Vite 7. The plugin works at runtime; the peer warning is cosmetic.

---

## Environment variables

All `VITE_*` vars are bundled into the client at build time. **Never** put
service-role keys or OAuth client secrets here — those belong on the server
(Supabase auto-handles them via the dashboard).

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | ✓ | `https://<ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✓ | Anon (publishable) key. Safe to expose. |
| `VITE_KAKAO_REST_API_KEY` | optional | Public Kakao REST key. The OAuth flow is delegated to Supabase, so this is informational unless you call Kakao directly. |
| `VITE_APP_NAME` | optional | Display name. |
| `VITE_APP_URL` | optional | Public URL used to build OAuth redirect. Falls back to `window.location.origin`. |
| `PORT` | optional | Production server port (defaults to 3000). |

---

## Database setup (SQL)

Run in order in the Supabase SQL editor:

1. **`client/src/lib/supabase/schema.sql`**
   Creates `profiles` with the new `nickname` column, adds the
   updated_at + new-user triggers, enables RLS, and grants minimal roles.

2. **`client/src/lib/supabase/posts.schema.sql`**
   Creates `posts`, indexes, the updated_at trigger, and four RLS policies:

   ```sql
   -- All authenticated users can read.
   CREATE POLICY posts_select_authenticated ON public.posts
     FOR SELECT TO authenticated USING (true);

   -- Insert: caller must own the row.
   CREATE POLICY posts_insert_self ON public.posts
     FOR INSERT TO authenticated
     WITH CHECK (auth.uid() = author_id);

   -- Update: only by author, cannot reassign authorship.
   CREATE POLICY posts_update_own ON public.posts
     FOR UPDATE TO authenticated
     USING (auth.uid() = author_id)
     WITH CHECK (auth.uid() = author_id);

   -- Delete: only by author.
   CREATE POLICY posts_delete_own ON public.posts
     FOR DELETE TO authenticated USING (auth.uid() = author_id);
   ```

3. **`client/src/lib/supabase/add_nickname.sql`** *(only for upgrades)*
   Idempotent. Skip on a clean install.

After running, verify with the helper queries at the bottom of each script.

---

## Supabase dashboard configuration

1. **Authentication → URL Configuration**
   - Site URL: your deployed app's URL (e.g. `https://example.com`)
   - Redirect URLs: add both `http://localhost:3000/auth/callback` (dev)
     and `https://example.com/auth/callback` (prod).

2. **Authentication → Providers → Kakao**
   - Enable.
   - Paste your Kakao REST API Key as the **Client ID** and the
     Client Secret if you use one.
   - Redirect URL is auto-filled
     (`https://<ref>.supabase.co/auth/v1/callback`); copy it for the
     Kakao Developer Console step below.

3. **Authentication → Email**
   - Optionally disable "Confirm email" if you want passwordless sign-up.
   - Either way, set the templates to your branded domain.

---

## Kakao Developer Console setup

1. [Kakao Developers](https://developers.kakao.com/) → My Application → Create.
2. **앱 키 (App Keys)** → copy the **REST API key** to
   `VITE_KAKAO_REST_API_KEY` (informational; OAuth itself goes through Supabase).
3. **카카오 로그인 (Kakao Login)** → activate.
4. **카카오 로그인 → Redirect URI** → register the Supabase callback you copied
   above (`https://<ref>.supabase.co/auth/v1/callback`).
5. **카카오 로그인 → 동의항목 (Consent Items)** → leave **only**
   `프로필 정보 (닉네임/프로필 사진)` checked. Specifically: the only required
   field should be **닉네임 (`profile_nickname`)**. **Do not enable** email,
   phone, gender, age, birth, or any optional consent items.

This last step is what enforces our data-minimization promise at the source.

---

## Available scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on `http://localhost:3000`. |
| `npm run build` | Vite build + bundle the Express static server with esbuild. |
| `npm run start` | Run the production server (`dist/index.js`). |
| `npm run preview` | Vite preview of `dist/public`. |
| `npm run check` | TypeScript type-check (`tsc --noEmit`). |
| `npm run lint` | ESLint (flat config) over the whole repo. |
| `npm run lint:fix` | Auto-fix what ESLint can. |
| `npm run format` | Prettier format. |
| `npm run format:check` | Prettier dry-run. |

---

## Code conventions

- **Path aliases:** `@/` → `client/src/*`, `@shared/` → `shared/*`.
- **Imports:** absolute (`@/...`) over relative for anything outside the
  current feature folder. Use feature barrels (`@/features/board`).
- **Styling:** Tailwind for layout/spacing/utilities; SCSS modules for
  feature-scoped UI with complex selectors or animations. Never inline
  styles unless the value is dynamic (e.g. a computed gradient stop).
- **TypeScript:** zero `any`. Define explicit interfaces for API responses
  and Supabase Row types — see `lib/supabase/database.types.ts`.
- **Validation:** every form runs through `react-hook-form` +
  `zodResolver` with the schema co-located under
  `features/<feature>/schemas/`.
- **Error normalization:** API service modules (`features/<feature>/api/*`)
  return well-typed `*Error` shapes. UI never reads raw Postgres codes.
- **TanStack Query keys:** declared centrally in `lib/queryClient.ts`
  (`queryKeys.posts.list({...})` etc.). No string literals in callers.

---

## Security notes

- **PKCE flow** is enabled in the Supabase client to mitigate OAuth
  authorization-code interception.
- **Auto token refresh** + session persistence are on; sessions live in a
  single namespaced storage key.
- **RLS is mandatory.** The TypeScript types and the SQL policies are kept
  in sync. If you add a column or a table, both files change in the same
  PR.
- **Secrets in source:** there are none. `vite.config.ts` no longer
  contains hardcoded keys — anything you previously committed should be
  considered compromised and rotated in the Supabase + Kakao consoles.
- **Strict file system in dev:** `vite.server.fs.deny: ["**/.*"]` blocks
  `.env` exfiltration via dev-server file traversal.

---

## License

MIT — see [`package.json`](./package.json).
