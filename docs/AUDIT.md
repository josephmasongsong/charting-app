# Codebase Audit

Generated 2026-08-23 on branch `redesign` (HEAD `44865e8`). Read-only audit; no
code was changed.

**Method.** Sections 1–3 come from a script that parsed every `import`/`export …
from` statement in `src/**/*.ts(x)`, `middleware.ts` and `types/`, resolved `@/`
and relative paths to files, and computed reachability from the Next.js entry
points (`page.tsx`, `layout.tsx`, `loading.tsx`, `not-found.tsx`, `route.ts`,
`middleware.ts`). Commented-out imports were stripped first — the first pass
counted `// import { MonthlyActivityReport } from '@/components/MonthlyActivityReport'`
in `src/app/reports/monthly/page.tsx` as live, which is exactly the kind of grep
lie `CLAUDE.md` warns about. Section 4 comes from targeted greps plus reading the
files. Anything stated as a count is a grep count over `src/`.

**Headline numbers.**

|                                                       |                                                                                                             |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Page routes (`page.tsx`)                              | 28                                                                                                          |
| API routes (`route.ts`)                               | 33                                                                                                          |
| Layouts / loading / not-found                         | 1 root layout, 1 admin layout, 1 loading, 2 not-found                                                       |
| Component files outside `ui/` (excluding route files) | 76                                                                                                          |
| shadcn `ui/` primitives                               | 24                                                                                                          |
| **Files unreachable from any route**                  | **31** (24 with zero importers + 7 imported only by dead files)                                             |
| Dependencies imported by nothing live                 | `react-hook-form`, `@hookform/resolvers`, `recharts`, `@radix-ui/react-{progress,tabs,toggle,toggle-group}` |

---

## 1. Routes and what they render

Conventions in the tables below:

- **Kind** — `server` = React Server Component; `client` = file has `'use client'`;
  `server → client` = server page that fetches and hands everything to one client
  component.
- **Data** — how the page gets data. `db` = direct Drizzle query in the page;
  `fetch` = client-side `fetch('/api/…')`; `action` = server action; `lib/data` =
  helper in `src/lib/data/`.
- **Guard** — auth/role logic _in that file_. Every non-public route is also covered
  by `middleware.ts` (requires a session with `isActive !== false`) and by
  `ClientAuthGuard` in the root layout. `/admin/*` additionally passes through
  `src/app/admin/layout.tsx` → `requireAdmin()`.
- **Renders** — app-level components only. Anything from `@/components/ui/*` is a
  shadcn primitive and is omitted, per `CLAUDE.md`.

### 1.1 Global chrome

| File                                 | Kind   | Renders                                                                                                                                                                                                                                             |
| ------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/layout.tsx`                 | server | `AuthProvider` (SessionProvider) → local `AuthGuard` (calls `getServerSession` but discards the result) → `ClientAuthGuard` → `Navigation` + `<main>`; plus an inline `<footer>`. `metadata.title` is still `'Create Next App'`.                    |
| `src/components/Navigation.tsx`      | client | Sticky top bar: logo, Home icon, user dropdown (Settings, Sign Out). The admin-dashboard and monthly-report menu items are **commented out**, so there is no in-app navigation to `/admin` or `/reports/monthly` except the dashboard's admin card. |
| `src/components/ClientAuthGuard.tsx` | client | Redirects unauthenticated users to `/login` and authenticated users off `/login`, `/forgot-password` to `/dashboard`. Three near-identical "Loading… / Redirecting…" cards. Duplicates what `middleware.ts` already does.                           |
| `src/components/ProtectedRoute.tsx`  | client | A second client guard used only by `/profile` and `/settings` — those pages are guarded three times (middleware, `ClientAuthGuard`, `ProtectedRoute`).                                                                                              |
| `middleware.ts`                      | —      | `next-auth/middleware` `withAuth`; public routes `/login`, `/forgot-password`, `/reset-password`, `/api/auth`, `/api/reset-password`.                                                                                                               |
| `src/app/admin/layout.tsx`           | server | `requireAdmin()` from `src/lib/role-guard.ts` → `/unauthorized` for non-admins. Wraps children in `min-h-screen p-6` / `max-w-7xl mx-auto`.                                                                                                         |

### 1.2 Public / auth pages

| Route                     | File                                      | Kind   | Data                                     | Guard                                          | Renders                                                |
| ------------------------- | ----------------------------------------- | ------ | ---------------------------------------- | ---------------------------------------------- | ------------------------------------------------------ |
| `/`                       | `src/app/page.tsx`                        | server | session                                  | `redirect('/dashboard')` if signed in          | "Welcome" card with Sign In / Forgot Password buttons. |
| `/login`                  | `src/app/login/page.tsx`                  | client | `signIn('credentials')`                  | `router.push('/dashboard')` when authenticated | Logo, email/password form, `Alert` on error.           |
| `/forgot-password`        | `src/app/forgot-password/page.tsx`        | client | `fetch POST /api/reset-password`         | —                                              | Email form → hand-rolled blue info box on success.     |
| `/reset-password/[token]` | `src/app/reset-password/[token]/page.tsx` | client | `fetch POST /api/reset-password/[token]` | pushes `/login` after a `setTimeout`           | New-password form, green/destructive `Alert`s.         |
| `/unauthorized`           | `src/app/unauthorized/page.tsx`           | server | —                                        | —                                              | "Access Denied" card with red icon chip.               |

### 1.3 Signed-in pages

| Route                        | File                                        | Kind            | Data                                                         | Guard                                                                                                                                              | Renders                                                                                                                                                                                                                                                        |
| ---------------------------- | ------------------------------------------- | --------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/dashboard`                 | `src/app/dashboard/page.tsx`                | client          | `fetch /api/dashboard`                                       | calls `redirect('/login')` **inside a client `useEffect`** (`redirect` from `next/navigation` is meant for server components)                      | Header + period `Select`; 4 metric cards; `ActivityFeed` (via `useActivityFeed` → `/api/activity-feed`); Quick Start card; admin-only 8-button admin nav card.                                                                                                 |
| `/profile`                   | `src/app/profile/page.tsx`                  | client          | **none** — submit only `console.log`s                        | `ProtectedRoute`                                                                                                                                   | Non-functional Name/Email stub form.                                                                                                                                                                                                                           |
| `/settings`                  | `src/app/settings/page.tsx`                 | client          | `fetch GET/PATCH /api/users/[id]`                            | `ProtectedRoute`                                                                                                                                   | Account form with role `Select` (admin-only), timestamps. Ten leftover `console.log`s.                                                                                                                                                                         |
| `/events`                    | `src/app/events/page.tsx`                   | server → client | db (events ⋈ users ⋈ sites ⋈ activityTypes)                  | `redirect('/login')`                                                                                                                               | → `EventsListClient` (search/filter card, row cards, pagination, `DuplicateEventDialog`).                                                                                                                                                                      |
| `/events/new`                | `src/app/events/new/page.tsx`               | server          | session                                                      | `redirect('/login')`                                                                                                                               | → `EventForm mode="create"`.                                                                                                                                                                                                                                   |
| `/events/[id]`               | `src/app/events/[id]/page.tsx`              | server          | db (6-table join)                                            | `redirect('/login')`, `notFound()`                                                                                                                 | Header + admin Edit link + `DuplicateEventDialog`; badge row; 4 stat cards; Event Info / Participation (progress bars) / Time Allocation / Location / Organizer / Partner / Financial cards.                                                                   |
| `/events/[id]/edit`          | `src/app/events/[id]/edit/page.tsx`         | server          | db                                                           | **`redirect('/auth/signin')`** — a route that does not exist (everywhere else uses `/login`); non-admins may edit only their own duplicated events | → `EventForm mode="edit"`.                                                                                                                                                                                                                                     |
| `/events/[id]` (404)         | `src/app/events/[id]/not-found.tsx`         | server          | —                                                            | —                                                                                                                                                  | "Event Not Found" card, orange icon chip.                                                                                                                                                                                                                      |
| `/sites`                     | `src/app/sites/page.tsx`                    | server → client | db (sites ⋈ users ⋈ communityPartners)                       | `redirect('/login')`; `(session as any).user.role`                                                                                                 | → `SitesListClient` (near-clone of `EventsListClient`).                                                                                                                                                                                                        |
| `/sites/[id]`                | `src/app/sites/[id]/page.tsx`               | server          | db (three query fns; one does `await import('@/db')` inline) | `redirect('/login')`, `notFound()`                                                                                                                 | Header with admin-only `BackButton` + `EditButton`; 4 stat cards; Staff / Partner / Supply Inventory / Location (`GoogleMapsButton`) cards.                                                                                                                    |
| `/sites/[id]` (404)          | `src/app/sites/[id]/not-found.tsx`          | server          | —                                                            | —                                                                                                                                                  | Same layout as events not-found.                                                                                                                                                                                                                               |
| `/supplies/[id]`             | `src/app/supplies/[id]/page.tsx`            | server → client | db; also checks `users.isActive`                             | `redirect('/login')`, `notFound()`                                                                                                                 | → `SupplyDetailCard` (hand-rolled card chrome, collapsible site list).                                                                                                                                                                                         |
| `/supply-distributions/new`  | `src/app/supply-distributions/new/page.tsx` | server          | —                                                            | none in file                                                                                                                                       | → `SupplyDistributionForm` (fetches `/api/supply-distributions/options`, POSTs to `/api/supply-distributions`).                                                                                                                                                |
| `/reports/monthly`           | `src/app/reports/monthly/page.tsx`          | server          | `generateMonthlyActivityReport()` server action              | **none** — no role check (matches `DEFERRED.md` #2, Partners can reach it)                                                                         | `Suspense` → `MonthlyActivityReport` (from `src/components/reports/monthly/`) → `DateRangeDialog`, `MonthlyReportExportButton`, 4× `MetricCard`, `ActivityTypeByRegionTable`, `SupplyDistributionsSidebar`, `SitePerformanceCard`; `GrowthIndicators` helpers. |
| `/reports/monthly` (loading) | `src/app/reports/monthly/loading.tsx`       | server          | —                                                            | —                                                                                                                                                  | Spinner card. Sibling `page.tsx` also defines its own `ReportSkeleton` for the same purpose.                                                                                                                                                                   |

### 1.4 Admin pages

All under `src/app/admin/…`; guarded by `admin/layout.tsx`.

| Route                         | File                            | Kind            | Data                                       | Renders                                                                                                                                                                                            |
| ----------------------------- | ------------------------------- | --------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin`                      | `admin/page.tsx`                | client          | —                                          | One card with a grid of 12 link buttons. Uses raw `<a href>` (full page loads) instead of `next/link`, and links to `/admin/settings`, which does not exist.                                       |
| `/admin/activity-types`       | `activity-types/page.tsx`       | server → client | `lib/data/program-goals.getProgramGoals()` | → `AdminActivityTypesPage` → `activity-types-table` (fetches `/api/admin/activity-types`) + `create-activity-type-dialog`; table opens `edit-…` / `delete-…-dialog`.                               |
| `/admin/community-partners`   | `community-partners/page.tsx`   | client          | —                                          | `community-partners-table` (fetch) + `create-partner-dialog`; table opens `edit-` / `delete-partner-dialog`.                                                                                       |
| `/admin/events`               | `events/page.tsx`               | client          | —                                          | `events-table` (fetch) + `delete-event-dialog` (lifted to the page, unlike other sections). "Add Event" routes to `/events/new`.                                                                   |
| `/admin/events/[id]/edit`     | `events/[id]/edit/page.tsx`     | server          | db (4-table join)                          | Re-implements the admin check inline instead of calling `requireAdmin()`; → `EventForm mode="edit"`.                                                                                               |
| `/admin/program-goals`        | `program-goals/page.tsx`        | client          | —                                          | `program-goals-table` + `create-goal-dialog`; table opens `edit-` / `delete-goal-dialog`.                                                                                                          |
| `/admin/sites`                | `sites/page.tsx`                | client          | —                                          | `SitesTable` (fetch) → `BooleanBadge` ×3, `DeleteSiteDialog`. No create dialog — "Add Site" routes to `/admin/sites/new`.                                                                          |
| `/admin/sites/new`            | `sites/new/page.tsx`            | server          | —                                          | → `SiteForm mode="create"` (full-page form, client-side fetch + Zod).                                                                                                                              |
| `/admin/sites/[id]/edit`      | `sites/[id]/edit/page.tsx`      | server          | —                                          | → `SiteForm mode="edit"`.                                                                                                                                                                          |
| `/admin/supplies`             | `supplies/page.tsx`             | client          | —                                          | `supplies-table` + `create-supply-dialog`; table opens `view-` / `edit-` / `delete-supply-dialog`. `view-supply-dialog` fetches the **non-admin** `/api/supplies/[id]`.                            |
| `/admin/supply-distributions` | `supply-distributions/page.tsx` | client          | —                                          | `distributions-table` (Select filters, not text search) → `view-` / `delete-distribution-dialog`. "Log Distribution" routes to `/supply-distributions/new`.                                        |
| `/admin/users`                | `users/page.tsx`                | server → client | `lib/data/users.getUsersData()`            | → `AdminUsersPage` → `UsersTable` (→ `RoleBadge`, `StatusBadge`, `RegionBadge`, `JobTitleBadge`, `EditUserDialog`) + `InviteUserDialog`. `EditUserDialog` PATCHes the non-admin `/api/users/[id]`. |

Three different page shapes coexist for the same "admin CRUD list" job:
`activity-types` and `users` use *server `page.tsx` → `Admin*Page.tsx`client
wrapper*;`community-partners`, `events`, `program-goals`, `supplies`,
`supply-distributions`make`page.tsx`itself`'use client'`; `sites` uses a
client list page but full-page server-wrapped create/edit routes instead of dialogs.

### 1.5 API routes

| Route                                          | Methods            | Admin check                                   |
| ---------------------------------------------- | ------------------ | --------------------------------------------- |
| `/api/auth/[...nextauth]`                      | NextAuth handler   | —                                             |
| `/api/reset-password`                          | POST               | public                                        |
| `/api/reset-password/[token]`                  | POST               | public                                        |
| `/api/activity-feed`                           | GET                | session only                                  |
| `/api/dashboard`                               | GET                | session only                                  |
| `/api/events`                                  | POST               | session only                                  |
| `/api/events/options`                          | GET                | session only                                  |
| `/api/events/[id]`                             | GET, PATCH, DELETE | partial (1 role reference)                    |
| `/api/events/[id]/duplicate`                   | POST               | session only                                  |
| `/api/supplies/[id]`                           | GET                | session only                                  |
| `/api/supply-distributions`                    | GET, POST          | partial                                       |
| `/api/supply-distributions/options`            | GET                | session only                                  |
| `/api/users/[id]`                              | GET, PATCH         | role-aware (13 checks)                        |
| `/api/admin/activity-types`                    | GET, POST          | yes                                           |
| `/api/admin/activity-types/[id]`               | GET, PATCH, DELETE | yes                                           |
| `/api/admin/community-partners`                | GET, POST          | yes                                           |
| `/api/admin/community-partners/[id]`           | GET, PATCH, DELETE | yes                                           |
| `/api/admin/events`                            | GET                | yes                                           |
| `/api/admin/events/[id]`                       | GET, PATCH, DELETE | yes                                           |
| `/api/admin/invite-user`                       | POST               | yes                                           |
| `/api/admin/program-goals`                     | GET, POST          | yes                                           |
| `/api/admin/program-goals/[id]`                | GET, PATCH, DELETE | yes                                           |
| `/api/admin/program-goals/options`             | GET                | yes                                           |
| `/api/admin/sites`                             | GET, POST          | yes                                           |
| `/api/admin/sites/[id]`                        | GET, PATCH, DELETE | yes                                           |
| `/api/admin/sites/options`                     | GET                | yes                                           |
| `/api/admin/supplies`                          | GET, POST          | yes                                           |
| `/api/admin/supplies/[id]`                     | GET, PATCH, DELETE | yes                                           |
| `/api/admin/supply-distributions`              | GET, POST          | partial                                       |
| `/api/admin/supply-distributions/[id]`         | GET, DELETE        | partial                                       |
| `/api/admin/supply-distributions/[id]/details` | GET                | **session only** despite the `/admin/` prefix |
| `/api/admin/supply-distributions/options`      | GET                | **session only** despite the `/admin/` prefix |
| `/api/admin/users`                             | GET                | yes                                           |

"Admin check" is a grep for `role !== 'admin'` / `role === 'admin'` / `requireAdmin`
/ `isAdmin` in the route file; "partial" means fewer checks than exported methods.
This is a pointer for the RBAC task in `DEFERRED.md`, not a verified security audit.

---

## 2. Every component and where it is imported

Grouped by folder. `←` lists the importers. Files marked **DEAD** are covered in §3.

### 2.1 `src/components/` (shared)

| Component                                            | Imported by                                                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `ActivityFeed.tsx`                                   | `app/dashboard/page.tsx`                                                                          |
| `AuthProvider.tsx`                                   | `app/layout.tsx`                                                                                  |
| `BackButton.tsx`                                     | `app/sites/[id]/page.tsx`                                                                         |
| `ClientAuthGuard.tsx`                                | `app/layout.tsx`                                                                                  |
| `EventForm.tsx`                                      | `app/events/new/page.tsx`, `app/events/[id]/edit/page.tsx`, `app/admin/events/[id]/edit/page.tsx` |
| `Navigation.tsx`                                     | `app/layout.tsx`                                                                                  |
| `ProtectedRoute.tsx`                                 | `app/profile/page.tsx`, `app/settings/page.tsx`                                                   |
| `ActivityTypesParticipationChart.tsx`                | **DEAD** — nothing                                                                                |
| `MonthlyActivityReport.tsx` (root-level, 1021 lines) | **DEAD** — only a commented-out import in `app/reports/monthly/page.tsx`                          |
| `MonthlyReportExportButton.tsx` (root-level)         | **DEAD** — only the dead root `MonthlyActivityReport.tsx`                                         |
| `MonthlyParticipantGrowthChart.tsx`                  | **DEAD** — nothing                                                                                |
| `ProgramGoalsPieChart.tsx`                           | **DEAD** — nothing                                                                                |
| `SignOutButton.tsx`                                  | **DEAD** — nothing                                                                                |
| `_EventForm.tsx`                                     | **DEAD** — nothing                                                                                |
| `StepOne.tsx`, `StepTwo.tsx`, `StepThree.tsx`        | **DEAD** — only `_EventForm.tsx`                                                                  |

### 2.2 `src/components/reports/monthly/` (live monthly report module)

| Component                        | Imported by                                                               |
| -------------------------------- | ------------------------------------------------------------------------- |
| `index.ts`                       | `app/reports/monthly/page.tsx` (default export = `MonthlyActivityReport`) |
| `MonthlyActivityReport.tsx`      | `index.ts`                                                                |
| `ActivityTypeByRegionTable.tsx`  | `MonthlyActivityReport.tsx`, `index.ts`                                   |
| `DateRangeDialog.tsx`            | `MonthlyActivityReport.tsx`, `index.ts`                                   |
| `GrowthIndicators.tsx`           | `MonthlyActivityReport.tsx`, `ActivityTypeByRegionTable.tsx`, `index.ts`  |
| `MetricCard.tsx`                 | `MonthlyActivityReport.tsx`, `index.ts`                                   |
| `MonthlyReportExportButton.tsx`  | `MonthlyActivityReport.tsx`                                               |
| `SitePerformanceCard.tsx`        | `MonthlyActivityReport.tsx`, `index.ts`                                   |
| `SupplyDistributionsSidebar.tsx` | `MonthlyActivityReport.tsx`, `index.ts`                                   |
| `types.ts`                       | all of the above                                                          |

### 2.3 `src/app/**/components/` (route-local)

| Component                                                              | Imported by                                                               |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `events/components/EventsListClient.tsx`                               | `events/page.tsx`                                                         |
| `events/components/DuplicateEventDialog.tsx`                           | `EventsListClient.tsx`, `events/[id]/page.tsx`                            |
| `events/components/EventCard.tsx`                                      | **DEAD**                                                                  |
| `events/components/EventsGrid.tsx`                                     | **DEAD**                                                                  |
| `events/components/EventsSearch.tsx`                                   | **DEAD**                                                                  |
| `events/[id]/components/EditButton.tsx`                                | **DEAD** — `events/[id]/page.tsx` renders its own inline `<Link>` instead |
| `sites/components/SitesListClient.tsx`                                 | `sites/page.tsx`                                                          |
| `sites/[id]/components/EditButton.tsx`                                 | `sites/[id]/page.tsx`                                                     |
| `sites/[id]/components/GoogleMapsButton.tsx`                           | `sites/[id]/page.tsx`                                                     |
| `supplies/[id]/components/SupplyDetailCard.tsx`                        | `supplies/[id]/page.tsx`                                                  |
| `supply-distributions/components/SupplyDistributionForm.tsx`           | `supply-distributions/new/page.tsx`                                       |
| `admin/activity-types/AdminActivityTypesPage.tsx`                      | `admin/activity-types/page.tsx`                                           |
| `admin/activity-types/components/activity-types-table.tsx`             | `AdminActivityTypesPage.tsx`                                              |
| `admin/activity-types/components/create-activity-type-dialog.tsx`      | `AdminActivityTypesPage.tsx`                                              |
| `admin/activity-types/components/edit-activity-type-dialog.tsx`        | `activity-types-table.tsx`                                                |
| `admin/activity-types/components/delete-activity-type-dialog.tsx`      | `activity-types-table.tsx`                                                |
| `admin/community-partners/components/community-partners-table.tsx`     | `admin/community-partners/page.tsx`                                       |
| `admin/community-partners/components/create-partner-dialog.tsx`        | `admin/community-partners/page.tsx`                                       |
| `admin/community-partners/components/edit-partner-dialog.tsx`          | `community-partners-table.tsx`                                            |
| `admin/community-partners/components/delete-partner-dialog.tsx`        | `community-partners-table.tsx`                                            |
| `admin/events/components/events-table.tsx`                             | `admin/events/page.tsx`                                                   |
| `admin/events/components/delete-event-dialog.tsx`                      | `admin/events/page.tsx`                                                   |
| `admin/events/components/ErrorBoundary.tsx`                            | **DEAD**                                                                  |
| `admin/events/components/Loading.tsx`                                  | **DEAD**                                                                  |
| `admin/program-goals/components/program-goals-table.tsx`               | `admin/program-goals/page.tsx`                                            |
| `admin/program-goals/components/create-goal-dialog.tsx`                | `admin/program-goals/page.tsx`                                            |
| `admin/program-goals/components/edit-goal-dialog.tsx`                  | `program-goals-table.tsx`                                                 |
| `admin/program-goals/components/delete-goal-dialog.tsx`                | `program-goals-table.tsx`                                                 |
| `admin/sites/components/SitesTable.tsx`                                | `admin/sites/page.tsx`                                                    |
| `admin/sites/components/SiteForm.tsx`                                  | `admin/sites/new/page.tsx`, `admin/sites/[id]/edit/page.tsx`              |
| `admin/sites/components/BooleanBadge.tsx`                              | `SitesTable.tsx`                                                          |
| `admin/sites/components/DeleteSiteDialog.tsx`                          | `SitesTable.tsx`                                                          |
| `admin/sites/components/ErrorBoundary.tsx`                             | **DEAD**                                                                  |
| `admin/sites/components/Loading.tsx`                                   | **DEAD**                                                                  |
| `admin/supplies/components/supplies-table.tsx`                         | `admin/supplies/page.tsx`                                                 |
| `admin/supplies/components/create-supply-dialog.tsx`                   | `admin/supplies/page.tsx`                                                 |
| `admin/supplies/components/edit-supply-dialog.tsx`                     | `supplies-table.tsx`                                                      |
| `admin/supplies/components/view-supply-dialog.tsx`                     | `supplies-table.tsx`                                                      |
| `admin/supplies/components/delete-supply-dialog.tsx`                   | `supplies-table.tsx`                                                      |
| `admin/supply-distributions/components/distributions-table.tsx`        | `admin/supply-distributions/page.tsx`                                     |
| `admin/supply-distributions/components/view-distribution-dialog.tsx`   | `distributions-table.tsx`                                                 |
| `admin/supply-distributions/components/delete-distribution-dialog.tsx` | `distributions-table.tsx`                                                 |
| `admin/supply-distributions/components/create-distribution-dialog.tsx` | **DEAD**                                                                  |
| `admin/users/AdminUsersPage.tsx`                                       | `admin/users/page.tsx`                                                    |
| `admin/users/components/UsersTable.tsx`                                | `AdminUsersPage.tsx`                                                      |
| `admin/users/components/InviteUserDialog.tsx`                          | `AdminUsersPage.tsx`                                                      |
| `admin/users/components/EditUserDialog.tsx`                            | `UsersTable.tsx`                                                          |
| `admin/users/components/RoleBadge.tsx`                                 | `UsersTable.tsx`                                                          |
| `admin/users/components/StatusBadge.tsx`                               | `UsersTable.tsx`                                                          |
| `admin/users/components/RegionBadge.tsx`                               | `UsersTable.tsx`                                                          |
| `admin/users/components/JobTitleBadge.tsx`                             | `UsersTable.tsx`                                                          |

### 2.4 `src/components/ui/` (shadcn primitives)

Importer counts are app files (imports from other `ui/*` files excluded), across
all files including dead ones; "live" is after excluding the dead set from §3.

| Primitive           | Importers (live) | Notes                                                                     |
| ------------------- | ---------------- | ------------------------------------------------------------------------- |
| `button.tsx`        | 74 (61)          |                                                                           |
| `card.tsx`          | 49 (36)          |                                                                           |
| `input.tsx`         | 33 (28)          |                                                                           |
| `badge.tsx`         | 28 (21)          |                                                                           |
| `dialog.tsx`        | 25 (21)          |                                                                           |
| `label.tsx`         | 25 (19)          |                                                                           |
| `alert.tsx`         | 15 (14)          |                                                                           |
| `select.tsx`        | 12 (11)          |                                                                           |
| `table.tsx`         | 8 (8)            | only admin tables; the report module hand-rolls `<table>`                 |
| `textarea.tsx`      | 5 (3)            |                                                                           |
| `checkbox.tsx`      | 4 (2)            |                                                                           |
| `popover.tsx`       | 3 (1)            | `EventForm`                                                               |
| `command.tsx`       | 2 (1)            | `EventForm`                                                               |
| `avatar.tsx`        | 2 (2)            |                                                                           |
| `calendar.tsx`      | 2 (1)            | `EventForm`                                                               |
| `separator.tsx`     | 2 (2)            |                                                                           |
| `dropdown-menu.tsx` | 1 (1)            | `Navigation`                                                              |
| `switch.tsx`        | 1 (1)            | `EditUserDialog`                                                          |
| `skeleton.tsx`      | 2 (0)            | **DEAD** — only the two dead `Loading.tsx`                                |
| `progress.tsx`      | 1 (0)            | **DEAD** — only `_EventForm.tsx`                                          |
| `toggle.tsx`        | 0                | **DEAD** — imported only by `ui/toggle-group.tsx`                         |
| `toggle-group.tsx`  | 0                | **DEAD**                                                                  |
| `tabs.tsx`          | 0                | **DEAD**                                                                  |
| `chart.tsx`         | 0                | **DEAD** (the only thing besides two dead charts that imports `recharts`) |

### 2.5 Non-component modules (for completeness)

| Module                                      | Imported by                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/lib/auth.ts`                           | root layout, 12 pages, 30 API routes, `server/actions/reports.ts`, `lib/role-guard.ts`, all four `lib/data/*` |
| `src/lib/role-guard.ts`                     | `app/admin/layout.tsx`                                                                                        |
| `src/lib/auth-guard.ts`                     | **DEAD**                                                                                                      |
| `src/lib/data/program-goals.ts`             | `app/admin/activity-types/page.tsx`                                                                           |
| `src/lib/data/users.ts`                     | `app/admin/users/page.tsx`                                                                                    |
| `src/lib/data/sites.ts`                     | **DEAD**                                                                                                      |
| `src/lib/data/community-partners.ts`        | **DEAD**                                                                                                      |
| `src/lib/validations/events.ts`             | 3 API routes + dead `_EventForm.tsx` (live `EventForm.tsx` does **not** use it)                               |
| `src/lib/validations/sites.ts`              | `SiteForm.tsx`, 2 API routes                                                                                  |
| `src/lib/services/activity-feed.service.ts` | 19 API routes                                                                                                 |
| `src/lib/utils.ts` (`cn`)                   | 24 `ui/*` files + `EventForm.tsx` + `StepOne.tsx` — no other app component uses `cn`                          |
| `src/lib/utils/time.utils.ts`               | `api/activity-feed/route.ts`                                                                                  |
| `src/hooks/useActivityFeed.ts`              | `ActivityFeed.tsx`                                                                                            |
| `src/hooks/useRole.ts`                      | **DEAD**                                                                                                      |
| `src/server/actions/reports.ts`             | `app/reports/monthly/page.tsx`                                                                                |
| `src/scripts/seed.ts`                       | not imported — it is the `npm run db:seed` entry point (not dead)                                             |
| `types/next-auth.d.ts`                      | ambient declaration, consumed by the compiler (not dead)                                                      |

---

## 3. Components imported nowhere (dead files)

31 files are unreachable from any route, layout, API route, or middleware. Grouped
by what they appear to be, with the live replacement where one exists.

### 3.1 Superseded by a rewrite (older version left on disk)

| Dead file(s)                                                                                             | Live replacement                                                     | Notes                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/components/_EventForm.tsx` + `StepOne.tsx`, `StepTwo.tsx`, `StepThree.tsx`                          | `src/components/EventForm.tsx`                                       | 3-step wizard (Dialog + Progress) replaced by the 956-line single-page form. The wizard is the only importer of `ui/progress.tsx` and of `lib/validations/events.ts` on the client side.                                                                     |
| `src/components/MonthlyActivityReport.tsx` (1021 lines) + `src/components/MonthlyReportExportButton.tsx` | `src/components/reports/monthly/*`                                   | Monolith refactored into the module. Import in `reports/monthly/page.tsx` is commented out, not deleted. The two `MonthlyReportExportButton`s are **different implementations** (dead: filename dialog, 4 sheets, minutes; live: one-click, 1 sheet, hours). |
| `src/app/events/components/EventCard.tsx`, `EventsGrid.tsx`, `EventsSearch.tsx`                          | `src/app/events/components/EventsListClient.tsx`                     | Decomposed list replaced by one consolidated client component.                                                                                                                                                                                               |
| `src/app/admin/supply-distributions/components/create-distribution-dialog.tsx` (475 lines)               | `src/app/supply-distributions/components/SupplyDistributionForm.tsx` | Dialog-style create replaced by a full-page form under a different route.                                                                                                                                                                                    |
| `src/components/SignOutButton.tsx`                                                                       | inline `handleSignOut` in `Navigation.tsx`                           |                                                                                                                                                                                                                                                              |
| `src/lib/auth-guard.ts` (`requireAuth`, `getSession`)                                                    | `src/lib/role-guard.ts`                                              | Only file that handles the `isActive === false` → `/login?error=account_deactivated` case server-side; `middleware.ts` does the same at the edge.                                                                                                            |
| `src/hooks/useRole.ts`                                                                                   | server-side `requireAdmin()` / `session.user.role`                   | Client-side role hook never adopted.                                                                                                                                                                                                                         |

### 3.2 Copy-pasted scaffolding never wired up

| Dead file(s)                                                                                               | Notes                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/app/admin/events/components/ErrorBoundary.tsx` and `src/app/admin/sites/components/ErrorBoundary.tsx` | Same class component; differ only by header comment and copy text. Not Next.js `error.tsx` files, so never mounted.                                                                                                                              |
| `src/app/admin/events/components/Loading.tsx` and `src/app/admin/sites/components/Loading.tsx`             | Byte-identical apart from a header comment. Export `TableLoading` / `FormLoading` built on `ui/skeleton.tsx`. Not Next.js `loading.tsx`, so never mounted. Every live admin page instead inlines its own `bg-gray-200 … animate-pulse` skeleton. |
| `src/app/events/[id]/components/EditButton.tsx`                                                            | Mirror of the live `sites/[id]/components/EditButton.tsx` (`eventId`/`siteId` swapped); `events/[id]/page.tsx` renders an inline `<Link>` instead.                                                                                               |
| `src/lib/data/sites.ts`, `src/lib/data/community-partners.ts`                                              | `checkAdminAccess()` + `get*Count()` helpers built to the same pattern as the live `program-goals.ts` / `users.ts`; nothing calls them.                                                                                                          |

### 3.3 Abandoned features (no live equivalent)

| Dead file                                            | Notes                                                                                              |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/components/ActivityTypesParticipationChart.tsx` | Recharts bar chart.                                                                                |
| `src/components/ProgramGoalsPieChart.tsx`            | Recharts pie chart.                                                                                |
| `src/components/MonthlyParticipantGrowthChart.tsx`   | Per-region growth card; its icon/colour logic now lives in `reports/monthly/GrowthIndicators.tsx`. |
| `src/components/ui/chart.tsx`                        | shadcn chart wrapper; with the two charts above, the only importers of `recharts`.                 |

### 3.4 Unused shadcn primitives

`src/components/ui/tabs.tsx`, `toggle-group.tsx`, `toggle.tsx`, `progress.tsx`,
`skeleton.tsx`, `chart.tsx`. Removing them would also let
`@radix-ui/react-tabs`, `react-toggle`, `react-toggle-group`, `react-progress` and
`recharts` leave `package.json`. `react-hook-form` and `@hookform/resolvers` are
already imported by nothing at all — every form in the app is hand-rolled
`useState`.

### 3.5 Caveat

"Dead" here means _not reachable through static `import` statements from a Next.js
entry point_. It does not cover `next/dynamic` string imports (none found) or
files referenced by tooling. `seed.ts` and `next-auth.d.ts` are excluded for that
reason.

---

## 4. How styling is done, and where it is inconsistent

### 4.1 The mechanism

- **Tailwind v4** via `@tailwindcss/postcss`; no `tailwind.config.*` (the `components.json` `tailwind.config` field is empty, which is correct for v4). Theme is defined in `src/app/globals.css` with `@theme inline` mapping shadcn's CSS variables (`--background`, `--primary`, `--muted`, `--destructive`, `--chart-1..5`, `--sidebar-*`, `--radius`) to Tailwind colour tokens. Palette is the shadcn **`neutral`** default in `oklch` — every brand colour is grey; `--primary` is near-black.
- A `.dark` block exists and `@custom-variant dark` is declared, but nothing ever adds the `dark` class. `dark:` variants appear only inside `ui/*` primitives (shadcn boilerplate). Dark mode is unreachable.
- **shadcn/ui (new-york style)** primitives in `src/components/ui/`, using `class-variance-authority` for variants and `cn()` (`clsx` + `tailwind-merge`) from `src/lib/utils.ts`.
- **Fonts**: Geist Sans / Geist Mono from `next/font/google`, exposed as `--font-geist-sans` / `--font-geist-mono`. (The untracked `design-system/` folder specifies a system-UI stack instead — see 4.4.)
- **Icons**: `lucide-react` everywhere (102 import sites). No other icon library.
- **No** CSS modules, styled-components, `<style>` tags (except inside `ui/chart.tsx`), or per-component CSS. `globals.css` is the only stylesheet.
- **Inline `style={{}}`** appears 11 times, all for data-driven values (progress-bar widths, chart colours) — legitimate, except that the events detail page and `SitePerformanceCard` implement the same progress bar with different tracks (`bg-gray-200` vs `bg-muted`) and fills (`bg-orange-500`/`bg-blue-500` vs `bg-blue-400`).
- Hex colours in TS: `server/actions/reports.ts` hard-codes a 10-colour Tailwind-500 hex palette for regions, and the two email-sending API routes embed `#007cff` / `#f5f5f5` in HTML strings. Neither is connected to `--chart-*`.

### 4.2 Semantic tokens vs raw palette

The app is split between two colour vocabularies:

- **Theme tokens** (`bg-background`, `text-muted-foreground`, `bg-card`, `text-primary`, `variant="destructive"`) — used for layout, surfaces, and typography almost everywhere.
- **Raw Tailwind palette classes** (`text-red-600`, `bg-green-50`, `border-blue-200`…) — **343 occurrences across 55 files** for anything that carries _meaning_: errors, success, validation, stat accents, activity-type colour-coding, delete buttons.

Top raw-palette users: `EventForm.tsx` (57), `ActivityFeed.tsx` (26), `SiteForm.tsx` (18), `delete-distribution-dialog.tsx` (14), `events/[id]/page.tsx` (13), `StepTwo.tsx` (12, dead), `GrowthIndicators.tsx` (12).

Most frequent classes: `text-red-600` ×45, `border-red-500` ×31, `text-green-600` ×28, `text-red-500` ×24, `bg-green-50` ×15, `border-green-200` ×14, `text-green-800` ×12, `text-blue-600` ×12, `text-gray-500` ×11, `bg-gray-200` ×11.

The consequence: `--destructive` exists in the theme but destructive _meaning_ is expressed with at least four different reds (`red-500`, `red-600`, `red-700`, `red-800`, `red-900`) chosen per file; success has no token at all and is `green-50/200/600/800` by convention; there is no warning/info token so blue and yellow are improvised. Changing the brand palette means editing ~55 files by hand rather than `globals.css`.

### 4.3 Specific inconsistencies

**Page containers.** Nineteen distinct top-level wrapper strings. The dominant ones:

| Wrapper                                                                           | Where                                                                                                                                          |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `container mx-auto p-4 space-y-6` ×8                                              | admin list pages (inside the admin layout's own `p-6` / `max-w-7xl`, so admin pages get double padding and a `container` inside a `max-w-7xl`) |
| `max-w-7xl mx-auto space-y-6` ×5 (usually under `min-h-screen bg-background p-6`) | dashboard, events list/detail, sites list/detail                                                                                               |
| `container mx-auto p-4 max-w-4xl` ×4                                              | `SiteForm`                                                                                                                                     |
| `container mx-auto p-4 max-w-2xl` ×4                                              | profile, settings, both not-found pages                                                                                                        |
| `max-w-4xl mx-auto p-6 space-y-6`                                                 | `SupplyDistributionForm`                                                                                                                       |
| `mx-auto max-w-2xl`                                                               | `SupplyDetailCard`                                                                                                                             |
| `max-w-7xl mx-auto py-6` vs `container mx-auto py-6 space-y-6`                    | `reports/monthly/page.tsx` vs its own sibling `loading.tsx`                                                                                    |

Some pages set `min-h-screen bg-background` themselves even though `<main>` in the root layout already does; `admin/layout.tsx` adds another `min-h-screen`.

**Headings.** `<h1>` is `text-3xl font-bold` ×14, `text-3xl font-bold tracking-tight` ×4, `text-lg font-semibold` ×1, `text-4xl font-bold mb-4` ×1. The monthly report's page title is an `<h2 className="text-3xl font-bold">` with no `<h1>` on the page.

**Error and status messages — five patterns for one job.**

1. `<Alert variant="destructive">` — login, reset-password, settings, all admin tables, `SiteForm`, `SupplyDistributionForm` (15 files).
2. `<Alert className="border-green-200 bg-green-50">` + `text-green-600` icon + `text-green-800` text for success — the same hand-tinted `Alert` repeated in ~12 files because there is no success variant.
3. Hand-rolled `<div className="p-4 bg-red-50 border border-red-200 rounded-md">` — six delete dialogs, `EventForm`, `DateRangeDialog` (with `text-red-700`), dead `MonthlyActivityReport`.
4. Hand-rolled blue/yellow/green/red boxes in `EventForm.tsx` (`bg-blue-50 border-blue-200 text-blue-900` etc.) and a blue box in `forgot-password`.
5. `toast()` from **sonner** in `DuplicateEventDialog.tsx` — but no `<Toaster />` is mounted anywhere, so those toasts never render. (Handed off: this needs a manual check in the browser; the grep for `Toaster` across `src/` returns nothing.)

`delete-distribution-dialog.tsx` alone uses a **grey** detail box (`bg-gray-50 border-gray-200`) where every other delete dialog uses red.

**Form validation.** `border-red-500` on the control + `text-red-600` / `text-red-500` message text, hand-applied per field in `EventForm` (11), `SiteForm` (7), and the dead wizard. Required-field asterisks are `text-red-500`. The `--destructive` token and `aria-invalid` styling that the shadcn `Input` already ships (`aria-invalid:border-destructive`) are not used. All forms are `useState`-driven; `react-hook-form` is installed and unused.

**Buttons.** Primary actions are the default `Button` everywhere except `SupplyDistributionForm`'s submit, which is `className="bg-blue-600 hover:bg-blue-700"`. `EventForm` colours three summary `Badge`s with `bg-blue-600` / `bg-purple-600` / `bg-green-600` instead of a variant. Delete/sign-out actions use `text-red-600 hover:text-red-700` on `variant="ghost"` (`EventsListClient`, `SitesListClient`, `Navigation`) rather than `variant="destructive"` — which the admin dialogs _do_ use. `variant="outline"` is used 183 times vs `variant="default"` once; the visual hierarchy is mostly outline buttons.

**Loading states — four patterns.** `Loader2` spinner (11 files); a hand-rolled `animate-spin rounded-full border-…` div (`settings` uses `border-gray-900`, the two view dialogs use `border-primary`, `EventForm` uses `border-white`); plain `"Loading..."` text in every admin table body; inline `bg-gray-200 … animate-pulse` skeleton blocks copy-pasted into all nine admin pages as `Suspense` fallbacks that never actually suspend (the tables fetch client-side after mount). `ui/skeleton.tsx` exists and is only used by dead files.

**Tables.** The eight admin tables use `ui/table.tsx`. The monthly report module (`ActivityTypeByRegionTable`, `SupplyDistributionsSidebar`) and the dead root report hand-roll `<table>`. `view-distribution-dialog` builds a `grid-cols-12` instead. Every admin table also contains its own ~150-line copy of the same First/Prev/pages/Next/Last pagination block and the same green/red message block.

**Native controls where primitives exist.** `DateRangeDialog.tsx` uses raw `<select>` ×4 and `<input type="checkbox">` styled with `w-full p-2 text-sm border rounded focus:ring-2 focus:ring-primary`, while every other form uses `ui/select` and `ui/checkbox`. `EventForm` uses raw `<input type="checkbox">` with `border-gray-300` for the two boolean fields. `SupplyDetailCard` hand-rolls card chrome (`rounded-lg border bg-card shadow-sm`) instead of `<Card>`. `Navigation` uses a raw `<button>` as the dropdown trigger.

**Badges and status colouring.** `users/` has four dedicated badge components mapping values to `variant`s; `sites/` has a generic `BooleanBadge`; `distributions-table.tsx` and `view-distribution-dialog.tsx` each contain their own identical `getDistributionTypeBadge()` switch; `EditUserDialog` inlines `text-green-600` / `text-red-600` Active/Inactive spans instead of reusing `StatusBadge`; `ActivityFeed.getActivityColor()` maps ~24 activity types to eleven different `text-*-600` hues with no semantic rule (all `*_updated` are blue, `*_created` vary).

**Decorative accents with no token.** Stat-card icons on the event and site detail pages are `text-blue-500` / `text-green-500` / `text-purple-500` / `text-orange-500`; dashboard Quick Start chips are `bg-blue-100`/`text-blue-600`, `bg-purple-100`/`text-purple-600`, `bg-orange-100`/`text-orange-600`; avatar fallbacks on both detail pages are `bg-gradient-to-br from-blue-500 to-purple-500`; not-found pages use an orange icon chip, `unauthorized` a red one.

**Class composition.** `cn()` is used by `EventForm` and the `ui/*` files only. Everywhere else conditional classes are template literals (`className={\`… ${cond ? 'a' : 'b'}\`}`, 29 occurrences) or `[…].join(' ')` (`Navigation`), so `tailwind-merge` conflict resolution never applies in app code.

**Naming and layout of component files.** `admin/sites` and `admin/users` use PascalCase files (`SitesTable.tsx`, `InviteUserDialog.tsx`); the other five admin sections use kebab-case (`supplies-table.tsx`, `create-goal-dialog.tsx`). Shared components are PascalCase in `src/components/`; route-local components live in `src/app/**/components/`, except `EventForm.tsx` (used by both `/events` and `/admin/events`) and the report module, which live in `src/components/`.

**Navigation.** `admin/page.tsx` and the dashboard admin card use raw `<a href>` (full reloads) where the rest of the app uses `next/link` (14 files). `admin/page.tsx` links to `/admin/settings`, which has no route.

**Leftovers visible in the styled output.** Dev-process comments in live files: `{/* ADD THIS WRAPPER DIV */}` ×3 in `reports/monthly/MonthlyActivityReport.tsx`; `{/* Removed badges … as requested */}` in `SitesListClient.tsx`; a commented-out Back button in `SupplyDistributionForm.tsx`; ten `console.log`s in `settings/page.tsx`; `metadata.title = 'Create Next App'`; the stock `create-next-app` `README.md`.

### 4.4 The untracked `design-system/` folder

`design-system/` (untracked, ~19 entries) is a BC Housing design system reverse-engineered from screenshots of internal .NET/Bootstrap apps: `tokens/colors.css` (teal `#006265` identity / blue `#0073CE` action, fixed status colours), `tokens/typography.css` (system-UI stack, 13–15 px body), `tokens/spacing.css` (4 px scale, 2/4/6 px radii), plain-JSX components, and per-screen `templates/` whose names line up one-to-one with this app's routes (`dashboard`, `events`, `event-detail`, `log-event`, `site-management`, `monthly-reports`, `user-management`, …). It is not imported by anything in `src/`. Every inconsistency in 4.3 is a place where the redesign will have to decide between the current shadcn-neutral vocabulary and these tokens; the raw-palette count in 4.2 is the size of that job.

---

## Appendix: how to regenerate the dead-file list

```bash
# From the repo root. Strips comments, resolves @/ and relative imports,
# walks from page/layout/loading/not-found/route/middleware entry points.
python3 - <<'EOF'
import os, re
files=[os.path.join(d,f) for b in ('src','types') for d,_,fs in os.walk(b) for f in fs if f.endswith(('.ts','.tsx'))]+['middleware.ts']
imp=re.compile(r'''(?:import|export)\s+(?:type\s+)?(?:[\w*\s{},$]+?\s+from\s+)?['"]([^'"]+)['"]''')
def res(s,f):
    p=os.path.join('src',s[2:]) if s.startswith('@/') else os.path.normpath(os.path.join(os.path.dirname(f),s)) if s.startswith('.') else None
    if not p: return None
    for c in (p,p+'.ts',p+'.tsx',p+'/index.ts',p+'/index.tsx'):
        if os.path.isfile(c): return c
fwd={}
for f in files:
    s=open(f).read(); s=re.sub(r'/\*.*?\*/','',s,flags=re.S); s=re.sub(r'^\s*//.*$','',s,flags=re.M)
    fwd[f]={r for m in imp.finditer(s) if (r:=res(m.group(1),f))}
entries=[f for f in files if f=='middleware.ts' or (f.startswith('src/app/') and os.path.basename(f) in ('page.tsx','layout.tsx','loading.tsx','not-found.tsx','route.ts'))]
seen=set(); st=list(entries)
while st:
    f=st.pop()
    if f in seen: continue
    seen.add(f); st.extend(fwd.get(f,()))
for f in sorted(set(files)-seen): print(f)
EOF
```

## 5. Template → route map

20 templates in `design-system/templates/`. 28 page routes in the app.
Template folder names are the reference; `.dc.html` contents are ground truth.
Open each template before converting it.

### 5.1 Direct maps

| Template                  | Route                                                         | Files that must change                                                                                                                           | Notes                                                                                                                                                                                                         |
| ------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sign-in`                 | `/login`                                                      | `app/login/page.tsx`                                                                                                                             | Clean 1:1. Best first conversion.                                                                                                                                                                             |
| `reset-password`          | `/reset-password/[token]`                                     | `app/reset-password/[token]/page.tsx`                                                                                                            | Check whether the template covers request-link as well as set-new-password.                                                                                                                                   |
| `dashboard`               | `/dashboard`                                                  | `app/dashboard/page.tsx`, `components/ActivityFeed.tsx`                                                                                          | Metric cards → design-system KPI card. Quick Start chips and admin nav card are raw-palette (4.3). `ActivityFeed.getActivityColor()` maps 24 types to 11 hues with no semantic rule — needs a token decision. |
| `events`                  | `/events`                                                     | `app/events/page.tsx`, `events/components/EventsListClient.tsx`                                                                                  |                                                                                                                                                                                                               |
| `event-detail`            | `/events/[id]`                                                | `app/events/[id]/page.tsx`, `events/components/DuplicateEventDialog.tsx`                                                                         | 13 raw-palette hits. Stat-card icon colours (`blue/green/purple/orange-500`) have no token. Progress bars differ from `SitePerformanceCard`'s.                                                                |
| `log-event`               | `/events/new`, `/events/[id]/edit`, `/admin/events/[id]/edit` | `components/EventForm.tsx` (956 lines)                                                                                                           | One component, three routes — convert once, verify all three. Highest raw-palette count in the repo (57). Raw `<input type="checkbox">` where `ui/checkbox` exists.                                           |
| `site-management`         | `/admin/sites`                                                | `admin/sites/page.tsx`, `admin/sites/components/{SitesTable,BooleanBadge,DeleteSiteDialog}.tsx`                                                  | Admin list with edit/delete controls. Convert before `/sites`.                                                                                                                                                |
| `create-site`             | `/admin/sites/new`, `/admin/sites/[id]/edit`                  | `admin/sites/components/SiteForm.tsx`                                                                                                            | Shared create/edit form. 18 raw-palette hits.                                                                                                                                                                 |
| `site-detail`             | `/sites/[id]`                                                 | `app/sites/[id]/page.tsx`, `sites/[id]/components/{EditButton,GoogleMapsButton}.tsx`, `components/BackButton.tsx`                                |                                                                                                                                                                                                               |
| `activity-types`          | `/admin/activity-types`                                       | `admin/activity-types/page.tsx`, `AdminActivityTypesPage.tsx`, `components/{activity-types-table,create-,edit-,delete-activity-type-dialog}.tsx` | First admin-CRUD conversion — establishes the pattern for the other four.                                                                                                                                     |
| `program-goals`           | `/admin/program-goals`                                        | `admin/program-goals/page.tsx`, `components/{program-goals-table,create-,edit-,delete-goal-dialog}.tsx`                                          |                                                                                                                                                                                                               |
| `supplies-management`     | `/admin/supplies`                                             | `admin/supplies/page.tsx`, `components/{supplies-table,create-,edit-,view-,delete-supply-dialog}.tsx`                                            |                                                                                                                                                                                                               |
| `distribution-management` | `/admin/supply-distributions`                                 | `admin/supply-distributions/page.tsx`, `components/{distributions-table,delete-distribution-dialog}.tsx`                                         | Delete dialog uses a grey box where every other delete dialog uses red — fix during conversion.                                                                                                               |
| `log-distribution`        | `/supply-distributions/new`                                   | `app/supply-distributions/new/page.tsx`, `supply-distributions/components/SupplyDistributionForm.tsx`                                            | Submit button hardcodes `bg-blue-600`.                                                                                                                                                                        |
| `user-management`         | `/admin/users`                                                | `admin/users/page.tsx`, `AdminUsersPage.tsx`, `components/{UsersTable,InviteUserDialog,RoleBadge,StatusBadge,RegionBadge,JobTitleBadge}.tsx`     |                                                                                                                                                                                                               |
| `monthly-reports`         | `/reports/monthly`                                            | `reports/monthly/page.tsx`, `reports/monthly/loading.tsx`, `components/reports/monthly/*` (9 files)                                              | Largest single job. Hand-rolled `<table>`s → design-system table. Page and its sibling `loading.tsx` use different wrappers.                                                                                  |
| `account-settings`        | `/settings`                                                   | `app/settings/page.tsx`                                                                                                                          | See 5.4 re: `/profile`.                                                                                                                                                                                       |

### 5.2 Template is a page, app has a dialog — decide before converting

| Template              | Current implementation                                                                        | Decision needed                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `distribution-detail` | `admin/supply-distributions/components/view-distribution-dialog.tsx` (dialog, `grid-cols-12`) | Promote to a `/supply-distributions/[id]` route, or apply the template's content layout inside the existing dialog. |
| `user-detail`         | `admin/users/components/EditUserDialog.tsx` (dialog)                                          | Same question. No `/users/[id]` route exists.                                                                       |

Route promotion is a feature change, not a redesign. If you promote either, it belongs in step 10, not step 9.

### 5.3 Templates with no route

| Template                   | Action                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `log-out-of-scope-request` | No route, no API, no component. New feature — defer, out of scope for the redesign. |

### 5.4 Routes with no template

| Route                                             | Files                                                                        | Action                                                                                                                                                            |
| ------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/sites`                                          | `app/sites/page.tsx`, `sites/components/SitesListClient.tsx`                 | Read-only staff list. Extrapolate from `site-management` minus admin controls.                                                                                    |
| `/`                                               | `app/page.tsx`                                                               | Extrapolate from `sign-in`.                                                                                                                                       |
| `/forgot-password`                                | `app/forgot-password/page.tsx`                                               | Extrapolate from `reset-password`. Currently a hand-rolled blue info box.                                                                                         |
| `/unauthorized`                                   | `app/unauthorized/page.tsx`                                                  | Needs a design-system error/empty state. Build once.                                                                                                              |
| `/events/[id]/not-found`, `/sites/[id]/not-found` | 2 files                                                                      | Reuse the `/unauthorized` empty state.                                                                                                                            |
| `/admin`                                          | `admin/page.tsx`                                                             | 12-link index, no template. Also uses raw `<a href>` and links to nonexistent `/admin/settings`.                                                                  |
| `/admin/community-partners`                       | `admin/community-partners/page.tsx` + 4 dialog/table components              | Extrapolate from `program-goals` — same admin-CRUD shape.                                                                                                         |
| `/admin/events`                                   | `admin/events/page.tsx`, `components/{events-table,delete-event-dialog}.tsx` | Extrapolate from `activity-types` admin-CRUD pattern.                                                                                                             |
| `/supplies/[id]`                                  | `supplies/[id]/components/SupplyDetailCard.tsx`                              | Extrapolate from `site-detail`. Hand-rolls card chrome instead of `<Card>`.                                                                                       |
| `/profile`                                        | `app/profile/page.tsx`                                                       | Non-functional stub — submit only `console.log`s; duplicates `/settings`. **Recommend deleting in step 11 rather than redesigning.** Confirm nothing links to it. |

### 5.5 Conversion order

1. `sign-in`, `reset-password` — small, no data. Proves the token pipeline end to end.
2. `/`, `/forgot-password`, `/unauthorized`, both not-found pages — cheap extrapolations once 1 is done.
3. `dashboard` — high visibility, moderate complexity.
4. `events` → `event-detail` → `log-event`.
5. `site-management` → `create-site` → `/sites` (read-only variant) → `site-detail`.
6. Admin CRUD: `activity-types` first, then `program-goals`, `supplies-management`, `distribution-management`, `user-management`, `/admin/community-partners`, `/admin/events`. §1.4 shows these are the same page built three different ways — converge them on the pattern set by `activity-types`.
7. `log-distribution`, `account-settings`, `/supplies/[id]`, `/admin`.
8. `monthly-reports` — last. Largest, and benefits from every pattern established above.

### 5.6 Deferred to step 10

Refactors this map surfaces but which must not happen during the visual pass:

- `SitesListClient` / `EventsListClient` / `SitesTable` are three implementations of one list. After conversion the overlap will be visible; extract then, not before.
- Route promotion for `distribution-detail` and `user-detail` (5.2).
- Deleting `/profile` (5.4) — step 11.
