# BC Housing Design System — Next.js + shadcn/ui Implementation Guide

This guide implements the BC Housing component library as a shadcn/ui theme. Tokens were sampled directly from production screenshots (Feedback Forms, PartnerHub, Branch Planning, Staff Directory, Power BI dashboards).

The core rule of the system: **teal is identity, blue is action.** Teal (`#006265`) is reserved for chrome — headers, footers, modal title bars, table headers, KPI cards. Every interactive element — buttons, links, tabs, selection states — uses the blue family (`#0073CE`).

---

## 1. Token reference

> **Correction (v2):** earlier samples of the PartnerHub chrome (`#003032` nav / `#014035` sidebar) were taken from screenshots dimmed by an open modal's backdrop. Undimmed screenshots show the true surfaces: top nav `#006265`, sidebar `#00866E`, submenu insets `#006265`. `teal-950 #003032` is retained as a pressed/hover shade.

| Token | Hex | Where it appears |
|---|---|---|
| `teal-950` | `#003032` | Pressed/hover dark shade (teal buttons) |
| `teal-700` **(primary)** | `#006265` | App headers, footers, modal headers, table headers, KPI cards, sidebar submenu insets |
| `teal-600` | `#00866E` | **Sidebar surface**, quick-start card, green "Create" button, development tiles |
| `teal-500` | `#338185` | KPI card tint variant |
| `seafoam` | `#41C6A5` | Chart series 1 (Regular) |
| `sky-400` | `#60BDFF` | Chart series 2 (Short Term) |
| `green-500` | `#16A660` | Progress bar — complete segment |
| `gold-400` | `#FAC747` | Progress bar — in-progress segment |
| `gold-600` | `#E9A800` | Escalation stat accent, IN PROGRESS status text |
| `red-600` | `#E70000` | Remove buttons, urgent stat accent |
| `blue-700` | `#005EA8` | Button hover |
| `blue-600` **(secondary/action)** | `#0073CE` | Buttons, links, avatar tiles, internal app headers |
| `blue-100` | `#BDD2ED` | Disabled primary button |
| `blue-50` | `#E2F6FF` | Selected row / highlight |
| `tab-blue` | `#2B5CE6` | Active wizard tab |
| `red-700` | `#BA0F17` | Destructive text, required `*`, alert accent bar |
| `red-100` | `#FFE3E5` | Destructive alert surface |
| `red-50` | `#FAF0F1` | Validation summary surface |
| `yellow-50` / `yellow-800` | `#FCF6DE` / `#856404` | Warning banner |
| `tan-50` / `tan-700` | `#FDF8E7` / `#8A7A3B` | Empty-state banner |
| `green-600` | `#28A745` | Success, completed stepper steps |
| `gold-500` | `#E9B949` | Current/locked stepper step |
| `ink` | `#212529` | Body text |
| `gray-100` / `gray-50` | `#F5F5F5` / `#FAFAFA` | Page surface / zebra rows |
| `gray-300` | `#DEE2E6` | Borders |

**Type:** Segoe UI stack (matches the .NET/Fluent heritage of the apps).
**Radius:** 4px buttons/tabs, 2px inputs, 6px cards/modals, 3px avatar tiles.
**Spacing:** 4px base scale — 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64. Panels pad at 24px; section gaps at 48px.

---

## 2. Project setup

```bash
npx create-next-app@latest bch-app --typescript --tailwind --eslint --app
cd bch-app
npx shadcn@latest init
```

When prompted by `shadcn init`, choose the **Default** style, **Neutral** base color, and CSS variables **yes**. Then add the components used below:

```bash
npx shadcn@latest add button input label radio-group checkbox select textarea dialog alert tabs table card avatar separator
```

---

## 3. `app/globals.css` — theme variables

Replace the generated `:root` / `.dark` blocks with the BC Housing mapping. shadcn v4-style (Tailwind v4, `@theme inline`) shown first; an HSL variant for Tailwind v3 follows.

### Tailwind v4 (shadcn 2025+)

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  /* shadcn semantic tokens → BC Housing values */
  --background: #f5f5f5;              /* gray-100 page surface */
  --foreground: #212529;              /* ink */
  --card: #ffffff;
  --card-foreground: #212529;
  --popover: #ffffff;
  --popover-foreground: #212529;

  /* PRIMARY = action blue (buttons, links) */
  --primary: #0073ce;
  --primary-foreground: #ffffff;

  /* SECONDARY = brand teal (chrome, emphasis surfaces) */
  --secondary: #006265;
  --secondary-foreground: #ffffff;

  --muted: #fafafa;
  --muted-foreground: #7e7e7e;
  --accent: #e2f6ff;                  /* blue-50 selection */
  --accent-foreground: #005ea8;
  --destructive: #ba0f17;
  --destructive-foreground: #ffffff;
  --border: #dee2e6;
  --input: #767676;                   /* BCH inputs use a dark 1px border */
  --ring: #2b5ce6;                    /* focus ring = tab blue */
  --radius: 0.25rem;                  /* 4px — BCH buttons/tabs */

  /* BC Housing extended palette */
  --bch-teal-950: #003032;
  --bch-teal-700: #006265;
  --bch-teal-600: #00866e;   /* sidebar, quick-start card */
  --bch-teal-500: #338185;
  --bch-seafoam: #41c6a5;
  --bch-sky-400: #60bdff;
  --bch-green-500: #16a660;
  --bch-gold-400: #fac747;
  --bch-gold-600: #e9a800;
  --bch-red-600: #e70000;
  --bch-blue-700: #005ea8;
  --bch-blue-100: #bdd2ed;
  --bch-tab-blue: #2b5ce6;
  --bch-red-100: #ffe3e5;
  --bch-red-50: #faf0f1;
  --bch-yellow-50: #fcf6de;
  --bch-yellow-800: #856404;
  --bch-tan-50: #fdf8e7;
  --bch-tan-700: #8a7a3b;
  --bch-green-600: #28a745;
  --bch-gold-500: #e9b949;

  /* Charts (Power BI dashboard series, in priority order) */
  --chart-1: #41c6a5;   /* seafoam — always the first series */
  --chart-2: #60bdff;   /* sky — second series (e.g. Short Term) */
  --chart-3: #006265;   /* teal-700 — donut dominant segment */
  --chart-4: #7fd1c0;   /* light teal */
  --chart-5: #0073ce;   /* action blue — targets/reference lines */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 2px);
  --radius-md: var(--radius);
  --radius-lg: calc(var(--radius) + 2px);

  /* Expose BCH tokens as Tailwind utilities: bg-bch-teal-700, text-bch-red-700, etc. */
  --color-bch-teal-950: var(--bch-teal-950);
  --color-bch-teal-700: var(--bch-teal-700);
  --color-bch-teal-600: var(--bch-teal-600);
  --color-bch-teal-500: var(--bch-teal-500);
  --color-bch-seafoam: var(--bch-seafoam);
  --color-bch-sky-400: var(--bch-sky-400);
  --color-bch-green-500: var(--bch-green-500);
  --color-bch-gold-400: var(--bch-gold-400);
  --color-bch-gold-600: var(--bch-gold-600);
  --color-bch-red-600: var(--bch-red-600);
  --color-bch-blue-700: var(--bch-blue-700);
  --color-bch-blue-100: var(--bch-blue-100);
  --color-bch-tab-blue: var(--bch-tab-blue);
  --color-bch-red-100: var(--bch-red-100);
  --color-bch-red-50: var(--bch-red-50);
  --color-bch-yellow-50: var(--bch-yellow-50);
  --color-bch-yellow-800: var(--bch-yellow-800);
  --color-bch-tan-50: var(--bch-tan-50);
  --color-bch-tan-700: var(--bch-tan-700);
  --color-bch-green-600: var(--bch-green-600);
  --color-bch-gold-500: var(--bch-gold-500);
}

body {
  font-family: "Segoe UI", -apple-system, BlinkMacSystemFont,
    "Helvetica Neue", Arial, sans-serif;
}
```

### Tailwind v3 variant (HSL)

If your shadcn install uses HSL variables, use these conversions:

```css
:root {
  --background: 0 0% 96%;          /* #F5F5F5 */
  --foreground: 210 11% 15%;       /* #212529 */
  --primary: 207 100% 40%;         /* #0073CE */
  --primary-foreground: 0 0% 100%;
  --secondary: 182 100% 20%;       /* #006265 */
  --secondary-foreground: 0 0% 100%;
  --muted: 0 0% 98%;
  --muted-foreground: 0 0% 49%;
  --accent: 198 100% 94%;          /* #E2F6FF */
  --accent-foreground: 208 100% 33%;
  --destructive: 357 85% 39%;      /* #BA0F17 */
  --destructive-foreground: 0 0% 100%;
  --border: 210 14% 89%;           /* #DEE2E6 */
  --input: 0 0% 46%;               /* #767676 */
  --ring: 226 78% 54%;             /* #2B5CE6 */
  --radius: 0.25rem;
}
```

And extend `tailwind.config.ts`:

```ts
extend: {
  colors: {
    bch: {
      "teal-950": "#003032",
      "teal-700": "#006265",
      "teal-600": "#00866E",
      "teal-500": "#338185",
      seafoam: "#41C6A5",
      "sky-400": "#60BDFF",
      "green-500": "#16A660",
      "gold-400": "#FAC747",
      "gold-600": "#E9A800",
      "red-600": "#E70000",
      "blue-700": "#005EA8",
      "blue-100": "#BDD2ED",
      "tab-blue": "#2B5CE6",
      "red-100": "#FFE3E5",
      "red-50": "#FAF0F1",
      "yellow-50": "#FCF6DE",
      "yellow-800": "#856404",
      "tan-50": "#FDF8E7",
      "tan-700": "#8A7A3B",
      "green-600": "#28A745",
      "gold-500": "#E9B949",
    },
  },
  fontFamily: {
    sans: ['"Segoe UI"', "system-ui", "sans-serif"],
  },
}
```

> **Font note:** Segoe UI ships with Windows only. For consistent rendering on Mac/Linux, self-host [Selawik](https://github.com/microsoft/Selawik) (Microsoft's open-source Segoe UI metric-compatible font) via `next/font/local` and put it first in the stack.

---

## 4. Component recipes

### 4.1 Button — `components/ui/button.tsx`

Extend the generated variants. BCH buttons are 4px radius, normal weight, `8px 18px` padding.

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded font-normal text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bch-tab-blue disabled:pointer-events-none disabled:bg-bch-blue-100 disabled:text-white",
  {
    variants: {
      variant: {
        // Primary action — blue (Next, Submit, Proceed, Add files)
        default: "bg-primary text-primary-foreground hover:bg-bch-blue-700",
        // Secondary action — outline blue (Previous, Cancel)
        outline:
          "border border-primary bg-white text-primary hover:bg-accent",
        // Brand emphasis — teal (View my Operational Review)
        teal: "bg-bch-teal-700 text-white hover:bg-bch-teal-950",
        // Soft — light blue (New folder)
        soft: "bg-[#6FC7E8] text-white hover:bg-[#58B8DD]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-[#98060D]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-[18px] py-2",
        sm: "h-8 px-3 text-sm",
        lg: "h-11 px-6",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);
```

Usage:

```tsx
<Button>Next</Button>
<Button variant="outline">Previous</Button>
<Button variant="teal">View my Operational Review</Button>
```

### 4.2 Required-field label

BCH marks required fields with a red asterisk after the label text.

```tsx
// components/bch/required-label.tsx
import { Label } from "@/components/ui/label";

export function RequiredLabel({
  children,
  required,
  htmlFor,
}: {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <Label htmlFor={htmlFor} className="text-[15px] font-normal">
      {children}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </Label>
  );
}
```

Inputs use a near-square 2px radius and the dark `#767676` border:

```tsx
<Input className="rounded-[2px] border-[#767676] text-[15px]" placeholder="Label" />
```

### 4.3 Wizard tabs (multi-part forms)

The Feedback Forms wizard: completed parts get a white background + checkmark, the active part is solid `tab-blue`, future parts sit on the gray strip.

```tsx
// components/bch/wizard-tabs.tsx
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Part = { label: string; state: "complete" | "active" | "upcoming" };

export function WizardTabs({ parts }: { parts: Part[] }) {
  return (
    <div className="flex overflow-x-auto rounded-t border border-border bg-background">
      {parts.map((p) => (
        <button
          key={p.label}
          role="tab"
          aria-selected={p.state === "active"}
          className={cn(
            "flex items-center gap-2 whitespace-nowrap border-r border-border px-6 py-3.5 text-[15px]",
            p.state === "complete" && "bg-white font-semibold",
            p.state === "active" && "bg-bch-tab-blue text-white"
          )}
        >
          {p.label}
          {p.state === "complete" && <Check className="h-4 w-4" strokeWidth={3} />}
        </button>
      ))}
    </div>
  );
}
```

Pair with a panel: `className="rounded-b border border-t-0 border-border bg-white p-6"` and a 24px-bold panel title with a bottom hairline.

### 4.4 Dialog with teal header

BCH modals put the title on a solid teal bar with a white close glyph; body copy is centered for confirmations; footer buttons are centered.

```tsx
<DialogContent className="overflow-hidden rounded-md p-0 sm:max-w-[560px]">
  <DialogHeader className="flex-row items-center justify-between bg-bch-teal-700 px-6 py-4 text-white">
    <DialogTitle className="text-[21px] font-bold text-white">
      Confirmation for Final Appeal
    </DialogTitle>
    {/* shadcn's built-in close button: restyle to text-white */}
  </DialogHeader>
  <div className="space-y-4 px-6 py-6 text-center text-[15px]">
    <p>
      By selecting confirm below, the <b>level of your Appeal</b> will update
      from <b>Formal</b> to <b>Final</b>.
    </p>
    <p>
      You are required to upload a completed Final Appeal letter from the
      template on the following screen should you proceed.
    </p>
  </div>
  <DialogFooter className="justify-center gap-3 px-6 pb-6 sm:justify-center">
    <Button variant="outline">Cancel</Button>
    <Button>Proceed</Button>
  </DialogFooter>
</DialogContent>
```

In the generated `dialog.tsx`, remove the default `DialogHeader` padding/text styles or override them as above, and change the close icon class to `text-white opacity-90`.

### 4.5 Alert variants

Add BCH variants to `components/ui/alert.tsx`:

```tsx
const alertVariants = cva("w-full rounded px-6 py-4 text-[15px]", {
  variants: {
    variant: {
      // Page-top validation summary (form errors)
      validation: "bg-bch-red-50 [&_a]:text-primary [&_a]:underline",
      // Inline red-bar error (Upload Formal Appeal Letter)
      destructive:
        "rounded-sm border-l-[5px] border-destructive bg-bch-red-100 text-destructive",
      // Yellow overdue/warning banner (PartnerHub)
      warning: "bg-bch-yellow-50 text-bch-yellow-800",
      // Pink notice (board member not assigned)
      notice: "bg-[#FBEAEA] [&_b]:text-destructive",
      // Empty state (no folders or files)
      empty: "border border-[#F0E6C8] bg-bch-tan-50 text-bch-tan-700",
    },
  },
  defaultVariants: { variant: "validation" },
});
```

The validation summary pattern (used across all form apps):

```tsx
<Alert variant="validation">
  <AlertTitle className="flex items-center gap-2.5 text-[21px] font-bold">
    <Info className="h-5 w-5" /> The form could not be submitted for the
    following reasons:
  </AlertTitle>
  <AlertDescription className="mt-2">
    <a href="#purpose">What is your purpose in filling in this form? is a required field.</a>
  </AlertDescription>
</Alert>
```

### 4.6 Progress stepper (Branch Planning)

There's no shadcn stepper; this custom component matches the three-state circle design: green = complete/active, gold = current/locked, dashed connector = pending.

```tsx
// components/bch/stepper.tsx
import { cn } from "@/lib/utils";

type Step = {
  label: string;
  icon: React.ReactNode;
  state: "done" | "current" | "pending";
};

export function Stepper({ steps }: { steps: Step[] }) {
  return (
    <div className="flex items-start justify-center py-6">
      {steps.map((s, i) => (
        <div key={s.label} className="contents">
          {i > 0 && (
            <div
              className={cn(
                "mt-8 w-[90px] border-t-[2.5px]",
                steps[i - 1].state === "done" && s.state !== "pending"
                  ? "border-bch-green-600"
                  : "border-dashed border-[#BFBFBF]"
              )}
            />
          )}
          <div className="flex w-[150px] flex-col items-center gap-2.5">
            <div
              className={cn(
                "grid h-16 w-16 place-items-center rounded-full border-[2.5px] bg-white text-2xl",
                s.state === "done" && "border-bch-green-600 text-bch-green-600",
                s.state === "current" && "border-bch-gold-500 text-bch-gold-500",
                s.state === "pending" && "border-border text-muted-foreground"
              )}
            >
              {s.icon}
            </div>
            <span
              className={cn(
                "text-[12.5px] font-bold underline",
                s.state === "done" && "text-bch-green-600",
                s.state === "current" && "text-bch-gold-500",
                s.state === "pending" && "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 4.7 Data table (Power BI / PartnerHub style)

Teal header row, zebra body, mint total row:

```tsx
<Table className="text-sm">
  <TableHeader>
    <TableRow className="hover:bg-transparent">
      <TableHead className="border border-[#0A7276] bg-bch-teal-700 font-bold text-white">
        Branch
      </TableHead>
      {/* ...repeat for numeric columns with className="text-right" */}
    </TableRow>
  </TableHeader>
  <TableBody className="[&_td]:border [&_td]:border-border [&_tr:nth-child(even)]:bg-muted">
    {/* rows */}
  </TableBody>
  <TableFooter className="[&_td]:border [&_td]:border-[#9CCFC6] [&_td]:bg-[#AEDBD3] [&_td]:font-bold">
    {/* total row */}
  </TableFooter>
</Table>
```

### 4.8 KPI card

```tsx
export function KpiCard({ value, label, tint }: { value: string; label: string; tint?: boolean }) {
  return (
    <div
      className={cn(
        "px-4 py-4 text-center text-white shadow-[0_2px_6px_rgba(0,0,0,.12)]",
        tint ? "bg-bch-teal-500" : "bg-bch-teal-700"
      )}
    >
      <div className="text-[34px] font-bold tracking-wide">{value}</div>
      <div className="mt-1 text-[11.5px] font-semibold uppercase tracking-wider">{label}</div>
    </div>
  );
}
```

### 4.9 App shell (header + footer)

```tsx
// Teal chrome for public forms; swap bg-bch-teal-700 → bg-primary for internal apps,
// bg-bch-teal-950 for PartnerHub.
export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-[62px] items-center justify-between bg-bch-teal-700 px-6 text-white">
      <div className="flex items-center gap-2.5 text-[17px] font-bold tracking-wide">
        <Image src="/bch-logo.svg" alt="" width={30} height={30} /> BC HOUSING
      </div>
      <nav className="flex gap-6 text-[15px] [&_a]:border-r [&_a]:border-white/35 [&_a]:pr-4 [&_a:last-child]:border-r-0">
        <a href="/">Home</a>
        <a href="/forms">Feedback Forms</a>
      </nav>
    </header>
  );
}

export function AppFooter() {
  return (
    <footer className="bg-bch-teal-700 py-6 text-center text-[14.5px] text-white">
      Copyright © {new Date().getFullYear()} <a className="underline" href="#">BC Housing</a>. All rights reserved.
    </footer>
  );
}
```

Selected rows anywhere (staff directory, lists) use: `bg-accent shadow-[inset_4px_0_0_theme(colors.primary.DEFAULT)]`. Avatar initial tiles: `h-14 w-14 rounded-[3px] bg-primary text-white grid place-items-center font-bold`.

### 4.10 Sidebar & dashboard layout (PartnerHub shell)

The shell is a teal-700 top nav plus a fixed 232px teal-600 sidebar; expandable groups render their children on a teal-700 inset panel with 4px radius. Active items get `bg-bch-teal-700 font-semibold`; hover is a 10% white wash. Content sits on `bg-muted`.

Use shadcn's `sidebar` block as the base (`npx shadcn@latest add sidebar`) and override its variables, or hand-roll:

```tsx
// app/(partnerhub)/layout.tsx
export default function PartnerHubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted">
      <TopNav /> {/* h-[52px] bg-bch-teal-700 text-white */}
      <div className="flex">
        <SideNav />
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

// components/bch/side-nav.tsx
const itemCls =
  "flex w-full items-center gap-2.5 px-4 py-[11px] text-left text-[14.5px] text-white hover:bg-white/10";

export function SideNav() {
  return (
    <nav className="w-[232px] shrink-0 bg-bch-teal-600 py-3 text-white max-md:hidden">
      <button className={itemCls}>
        <Newspaper size={17} /> Operational Review <ChevronDown size={13} className="ml-auto" />
      </button>
      {/* Submenu inset — returns to teal-700 */}
      <div className="mx-2.5 my-0.5 rounded bg-bch-teal-700 py-1.5">
        <button className={cn(itemCls, "pl-[34px] text-[13.5px]")}>Questionnaire</button>
        <button className={cn(itemCls, "bg-white/15 pl-[34px] text-[13.5px] font-semibold")}>
          Standards and Elements
        </button>
        {/* ... */}
      </div>
      <button className={itemCls}><Headset size={17} /> Support <ChevronRight size={13} className="ml-auto" /></button>
      <button className={itemCls}><TriangleAlert size={17} /> Escalation</button>
      <button className={itemCls}><Mail size={17} /> Mailbox</button>
      <button className={itemCls}><Users size={17} /> Manage Users</button>
    </nav>
  );
}
```

If you use the shadcn `Sidebar` component, map its CSS variables in `globals.css`:

```css
:root {
  --sidebar: #00866e;
  --sidebar-foreground: #ffffff;
  --sidebar-accent: #006265;            /* submenu inset + active */
  --sidebar-accent-foreground: #ffffff;
  --sidebar-border: rgba(255, 255, 255, 0.15);
  --sidebar-ring: #2b5ce6;
}
```

### 4.11 Charts

shadcn charts wrap **Recharts**, so install the chart block (`npx shadcn@latest add chart`) and drive series colors from the `--chart-*` variables. House style, matching the Power BI dashboards:

- Series order: seafoam `#41C6A5` first, sky `#60BDFF` second, then teal ramp. Reference/target lines in action blue, dashed.
- Gridlines `#E6E6E6`, horizontal only; no axis lines; no chart borders.
- Labels 10–12px; value labels at bar ends (`LabelList position="top"` / `"right"`).
- Donut charts: teal ramp dark→light (`#006265`, `#41C6A5`, `#7FD1C0`), 34% ring thickness, legend to the right with value + percent.

```tsx
// Shared config
const chartConfig = {
  regular: { label: "Regular", color: "var(--chart-1)" },
  shortTerm: { label: "Short Term", color: "var(--chart-2)" },
} satisfies ChartConfig;

// Vertical bars (FTE by Branch)
<ChartContainer config={chartConfig} className="h-[260px]">
  <BarChart data={byBranch}>
    <CartesianGrid vertical={false} stroke="#E6E6E6" />
    <XAxis dataKey="branch" tickLine={false} axisLine={false} fontSize={11} />
    <YAxis tickLine={false} axisLine={false} fontSize={10} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="regular" fill="var(--color-regular)">
      <LabelList position="top" fontSize={11} fontWeight={600} />
    </Bar>
    <Bar dataKey="shortTerm" fill="var(--color-shortTerm)" />
  </BarChart>
</ChartContainer>

// Horizontal bars: same, plus layout="vertical", swap the axes,
// and use <LabelList position="right" />.

// Donut (FTE by Union Code)
<PieChart>
  <Pie data={byUnion} dataKey="value" nameKey="union"
       innerRadius={46} outerRadius={80} startAngle={90} endAngle={-270}>
    {byUnion.map((_, i) => (
      <Cell key={i} fill={`var(--chart-${i + 3})`} /> // 3,4 → teal ramp
    ))}
  </Pie>
  <ChartLegend content={<ChartLegendContent />} />
</PieChart>

// Line (trend vs target)
<LineChart data={trend}>
  <CartesianGrid vertical={false} stroke="#E6E6E6" />
  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} />
  <Line dataKey="occupied" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 3.5 }} />
  <Line dataKey="target" stroke="var(--chart-5)" strokeWidth={2.5}
        strokeDasharray="5 4" dot={false} />
</LineChart>
```

### 4.12 Profile with developments

Same three-column grammar as the staff profile (photo · contact fields · related list), but the right column lists assigned developments instead of a reporting structure. Development tiles are teal-600 (portfolio identity); names remain action-blue links; status is a pill badge.

```tsx
// components/bch/development-item.tsx
export function DevelopmentItem({ dev }: { dev: Development }) {
  return (
    <div className="flex items-center gap-3 border-b py-2.5 last:border-b-0">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[3px] bg-bch-teal-600 text-white">
        <Home size={19} />
      </div>
      <div className="min-w-0">
        <a href={`/developments/${dev.id}`} className="text-[14.5px] font-bold text-primary">
          {dev.name}
        </a>
        <div className="truncate text-[12.5px] text-muted-foreground">
          {dev.address} · {dev.units} units
        </div>
      </div>
      <Badge
        className={cn(
          "ml-auto rounded-full text-[11.5px] font-semibold",
          dev.status === "Operational"
            ? "bg-[#DCF2EC] text-bch-teal-600"
            : "bg-[#FDF1D3] text-[#B07C0A]"
        )}
      >
        {dev.status}
      </Badge>
    </div>
  );
}

// Page layout
<div className="grid grid-cols-1 gap-8 rounded-b-md border border-t-0 bg-white p-8 md:grid-cols-[240px_1fr_1.1fr]">
  <div>{/* photo + name */}</div>
  <div>{/* Title / Department / Office / E-mail / Phone fields */}</div>
  <div>
    <h3 className="mb-3 text-[17px] font-bold">Developments ({devs.length})</h3>
    {devs.map((d) => <DevelopmentItem key={d.id} dev={d} />)}
  </div>
</div>
```

### 4.13 Quick-start card

Teal-600 card with a stacked list of white action chips — the PartnerHub "What would you like to do today?" pattern. Actions are full-width, white bg, teal-700 semibold text; hover to `accent` blue-50.

```tsx
export function QuickStartCard({ actions }: { actions: { label: string; href: string }[] }) {
  return (
    <div className="max-w-[300px] rounded-md bg-bch-teal-600 p-6 text-white shadow-[0_2px_6px_rgba(0,0,0,.12)]">
      <h4 className="mb-4 text-[19px] font-bold leading-tight">
        What would you like to do today?
      </h4>
      <div className="flex flex-col gap-2.5">
        {actions.map((a) => (
          <a key={a.label} href={a.href}
             className="rounded bg-white px-3.5 py-2 text-center text-sm font-semibold text-bch-teal-700 hover:bg-accent">
            {a.label}
          </a>
        ))}
      </div>
    </div>
  );
}
```

### 4.14 Segmented progress bar

Multi-state progress for Core Areas: green complete + gold in-progress on a gray track, 14px tall, fully rounded, with label row above (name left, % right) and a shared legend.

```tsx
type Segment = { value: number; state: "complete" | "inProgress" };
const SEG_COLOR = { complete: "bg-bch-green-500", inProgress: "bg-bch-gold-400" };

export function SegmentedProgress({ label, segments }: { label: string; segments: Segment[] }) {
  const done = segments.find((s) => s.state === "complete")?.value ?? 0;
  return (
    <div className="mb-4">
      <div className="mb-1.5 flex justify-between text-[13.5px]">
        <span className="font-semibold">{label}</span>
        <span className="text-muted-foreground">{done}% complete</span>
      </div>
      <div className="flex h-3.5 overflow-hidden rounded-full bg-bch-gray-200" role="progressbar"
           aria-valuenow={done} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        {segments.map((s, i) => (
          <div key={i} className={SEG_COLOR[s.state]} style={{ width: `${s.value}%` }} />
        ))}
      </div>
    </div>
  );
}
```

### 4.15 Stat cards (icon + metric)

Dashboard summary cards (Appeals / Escalations / Mailbox): white card, 4px colored left border, tinted icon circle, bold title + muted count. Color encodes urgency — red `#E70000` appeals, gold `#E9A800` escalations, blue `#0073CE` mailbox, teal `#00866E` neutral.

```tsx
const STAT_STYLES = {
  red:  { border: "border-l-bch-red-600",  icon: "bg-bch-red-100 text-bch-red-600" },
  gold: { border: "border-l-bch-gold-600", icon: "bg-[#FDF1D3] text-[#B07C0A]" },
  blue: { border: "border-l-primary",      icon: "bg-accent text-primary" },
  teal: { border: "border-l-bch-teal-600", icon: "bg-[#DCF2EC] text-bch-teal-600" },
} as const;

export function StatCard({ tone, icon, title, sub }: {
  tone: keyof typeof STAT_STYLES; icon: React.ReactNode; title: string; sub: string;
}) {
  const s = STAT_STYLES[tone];
  return (
    <div className={cn("flex items-center gap-3 rounded-md border border-l-4 bg-white p-4", s.border)}>
      <div className={cn("grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full", s.icon)}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-bold">{title}</div>
        <div className="text-[12.5px] text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}
```

### 4.16 Switch & listbox

The toggle on-state and listbox selection both use action blue. For shadcn's `Switch`: `data-[state=checked]:bg-primary`. There's no shadcn listbox; style a scrollable option list with `aria-selected` rows: selected = `bg-primary text-white`, others hover `bg-bch-gray-100`, container `rounded-[2px] border border-[#767676]`.

---

## 5. Usage rules (design QA checklist)

1. **Teal never on in-flow buttons.** If a button submits, navigates, or opens something inside a workflow, it's blue. Teal buttons are reserved for top-level entry CTAs (e.g., "View my Operational Review").
2. **Every required field** gets a `*` in `--destructive` after the label — never before, never bold.
3. **Validation is dual:** a page-top summary alert linking to each failed field, plus inline red-bar alerts where a specific artifact is missing.
4. **Wizard forms** keep completed tabs visible with a checkmark — users can navigate back to any completed part.
5. **Focus states** use the 2px `#2B5CE6` outline with 2px offset on buttons, inset on inputs.
6. **Zebra striping** on all data lists (`even:bg-muted`), selection with `bg-accent` + 4px inset primary bar.
7. **Spacing:** stay on the 4px scale; panels and cards pad 24px; page gutters 24px; 48px between page sections.
8. **Sidebar is navigation only.** Teal-600 chrome hosts nav items; any button that acts on content belongs in the blue family inside the content area.
9. **Charts:** seafoam first, sky second, teal ramp after; targets/reference lines are dashed action blue; gridlines `#E6E6E6` horizontal only; value labels at bar ends.
10. **Status colour is consistent everywhere:** green `#16A660` = complete, gold `#FAC747`/`#E9A800` = in progress, gray = not started, red `#E70000` = urgent/Remove. A colour never means two things on the same screen.

---

## 6. File map

```
app/
  globals.css              ← tokens (section 3)
  (partnerhub)/layout.tsx  ← sidebar shell (4.10)
components/
  ui/                      ← shadcn generated, with variant edits (4.1, 4.5, 4.16)
  bch/
    required-label.tsx     ← 4.2
    wizard-tabs.tsx        ← 4.3
    stepper.tsx            ← 4.6
    kpi-card.tsx           ← 4.8
    app-header.tsx         ← 4.9
    app-footer.tsx         ← 4.9
    side-nav.tsx           ← 4.10
    charts/                ← 4.11 (bar, donut, line wrappers)
    development-item.tsx   ← 4.12
    quick-start-card.tsx   ← 4.13
    segmented-progress.tsx ← 4.14
    stat-card.tsx          ← 4.15
```
