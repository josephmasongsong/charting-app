# /admin/users vs user-management + user-detail templates

**Templates:** `UserManagement.dc.html` — "staff-directory list of accounts with role, program and status, plus a pending-invitations tab" (header + Invite user → 4-tile stats row → **tab bar** (Users / Pending invitations) → tabbed card: filter strip + alphabet jump + **directory rows** + pager, or invitations table → one shared invite/edit modal). `UserDetail.dc.html` — Profile-pattern full page for one user (96px AvatarTile, ProfileFields: Role / Region / Job Title / E-mail / Account Status pill, Developments list via `DevelopmentItem`, Reset password + Edit user header buttons, the same edit modal).
**App:** RSC wrapper (`getUsersData()` → `currentUser`) → `AdminUsersPage.tsx` (client; header, Invite button, message state, refresh ref) → `UsersTable.tsx` (fetch `/api/admin/users?page&limit&sortBy&sortOrder&search`, submit-only search, Name/Email sortable, 8-column shadcn table, local pager block, edit-only row action) → `InviteUserDialog` (POST `/api/admin/invite-user`; fields incl. **Temporary Password (required), Region, sendInvite checkbox**) → `EditUserDialog` (PATCH `/api/users/[id]` — note the non-admin path; role select locked for non-admins, Region/Job Title/Status admin-only, Switch with green/red label) → four badge components.

## Do the two templates overlap?

**Only in the edit modal — otherwise they are different surfaces.** UserManagement is the list; UserDetail is a single-record Profile page. Both embed the *same* edit modal verbatim (identical title, seafoam subtitle, fields, Toggle-with-status-dot, helper copy, "Save changes"). That shared modal is what AUDIT §5.2 maps to `EditUserDialog`. UserDetail's page content — big avatar, ProfileField stack, status pill, **Developments list** (≈ the user's assigned sites; the data exists via `sites.userId` but no users API returns it), Reset password button — has **no app counterpart** (there is no `/admin/users/[id]` route). So: convert `EditUserDialog` from the shared modal spec; treat UserDetail's page shell as an unbuilt surface (route creation is a step-10-class decision, recorded in B, not a visual pass).

## Badge → design-system treatment mapping (four components, kept separate)

| Component | Value | DS treatment (from the templates) | Today (false signals in bold) |
|---|---|---|---|
| `RoleBadge` | `admin` | Solid `--surface-chrome`, white, 12.5px bold, `Lock` 12 icon, `--radius-control`; display label "Administrator" | **`destructive`** — admin reads as an error |
| | `user` | `--bch-blue-50` bg, `--bch-blue-700` text, `--bch-blue-100` border, `User` icon; label "Staff user" | `default` |
| | `partner` | `--bch-gray-100` bg, `--text-muted` text, `--border-default` border, `Users` icon; label "Partner" | `secondary` |
| `StatusBadge` | active | Success pill (UserDetail): `Check` 12 icon, uppercase 12px bold, 999px radius; tokens: `text-(--success)` on `bg-[var(--bch-green-50,#EDF6EF)]` — the template's `#e8f5eb/#1c7430/#bfe0c8` have no exact tokens; border is the one gap (nearest: borderless, or 1px `--success`) — decide at visual pass, per the no-invented-tokens rule | `default` (solid dark) |
| | inactive | `--bch-gray-100` bg, `--text-muted`, `--border-default` border, `User` icon, label "Deactivated" (template copy; app says "Inactive" — copy choice) | `secondary` |
| `RegionBadge` | all four | **One neutral treatment for every region** — the templates give regions no chip at all (UserDetail renders Region as plain ProfileField text). Nearest list treatment: the neutral `--surface-muted` pill, text varying only | **LMDM/VIR/Interior/Northern → default/secondary/outline/destructive** — Northern reads as danger |
| `JobTitleBadge` | all | **Not a chip.** The directory row shows the job title as plain 14.5px `--text-muted` text. Render as muted text; the TEW/PPH/TSW/HSM short codes may be kept for column width (visual-pass call — full titles per template if the directory layout is adopted) | **variant rainbow; HSM → destructive** |

Invitation-status chips (template's invites tab: pending = `--warning-surface`/`--warning-text` + `Clock` + `#e8dca6` border; expired = `--bch-red-50`/`--danger` + `TriangleAlert` + `--bch-red-100` border) have no app counterpart yet — vocabulary recorded for when invitations exist.

## A. Visual differences — same data, different presentation

| Element | Template | App today |
|---|---|---|
| Wrapper/header | 30px h1 "User management" + workspace subtitle, DS primary "Invite user" | Double-padded wrapper, `text-3xl`, default Button |
| **List presentation** | **Staff-directory rows, not a dense table**: `56px` square `AvatarTile` (radius forced to 0), name as link → user-detail, role chip, muted job title, email link, icon actions; zebra + hover `--action-selected` with an inset 4px `--action-primary` left bar | Plain shadcn 8-column table (Name, Email, Role, Job Title, Region, Status, Created, Actions) |
| Row fields | No Region, no Created, no Status column (status lives on user-detail; deactivation visible only there) | Region/Status/Created columns shown — displayed data; keeping them means adding them into the directory row (muted meta) or dropping (visual choice to confirm) |
| Row actions | `PenLine` + `Lock` (reset password) icon links, action-blue | Single outline Edit button |
| Search/filters | Live search "Search by name or email" + **three selects** (Role / Job title / Status) + right-aligned "N accounts" | Submit-only search only |
| Sort | None visible (directory is alphabetical with a jump strip) | Name/Email sortable — keep (behavior) |
| Pager | Simple Previous/1/2/Next footer with range label | Local ~150-line block | 
| Edit modal | Teal chrome, seafoam subtitle, 560px, footer `border-t`; First/Last/Email/Role/Job title + Account status Toggle with an 8px status dot (filled `--bch-green-500` / hollow gray) + "Deactivated users cannot sign in…" | shadcn Dialog; same fields **plus Region** (admin-only) and the role-lock note; Switch with `text-green-600`/`text-red-600` labels |
| Invite modal | Same modal as edit minus status; no password, no region, no send toggle (true invitation flow) | Extra **Temporary Password (required)**, Region, `sendInvite` checkbox — app behavior kept; the DS chrome applies, the fields stay |
| Messages/loading/skeleton | — | Hand-tinted green Alert, "Loading...", raw-gray pulse (h-16/h-96 variant) |

## B. New UI with no data behind it

| Element | Needs | Detail |
|---|---|---|
| Stats row (Total / Active / Administrators / Pending invitations) | **API field** ×3, **feature** ×1 | Aggregates not in the list response; "Pending invitations" needs an invitations store that doesn't exist. §15 top-border tiles (chrome / `--bch-green-500` / `--bch-seafoam` / `--bch-gold-500`); count-style stub pattern per supply-distributions |
| Pending-invitations tab + table | **feature (DB + API)** | No invitations table/endpoints; the app's invite flow creates accounts directly with a temp password. The whole tab (expiry note, Resend/Copy link/Revoke, status chips) is future work — recommend omitting the tab bar entirely until a second tab exists |
| Role / Job title / Status filter selects | **API field** | `/api/admin/users` accepts only `search`; the three filters need query params |
| Alphabet jump strip | **client state** — flagged | Conflicts with server-side pagination (a letter may live on another page); wiring it properly needs an API param (`startsWith`) or full client data. Render only if stubbed; better recorded than stubbed |
| Name → user-detail link | **route** | No `/admin/users/[id]`; UserDetail page (incl. Developments ≈ assigned sites — queryable but not exposed) is an unbuilt surface; step-10-class decision |
| Reset-password row action | **feature** | No admin-triggered reset flow (self-serve `/reset-password/[token]` exists); disabled + TODO if rendered |
| Developments list (user-detail) | **API field + route** | `sites.userId` data exists; no endpoint returns a user's sites; `ui/development-item` is already ported |

## What the canonical admin-CRUD shape doesn't cover — flags

1. **§16 Directory-row list**: this section's list is *not* the dense teal table — the DS specifies people as directory rows (56px square avatar, name link, chip, muted title, email link, icon actions; zebra + hover with inset 4px `--action-primary` bar). The ported `ui/staff-row` component is the likely base — check its API at visual-pass time before hand-rolling.
2. **Tab bar attached to the card** (active tab merges into the card, `--surface-chrome` text; inactive = action-blue with `--action-selected` hover): new pattern, but moot until the invitations feature exists — a one-tab bar is noise; omit until then.
3. **Search + selects combined** in one filter strip (§5 already covers each separately).
4. **Toggle + status-dot** treatment in modals (8px filled `--bch-green-500` dot / hollow gray, `--success` label text) — replaces the raw green/red Switch labels.
5. §15 stats row — already specced; reused here.

Behavior invariants: both fetch paths (`/api/admin/users`, PATCH `/api/users/[id]`, POST `/api/admin/invite-user`), the invite form's password/region/sendInvite fields, role-lock for non-admins, admin-only field visibility, sort/search/pager plumbing, and the `currentUser` RSC pass-through.
