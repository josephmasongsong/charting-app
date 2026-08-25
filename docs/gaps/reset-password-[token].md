# /reset-password/[token] vs `reset-password`

**Template:** `design-system/templates/reset-password/ResetPassword.dc.html` — same shell as `sign-in` (action-blue field, 480px white card, logo + "BC HOUSING" wordmark) with an "Reset your password" heading, optional danger alert, optional green "If an account exists for that address, a reset link is on its way." box, **one email field**, a "Send reset link" button and a "Back to sign in" link.
**App:** `/reset-password/[token]` → `src/app/reset-password/[token]/page.tsx` (client page; `use(params)` for the token; `POST /api/reset-password/[token]` with `{ password }`; local password/confirm validation; 3-second `router.push('/login')` on success). The request step is a different route: `/forgot-password` → `src/app/forgot-password/page.tsx` (`POST /api/reset-password` with `{ email }`).
**Data sources:** `users.reset_token` / `users.reset_token_expiry` (written by `POST /api/reset-password`, 1-hour expiry, emailed via Resend), checked and cleared by `POST /api/reset-password/[token]` (`and(eq(resetToken, token), gt(resetTokenExpiry, now))`). Both routes are public in `middleware.ts`; `ClientAuthGuard` also treats `/reset-password` as public and, unlike `/login`, does not bounce a signed-in user away from it.

## Which step the template covers

**The request-a-link step only.** The markup has a single `type="email"` input (`autoComplete="username"`, placeholder "Enter your email"), the submit reads "Send reset link", and the confirmation copy is about a link being sent. There is no password field, no confirm field, no token, and no "password updated" state. The mock's `onSubmit` just flips `sent`. So:

- The template is a 1:1 for **`/forgot-password`**, not for `/reset-password/[token]`.
- `docs/AUDIT.md` §5.1 maps `reset-password` → `/reset-password/[token]` and §5.4 says to extrapolate `/forgot-password` from it; that is backwards. `/forgot-password` is the direct conversion; **`/reset-password/[token]` has no template** and should be extrapolated from this one (same shell, two password fields, different button and confirmation copy).

Both comparisons are given below because the shell is shared. Section A/B for the token page is against the template's shell plus the form grammar it establishes; the fields themselves are the app's and stay.

## A. Visual differences — same data, different presentation

### A.1 `/reset-password/[token]` (the route named; template supplies the shell only)

| Region of page | Template | App today | Notes |
|---|---|---|---|
| Page field | Full-viewport `--action-primary`, `padding:48px 24px`, card centred. | `flex min-h-screen items-center justify-center p-4` on the neutral `bg-background` `<main>`. Root-layout footer renders underneath. | Same layout-level footer caveat as `docs/gaps/login.md`. |
| Card | 480px, `--surface-card`, `--radius-card`, `padding:40px 48px 44px`, no border/shadow. | shadcn `Card w-full max-w-md` (448px) with `CardHeader` / `CardContent`, border and `shadow-sm`. | |
| Brand block | `logo.png` 34px + 24px/700 teal "BC HOUSING", centred. | None — the token page has no logo at all (the `/forgot-password` page has the 40px `logo.jpg`). | Use `BrandMark` as on `/login`. |
| Heading | `<h1>` "Reset your password", 20px/700, `--surface-chrome`, `margin-top:28px`, centred. No description line. | `CardTitle` "Set new password" (`text-2xl font-bold text-center`) + `CardDescription` "Enter your new password below". | Copy is the app's (this is the set-password step); size/colour/spacing follow the template. Template drops the description sentence. |
| Error alert | `--danger-surface`, 5px `--danger` left bar, `12px 14px`, 14px, no icon, `margin-top:24px`, **above the form** (after the heading). | `Alert variant="destructive"` with `XCircle`, rendered inside the `space-y-4` block above the form. | Same `error` strings ("Passwords do not match", "Password must be at least 8 characters long", API `data.message`, "An error occurred. Please try again later."). |
| Success alert | Green box: `var(--bch-green-50, #EDF6EF)` fill, 5px `--success` left bar, same padding/size, **shown above the form which stays visible**. | `Alert className="border-green-200 bg-green-50"` + `CheckCircle text-green-600` + `text-green-800` — three raw palette classes — and it **replaces** the form (`success ? <Alert> : <form>`). | Note `--bch-green-50` is not defined in `src/styles/tokens/colors.css`; the template relies on the `#EDF6EF` fallback. There is no success-surface token (see `docs/TOKEN_MAP.md`). Whether the form should stay visible after success is a behaviour question — today it disappears and the page redirects after 3 s; keep that. |
| Labels / field gap | 14.5px/600 label, `gap:6px` to the input, `gap:24px` between fields, form `margin-top:28px`. | shadcn `Label` (`text-sm font-medium`), `space-y-2` / `space-y-4`. | Two fields here vs the template's one; same grammar. |
| Inputs | DS `Input` (40px, `--radius-input`, `--border-input`, 15px), `autoComplete="username"`. | shadcn `Input` with `required`, `disabled={isLoading}`, `minLength={8}`, no `autoComplete`. | For this step the hints would be `autoComplete="new-password"` on both fields (cosmetic). |
| Submit | Full width, 15.5px/400, `11px 18px`, `--action-primary` / hover, `--radius-control`, label "Send reset link". | `Button className="w-full"` default variant, "Reset Password" / "Processing..." while `isLoading`. | Label stays the app's; style follows `/login`'s converted button. |
| Back link | "Back to sign in", 14.5px action-blue, centred, `margin-top:24px`, outside the form. | **None** on the token page. | See B. |
| Loading state | None. | Button label "Processing..." + `disabled` inputs. | Kept. |

### A.2 `/forgot-password` (the template's real counterpart — recorded here so the mapping is not lost)

| Region of page | Template | App today | Notes |
|---|---|---|---|
| Heading | "Reset your password" (20px teal h1), no description. | `CardTitle` "Reset your password" + `CardDescription` "Enter your email address and we'll send you a reset link". | Same words; template drops the description. |
| Field | "Email address" label, placeholder "Enter your email", `autoComplete="username"`. | Identical label and placeholder; no `autoComplete`. | |
| Submit | "Send reset link". | "Send reset link" / "Sending..." while `isLoading`. | Identical label. |
| Confirmation | Green left-bar box above the form; **form stays visible**. Copy: "If an account exists for that address, a reset link is on its way." | Hand-rolled `p-4 bg-blue-50 border border-blue-200 rounded-md` box with `text-blue-800` that **replaces** the form, plus an outline "Back to Login" button. Copy: "If an account with that email exists, we've sent a password reset link." | Four raw palette classes. The same box is also used for the two failure messages ("Something went wrong…", "An error occurred…"), which the template would show in the red alert instead. |
| Back link | "Back to sign in" link below the form. | "Back to login" `text-muted-foreground` link inside the form (pre-submit) or the outline button (post-submit). | Same target `/login`. |
| Brand block | Logo + wordmark. | 40px `logo.jpg`, no wordmark. | |

## B. New UI with no data behind it

| Element (template label/binding) | What it shows | App has? | Needs | Detail |
|---|---|---|---|---|
| `{{ alertMessage }}` / `{{ hasAlert }}` on the token page, shown **on load** | An "expired or invalid link" message before the user types anything. | No. The page renders the form unconditionally; validity is only learned after submit, when `POST /api/reset-password/[token]` finds no row matching `reset_token` + unexpired `reset_token_expiry` and returns `success: false` with its message. | **API field** | The columns exist (`users.reset_token`, `users.reset_token_expiry`) but `src/app/api/reset-password/[token]/route.ts` exports only `POST`. A pre-flight check needs a `GET` (or a server-component lookup) that reports validity without consuming the token. Until then the slot can only carry submit-time errors, which the page already does. |
| `{{ alertMessage }}` on `/forgot-password` | Failure message in the red alert. | Partly — failures exist (`'Something went wrong. Please try again.'`, `'An error occurred. Please try again later.'`) but are pushed into the same `message` state as the success copy and rendered in the blue box. | **client state** | Split `message` into success vs error so the two template boxes can be used. No new data. |
| `{{ sent }}` green box with the form still visible | Post-submit confirmation that keeps the email field on screen. | Partly — `/forgot-password` has the `message` state but hides the form; the token page has `success` and hides the form too. | **client state** | Rendering choice only; both states already exist. |
| "Back to sign in" link (`../sign-in/SignIn.dc.html`) | Link to `/login`. | `/forgot-password`: yes. `/reset-password/[token]`: **no link of any kind** — the only way out is the 3-second redirect after success or the browser back button. | **cosmetic** | Add a `Link href="/login"` under the form; no data. |
| "BC HOUSING" wordmark + `logo.png` | Brand lock-up. | Token page: nothing. `/forgot-password`: logo only. | **cosmetic** | `BrandMark` already exists in `src/components/ui/`. |
| `autoComplete` hints | `username` on the email field; by extension `new-password` on the two password fields. | No. | **cosmetic** | Attributes only. |
| Full-bleed `--action-primary` background | Brand-blue field. | No. | **cosmetic** | Same layout-footer caveat as `/login`. |
| Success surface colour `var(--bch-green-50, #EDF6EF)` | Green tint behind the confirmation. | The app uses Tailwind `bg-green-50` (`#f0fdf4`). | **cosmetic** — but **no token exists**: `--bch-green-50` is referenced by the template and by the DS `ActivityFeed` with a fallback, yet is not declared in `tokens/colors.css`. | Per the rules ("if no token fits, stop and report it"), this needs a decision before the visual pass: add `--bch-green-50: #EDF6EF` to the tokens (a values change you have said not to make) or use the fallback hex in the component. |

Mock-only: the template's `showConfirmation` editor prop and its `onSubmit` (flips `sent`, calls nothing) have no app equivalent; the app's `fetch` calls, `minLength={8}` / match validation, `isLoading` labels and the 3-second redirect are all behaviour that stays.
