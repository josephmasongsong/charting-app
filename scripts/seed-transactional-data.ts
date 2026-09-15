// scripts/seed-transactional-data.ts
//
// Seeds a year of plausible transactional history — site inventory, events,
// referrals, supply distributions (+ their line items) and the matching
// activity feed — on top of the reference data already in the database
// (users, sites, supplies, activity types, program goals, community partners).
//
// Reference data is READ, never written. Every foreign key is resolved from
// what is actually in the database, so this script has no hardcoded UUIDs.
//
// Usage:
//   npx tsx --env-file=.env scripts/seed-transactional-data.ts        # dry run, prints the plan
//   npx tsx --env-file=.env scripts/seed-transactional-data.ts --yes  # write
//
// Assumes the transactional tables are empty — run
// scripts/reset-transactional-data.ts --yes first. The script refuses to run
// against non-empty tables unless --force is passed.
import {
  db,
  sites,
  users,
  supplies,
  siteSupplies,
  events,
  referrals,
  supplyDistributions,
  supplyDistributionItems,
  activityTypes,
} from '../src/db';
import { activityFeed } from '../src/db/schema/activity-feed.schema';
import { sql } from 'drizzle-orm';

// ---------------------------------------------------------------- config

/** Inclusive window the history spans. */
const START = '2025-09-01';
const END = '2026-09-11';

/** Fixed seed — the same invocation always produces the same history. */
const RNG_SEED = 20260911;

// ---------------------------------------------------------------- rng

/** mulberry32 — small, deterministic, good enough for seed data. */
function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = makeRng(RNG_SEED);

const rand = () => rng();
/** Integer in [min, max]. */
const randInt = (min: number, max: number) =>
  Math.floor(rand() * (max - min + 1)) + min;
const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)];
/** True with probability p. */
const chance = (p: number) => rand() < p;
/** Pick by weight; weights need not sum to 1. */
function weightedPick<T>(entries: Array<[T, number]>): T {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [value, w] of entries) {
    r -= w;
    if (r <= 0) return value;
  }
  return entries[entries.length - 1][0];
}

// ---------------------------------------------------------------- dates

const DAY_MS = 86400000;
const toIso = (d: Date) => d.toISOString().slice(0, 10);
const fromIso = (s: string) => new Date(`${s}T00:00:00.000Z`);

/** Every calendar month touched by [START, END], as {year, month} (1-based). */
function monthsInWindow(): Array<{ year: number; month: number }> {
  const out: Array<{ year: number; month: number }> = [];
  const start = fromIso(START);
  const end = fromIso(END);
  const cursor = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1)
  );
  while (cursor <= end) {
    out.push({
      year: cursor.getUTCFullYear(),
      month: cursor.getUTCMonth() + 1,
    });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return out;
}

/** The part of a calendar month that falls inside [START, END], as 0..1. */
function monthCoverage(year: number, month: number): number {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lo = Math.max(Date.UTC(year, month - 1, 1), fromIso(START).getTime());
  const hi = Math.min(Date.UTC(year, month, 0), fromIso(END).getTime());
  if (lo > hi) return 0;
  return (Math.round((hi - lo) / DAY_MS) + 1) / daysInMonth;
}

/**
 * A weekday inside the given month, clamped to the window. Returns null when
 * the month has no usable day (i.e. the tail month past END). Days are drawn
 * uniformly from the eligible weekdays rather than resampled, so a truncated
 * month does not pile its events onto the last day.
 */
function weekdayInMonth(year: number, month: number): string | null {
  const lo = Math.max(Date.UTC(year, month - 1, 1), fromIso(START).getTime());
  const hi = Math.min(Date.UTC(year, month, 0), fromIso(END).getTime());
  if (lo > hi) return null;

  const weekdays: number[] = [];
  for (let t = lo; t <= hi; t += DAY_MS) {
    const dow = new Date(t).getUTCDay();
    if (dow !== 0 && dow !== 6) weekdays.push(t);
  }
  if (!weekdays.length) return toIso(new Date(lo));
  return toIso(new Date(pick(weekdays)));
}

/**
 * Programming volume is not flat across the year: it thins out over the
 * holidays and through the January lull, and thickens in the summer when
 * outdoor and heat-season activity picks up.
 */
function seasonalVolume(month: number): number {
  switch (month) {
    case 12:
      return 0.8;
    case 1:
      return 0.85;
    case 2:
      return 0.95;
    case 7:
    case 8:
      return 1.2;
    case 6:
      return 1.1;
    default:
      return 1;
  }
}

/**
 * When the record was entered: same day or within a few days, at a plausible
 * working hour, never past END.
 */
function loggedAt(dateIso: string): Date {
  const base = fromIso(dateIso).getTime();
  const lagDays = weightedPick<number>([
    [0, 6],
    [1, 3],
    [2, 1],
    [3, 1],
  ]);
  const ts =
    base +
    lagDays * DAY_MS +
    (9 + randInt(0, 8)) * 3600000 +
    randInt(0, 59) * 60000 +
    randInt(0, 59) * 1000;
  const cap = fromIso(END).getTime() + 17 * 3600000;
  return new Date(Math.min(ts, cap));
}

// ---------------------------------------------------------------- domain shape

/**
 * How likely each activity type is in a given month. Extreme-heat and smoke
 * programming is summer-only; the rest run year round with mild seasonality.
 * Keys are activity type names as they exist in the database — an activity
 * type with no entry here falls back to BASE_WEIGHT.
 */
const BASE_WEIGHT = 4;
const SEASONAL: Record<string, (month: number) => number> = {
  'Summer BBQ': m => (m >= 6 && m <= 8 ? 14 : 0),
  'Cooling Kit Distribution': m => (m >= 6 && m <= 8 ? 16 : m === 5 ? 5 : 0),
  'Extreme Heat Programming': m => (m >= 6 && m <= 8 ? 12 : m === 5 ? 3 : 0),
  'Wildfire Smoke Presentation': m => (m >= 7 && m <= 9 ? 9 : 0),
  'DIY Air Purifier Workshop': m => (m >= 5 && m <= 8 ? 8 : 1),
  'Garden Visit': m => (m >= 4 && m <= 9 ? 10 : 0),
  'Walking Club': m => (m >= 3 && m <= 10 ? 8 : 2),
  'Movie Matinée': m => (m >= 10 || m <= 3 ? 9 : 3),
  'Board Games': m => (m >= 10 || m <= 3 ? 8 : 3),
  'Community Kitchen': m => (m >= 10 || m <= 4 ? 9 : 4),
  'Emergency Preparedness Presentation': () => 5,
  'Fire Safety Presentation': () => 4,
  'Crime Stoppers Presentation': () => 3,
  'Seniors First BC Presentation': () => 3,
  'Mobile Library': () => 5,
  'Birthday Month Celebration': () => 7,
  Bingo: () => 11,
  Coffee: () => 12,
  'Arts & Crafts': () => 9,
  'Chair Yoga': () => 7,
  'Community Pantry': () => 8,
  'Meet & Greet': () => 6,
  'Office Drop-In Hours': () => 10,
  Survey: () => 2,
};

/** Title variants per activity type; the type name itself is always an option. */
const TITLES: Record<string, string[]> = {
  Bingo: ['Bingo', 'Afternoon Bingo', 'Bingo & Snacks'],
  Coffee: ['Coffee', 'Coffee & Connect', 'Morning Coffee Drop-In'],
  'Arts & Crafts': ['Arts & Crafts', 'Craft Afternoon', 'Card Making'],
  'Chair Yoga': ['Chair Yoga', 'Gentle Chair Yoga'],
  'Community Kitchen': ['Community Kitchen', 'Soup & Bannock', 'Shared Lunch'],
  'Community Pantry': ['Community Pantry', 'Pantry Restock Day'],
  'Movie Matinée': ['Movie Matinée', 'Afternoon Movie'],
  'Board Games': ['Board Games', 'Games Afternoon', 'Cribbage & Cards'],
  'Summer BBQ': ['Summer BBQ', 'Tenant Appreciation BBQ', 'Block Party BBQ'],
  'Walking Club': ['Walking Club', 'Neighbourhood Walk'],
  'Garden Visit': ['Garden Visit', 'Garden Work Party', 'Planter Build'],
  'Birthday Month Celebration': ['Birthday Month Celebration', 'Birthday Tea'],
  'Meet & Greet': ['Meet & Greet', 'New Tenant Meet & Greet'],
  'Office Drop-In Hours': ['Office Drop-In Hours', 'Drop-In Hours'],
  'Cooling Kit Distribution': [
    'Cooling Kit Distribution',
    'Heat Season Kit Handout',
  ],
  'Extreme Heat Programming': ['Extreme Heat Programming', 'Cool Room Drop-In'],
  'DIY Air Purifier Workshop': [
    'DIY Air Purifier Workshop',
    'Build-a-Purifier Workshop',
  ],
};

/** Typical spend band per activity type, in dollars. */
const COST_BAND: Record<string, [number, number]> = {
  'Summer BBQ': [180, 520],
  'Community Kitchen': [70, 190],
  'Birthday Month Celebration': [45, 140],
  Bingo: [25, 80],
  Coffee: [12, 45],
  'Arts & Crafts': [35, 120],
  'Board Games': [0, 40],
  'Movie Matinée': [20, 70],
  'Community Pantry': [90, 260],
  'Chair Yoga': [0, 60],
  'Walking Club': [0, 30],
  'Garden Visit': [40, 180],
  'Meet & Greet': [20, 90],
  'Cooling Kit Distribution': [0, 0],
  'Extreme Heat Programming': [0, 60],
  'DIY Air Purifier Workshop': [60, 240],
};
const PRESENTATION_COST: [number, number] = [0, 35];

const SUCCESSES = [
  'Strong turnout, several tenants attending for the first time.',
  'Tenants asked for this to become a monthly standing activity.',
  'Two tenants volunteered to help set up and run the next session.',
  'Good mix of long-term and newly housed tenants.',
  'Quiet but meaningful — a few in-depth conversations with isolated tenants.',
  'Community partner staff attended and connected with tenants directly.',
  'Attendance up noticeably from the last session at this site.',
  'Several tenants who normally stay in their units came down.',
  'Word of mouth from last month filled the room without extra postering.',
  'Great feedback on the food; tenants took leftovers home.',
];
const CHALLENGES = [
  'Community room was double-booked, started about 20 minutes late.',
  'Elevator out of service, limited attendance from upper floors.',
  'Low turnout — competing building event the same afternoon.',
  'Ran short on supplies partway through.',
  'Language barrier with a few tenants; need translated posters next time.',
  'Weather kept several tenants indoors.',
  'One tenant conflict required stepping away from the activity.',
  'Room was too small for the number who showed up.',
  'Short notice meant limited postering time.',
];

const DIST_NOTES = [
  'Door knocks on floors 1 through 4.',
  'Delivered to tenants who requested at the last drop-in.',
  'Handed out at the community room during the activity.',
  'Remaining stock from the heat season allocation.',
  'Follow-up delivery for tenants missed on the first pass.',
  'Requested directly by tenant at the office.',
  'Distributed alongside the building manager during a wellness check round.',
  null,
  null,
];

/** Which supplies a site keeps on hand, and opening stock per 100 tenants. */
const STOCK_PER_100: Record<string, [number, number]> = {
  'Cooling Kit': [40, 70],
  'Cooling Towel': [60, 110],
  'Water Bottle': [120, 220],
  Bandages: [80, 160],
  'Emergency Kit': [18, 35],
  'Grab And Go Kit': [12, 26],
  'HEPA Filter': [20, 45],
  'Box Fan': [8, 18],
  'Desk Fan': [8, 18],
  'Tower Fan': [4, 10],
  'Air Purifier': [2, 6],
  'Window Air Conditioner': [0, 2],
  'Portable Air Conditioner': [0, 1],
};

/** Supplies that plausibly move together, by distribution flavour. */
const DIST_BASKETS: Array<{ month: (m: number) => number; items: string[] }> = [
  {
    month: m => (m >= 6 && m <= 8 ? 20 : m === 5 ? 6 : 0),
    items: ['Cooling Kit', 'Cooling Towel', 'Water Bottle'],
  },
  {
    month: m => (m >= 6 && m <= 8 ? 12 : m === 5 ? 5 : 1),
    items: ['Box Fan', 'Desk Fan', 'Tower Fan'],
  },
  {
    month: m => (m >= 7 && m <= 9 ? 10 : 2),
    items: ['HEPA Filter', 'Air Purifier'],
  },
  { month: () => 7, items: ['Emergency Kit', 'Grab And Go Kit'] },
  { month: () => 6, items: ['Bandages', 'Water Bottle'] },
  {
    month: m => (m >= 6 && m <= 8 ? 4 : 0),
    items: ['Window Air Conditioner', 'Portable Air Conditioner'],
  },
];

const CHANNELS = ['in_person', 'phone_call', 'email'] as const;
const REFERRED_TO = [
  'building_site_staff',
  'tenant_support_worker',
  'third_party',
  'other',
] as const;

// ---------------------------------------------------------------- types

type SiteRow = {
  id: string;
  name: string;
  numberOfTenants: number;
  hasCommunityRoom: boolean;
  isSingleSeniorOnly: boolean;
  communityPartnerId: string | null;
  tewId: string;
  pphId: string | null;
};
type ActivityTypeRow = { id: string; name: string };
type SupplyRow = { id: string; name: string; costPerUnit: string };

type PendingEvent = typeof events.$inferInsert & { id: string };
type PendingReferral = typeof referrals.$inferInsert & { id: string };
type PendingDist = typeof supplyDistributions.$inferInsert & { id: string };
type PendingItem = typeof supplyDistributionItems.$inferInsert;
type PendingSiteSupply = typeof siteSupplies.$inferInsert;
type PendingFeed = typeof activityFeed.$inferInsert;

// ---------------------------------------------------------------- generation

async function loadReference() {
  const siteRows = (await db
    .select({
      id: sites.id,
      name: sites.name,
      numberOfTenants: sites.numberOfTenants,
      hasCommunityRoom: sites.hasCommunityRoom,
      isSingleSeniorOnly: sites.isSingleSeniorOnly,
      communityPartnerId: sites.communityPartnerId,
      tewId: sites.tewId,
      pphId: sites.pphId,
    })
    .from(sites)) as SiteRow[];

  const activityTypeRows = (await db
    .select({ id: activityTypes.id, name: activityTypes.name })
    .from(activityTypes)) as ActivityTypeRow[];

  const supplyRows = (await db
    .select({
      id: supplies.id,
      name: supplies.name,
      costPerUnit: supplies.costPerUnit,
    })
    .from(supplies)) as SupplyRow[];

  const userRows = await db
    .select({ id: users.id, firstName: users.firstName })
    .from(users);

  return { siteRows, activityTypeRows, supplyRows, userRows };
}

/** Who logs work at a site: the TEW, or the PPH for garden/plant activities. */
function actorFor(site: SiteRow, activityName: string): string {
  if (site.pphId && (activityName === 'Garden Visit' || chance(0.15))) {
    return site.pphId;
  }
  return site.tewId;
}

function eventTitle(activityName: string): string {
  const variants = TITLES[activityName];
  return variants ? pick(variants) : activityName;
}

function eventCost(activityName: string): number {
  const band =
    COST_BAND[activityName] ??
    (activityName.includes('Presentation') ? PRESENTATION_COST : [0, 60]);
  const [lo, hi] = band;
  if (hi === 0) return 0;
  return Math.round((lo + rand() * (hi - lo)) * 100) / 100;
}

async function run() {
  const write = process.argv.includes('--yes');
  const force = process.argv.includes('--force');

  const host = new URL(process.env.DATABASE_URL ?? '').hostname;
  console.log(`Target database host: ${host}`);
  console.log(`Window: ${START} .. ${END}  (rng seed ${RNG_SEED})\n`);

  // Refuse to stack a second year of history on top of an existing one.
  const existing = await db.execute(
    sql.raw(
      `SELECT
        (SELECT count(*) FROM events)::int AS events,
        (SELECT count(*) FROM referrals)::int AS referrals,
        (SELECT count(*) FROM supply_distributions)::int AS distributions,
        (SELECT count(*) FROM site_supplies)::int AS site_supplies,
        (SELECT count(*) FROM activity_feed)::int AS activity_feed`
    )
  );
  const before = existing.rows[0] as Record<string, number>;
  const dirty = Object.values(before).some(n => n > 0);
  if (dirty) {
    console.log('Existing transactional rows:');
    for (const [k, v] of Object.entries(before)) console.log(`  ${k}: ${v}`);
    if (!force) {
      console.error(
        '\nRefusing to seed on top of existing data.\n' +
          'Run scripts/reset-transactional-data.ts --yes first, or pass --force.'
      );
      process.exit(1);
    }
    console.log('\n--force given — seeding on top anyway.\n');
  }

  const { siteRows, activityTypeRows, supplyRows } = await loadReference();
  if (!siteRows.length || !activityTypeRows.length || !supplyRows.length) {
    console.error(
      'Reference data missing (sites / activity types / supplies). Seed those first.'
    );
    process.exit(1);
  }
  console.log(
    `Reference loaded: ${siteRows.length} sites, ${activityTypeRows.length} activity types, ${supplyRows.length} supplies\n`
  );

  const supplyByName = new Map(supplyRows.map(s => [s.name, s]));
  const months = monthsInWindow();

  const outEvents: PendingEvent[] = [];
  const outReferrals: PendingReferral[] = [];
  const outDists: PendingDist[] = [];
  const outItems: PendingItem[] = [];
  const outSiteSupplies: PendingSiteSupply[] = [];
  const outFeed: PendingFeed[] = [];

  // ---- opening inventory, stocked at the top of the window -------------
  // Tracked in memory so distributions can draw it down the way the API does.
  const stock = new Map<string, number>(); // `${siteId}:${supplyId}` -> qty
  const stockKey = (siteId: string, supplyId: string) =>
    `${siteId}:${supplyId}`;

  const stockDate = START;
  for (const site of siteRows) {
    const per100 = site.numberOfTenants / 100;
    const stocked: Array<{
      name: string;
      quantity: number;
      costPerUnit: string;
    }> = [];
    for (const [name, [lo, hi]] of Object.entries(STOCK_PER_100)) {
      const supply = supplyByName.get(name);
      if (!supply) continue;
      const qty = Math.round((lo + rand() * (hi - lo)) * per100);
      if (qty <= 0) continue;
      stock.set(stockKey(site.id, supply.id), qty);
      outSiteSupplies.push({
        siteId: site.id,
        supplyId: supply.id,
        quantity: qty,
        createdAt: loggedAt(stockDate),
        updatedAt: loggedAt(stockDate),
      });
      stocked.push({
        name: supply.name,
        quantity: qty,
        costPerUnit: supply.costPerUnit,
      });
    }
    if (stocked.length) {
      outFeed.push({
        activityType: 'supplies_added_to_site',
        actorId: site.tewId,
        targetType: 'site',
        targetId: site.id,
        metadata: {
          siteName: site.name,
          supplies: stocked,
          totalItems: stocked.length,
        },
        createdAt: loggedAt(stockDate),
      });
    }
  }

  // ---- events ----------------------------------------------------------
  for (const site of siteRows) {
    // Bigger sites and sites with a community room run more programming.
    const sizeFactor = Math.min(site.numberOfTenants / 100, 2.2);
    const roomFactor = site.hasCommunityRoom ? 1.35 : 0.55;

    for (const { year, month } of months) {
      const coverage = monthCoverage(year, month);
      if (coverage <= 0) continue;
      const expected =
        0.72 *
        roomFactor *
        (0.6 + sizeFactor * 0.55) *
        seasonalVolume(month) *
        coverage;
      let count = Math.floor(expected);
      if (chance(expected - count)) count += 1;

      for (let i = 0; i < count; i++) {
        const dateIso = weekdayInMonth(year, month);
        if (!dateIso) continue;

        const weights = activityTypeRows
          .map(at => {
            const fn = SEASONAL[at.name];
            const w = fn ? fn(month) : BASE_WEIGHT;
            return [at, w] as [ActivityTypeRow, number];
          })
          .filter(([, w]) => w > 0);
        if (!weights.length) continue;
        const activity = weightedPick(weights);

        const actorId = actorFor(site, activity.name);

        // Co-host is only meaningful where the site has a partner on file —
        // the API rejects hasCoHost without a communityPartnerId.
        const hasCoHost = Boolean(site.communityPartnerId) && chance(0.45);
        const communityPartnerId = hasCoHost ? site.communityPartnerId : null;

        // Attendance scales with building size, capped at something a room holds.
        const reach = Math.max(
          4,
          Math.round(site.numberOfTenants * (0.05 + rand() * 0.13))
        );
        const total = Math.min(reach, site.hasCommunityRoom ? 60 : 25);
        const newParticipants = Math.round(total * (0.1 + rand() * 0.35));
        const returningParticipants = Math.max(0, total - newParticipants);

        const eventDuration = weightedPick<number>([
          [60, 4],
          [90, 5],
          [120, 5],
          [150, 2],
          [180, 2],
          [240, 1],
        ]);
        const adminDuration = weightedPick<number>([
          [15, 2],
          [30, 5],
          [45, 3],
          [60, 3],
          [90, 1],
          [120, 1],
        ]);

        const cost = eventCost(activity.name);
        // TAG money goes to the bigger social spends, not to presentations.
        const usedTenantActivityGrant = cost >= 80 && chance(0.28);

        const id = crypto.randomUUID();
        const createdAt = loggedAt(dateIso);

        outEvents.push({
          id,
          title: eventTitle(activity.name),
          eventDate: dateIso,
          successes: chance(0.72) ? pick(SUCCESSES) : null,
          challenges: chance(0.38) ? pick(CHALLENGES) : null,
          eventDuration,
          adminDuration,
          newParticipants,
          returningParticipants,
          // A seniors-only building has no youth programming.
          eventIsYouthFocused: site.isSingleSeniorOnly ? false : chance(0.12),
          hasCoHost,
          usedTenantActivityGrant,
          communityPartnerId,
          totalCost: cost.toFixed(2),
          activityTypeId: activity.id,
          siteId: site.id,
          userId: actorId,
          createdAt,
          updatedAt: createdAt,
        });

        outFeed.push({
          activityType: 'event_created',
          actorId,
          targetType: 'event',
          targetId: id,
          metadata: {
            eventTitle: outEvents[outEvents.length - 1].title,
            siteName: site.name,
            totalParticipants: newParticipants + returningParticipants,
            isYouthFocused:
              outEvents[outEvents.length - 1].eventIsYouthFocused ?? false,
            hasCoHost,
          },
          createdAt,
        });
      }
    }
  }

  // ---- referrals -------------------------------------------------------
  for (const site of siteRows) {
    for (const { year, month } of months) {
      const coverage = monthCoverage(year, month);
      if (coverage <= 0) continue;
      const expected =
        (0.12 + Math.min(site.numberOfTenants / 100, 2.5) * 0.2) * coverage;
      let count = Math.floor(expected);
      if (chance(expected - count)) count += 1;

      for (let i = 0; i < count; i++) {
        const dateIso = weekdayInMonth(year, month);
        if (!dateIso) continue;
        const id = crypto.randomUUID();
        const createdAt = loggedAt(dateIso);
        const channel = weightedPick<(typeof CHANNELS)[number]>([
          ['in_person', 6],
          ['phone_call', 3],
          ['email', 2],
        ]);
        const referredTo = weightedPick<(typeof REFERRED_TO)[number]>([
          ['building_site_staff', 5],
          ['tenant_support_worker', 4],
          ['third_party', 2],
          ['other', 1],
        ]);
        const actorId = site.pphId && chance(0.12) ? site.pphId : site.tewId;

        outReferrals.push({
          id,
          siteId: site.id,
          userId: actorId,
          referralDate: dateIso,
          channel,
          referredTo,
          createdAt,
          updatedAt: createdAt,
        });

        outFeed.push({
          activityType: 'referral_logged',
          actorId,
          targetType: 'referral',
          targetId: id,
          metadata: {
            siteName: site.name,
            channel,
            referredTo,
            referralDate: dateIso,
          },
          createdAt,
        });
      }
    }
  }

  // ---- supply distributions -------------------------------------------
  // Events are indexed by site+month so an event_distribution can attach to a
  // real event at the same site, dated the same day.
  const eventsBySiteMonth = new Map<string, PendingEvent[]>();
  for (const e of outEvents) {
    const key = `${e.siteId}:${String(e.eventDate).slice(0, 7)}`;
    const list = eventsBySiteMonth.get(key);
    if (list) list.push(e);
    else eventsBySiteMonth.set(key, [e]);
  }

  for (const site of siteRows) {
    for (const { year, month } of months) {
      const coverage = monthCoverage(year, month);
      if (coverage <= 0) continue;
      const seasonal = month >= 6 && month <= 8 ? 1.9 : month === 5 ? 1.2 : 0.7;
      const expected =
        0.24 *
        seasonal *
        (0.7 + Math.min(site.numberOfTenants / 100, 2.2)) *
        coverage;
      let count = Math.floor(expected);
      if (chance(expected - count)) count += 1;

      for (let i = 0; i < count; i++) {
        const baskets = DIST_BASKETS.map(
          b => [b, b.month(month)] as [(typeof DIST_BASKETS)[number], number]
        ).filter(([, w]) => w > 0);
        if (!baskets.length) continue;
        const basket = weightedPick(baskets);

        // Only supplies this site actually has stock for can go out.
        const candidates = basket.items
          .map(name => supplyByName.get(name))
          .filter((s): s is SupplyRow => Boolean(s))
          .filter(s => (stock.get(stockKey(site.id, s.id)) ?? 0) > 0);
        if (!candidates.length) continue;

        const lineCount = Math.min(candidates.length, randInt(1, 3));
        const chosen: SupplyRow[] = [];
        const pool = [...candidates];
        for (let k = 0; k < lineCount && pool.length; k++) {
          chosen.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
        }

        const distributionType = weightedPick<string>([
          ['door_to_door', 5],
          ['tenant_request', 4],
          ['event_distribution', 2],
        ]);

        let dateIso: string | null;
        let eventId: string | null = null;

        if (distributionType === 'event_distribution') {
          const key = `${site.id}:${year}-${String(month).padStart(2, '0')}`;
          const candidatesEvents = eventsBySiteMonth.get(key);
          if (candidatesEvents?.length) {
            const ev = pick(candidatesEvents);
            eventId = ev.id;
            dateIso = String(ev.eventDate);
          } else {
            dateIso = weekdayInMonth(year, month);
          }
        } else {
          dateIso = weekdayInMonth(year, month);
        }
        if (!dateIso) continue;

        const id = crypto.randomUUID();
        const createdAt = loggedAt(dateIso);
        let totalCost = 0;
        const logged: Array<{
          supplyName: string;
          quantity: number;
          unitCostAtTime: string;
          lineTotal: string;
        }> = [];

        for (const supply of chosen) {
          const key = stockKey(site.id, supply.id);
          const available = stock.get(key) ?? 0;
          if (available <= 0) continue;

          // Cheap consumables move in bulk; an air conditioner does not.
          const unitCost = parseFloat(supply.costPerUnit);
          const ceiling =
            unitCost >= 100 ? 1 : unitCost >= 20 ? 4 : unitCost >= 5 ? 14 : 45;
          const quantity = Math.max(
            1,
            Math.min(available, randInt(1, ceiling))
          );

          stock.set(key, available - quantity);

          const lineTotal = unitCost * quantity;
          totalCost += lineTotal;
          outItems.push({
            distributionId: id,
            supplyId: supply.id,
            quantityDistributed: quantity,
            unitCostAtTime: supply.costPerUnit,
            lineTotal: lineTotal.toFixed(2),
            createdAt,
          });
          logged.push({
            supplyName: supply.name,
            quantity,
            unitCostAtTime: supply.costPerUnit,
            lineTotal: lineTotal.toFixed(2),
          });
        }
        if (!logged.length) continue;

        const actorId = site.pphId && chance(0.1) ? site.pphId : site.tewId;

        outDists.push({
          id,
          eventId,
          siteId: site.id,
          userId: actorId,
          distributionDate: dateIso,
          distributionType,
          totalCost: totalCost.toFixed(2),
          notes:
            distributionType === 'event_distribution' && eventId
              ? 'Handed out at the community room during the activity.'
              : pick(DIST_NOTES),
          createdAt,
          updatedAt: createdAt,
        });

        outFeed.push({
          activityType: 'supply_distribution_logged',
          actorId,
          targetType: 'supply_distribution',
          targetId: id,
          metadata: {
            siteName: site.name,
            distributionType,
            totalCost,
            supplies: logged,
            totalItems: logged.length,
            totalQuantity: logged.reduce((s, l) => s + l.quantity, 0),
          },
          createdAt,
        });
      }
    }
  }

  // Inventory rows carry the post-drawdown quantity, matching what the API
  // would have left behind after every one of these distributions.
  for (const row of outSiteSupplies) {
    row.quantity = stock.get(stockKey(row.siteId, row.supplyId)) ?? 0;
  }

  // The feed is written in chronological order so ids and timestamps agree.
  outFeed.sort((a, b) => {
    const at = (a.createdAt as Date).getTime();
    const bt = (b.createdAt as Date).getTime();
    return at - bt;
  });

  // ---- self-check ------------------------------------------------------
  // Every one of these mirrors a constraint the database or the API enforces.
  // A generator bug should stop the run here, not surface as a failed INSERT
  // halfway through or as data the app would never have produced.
  const eventById = new Map(outEvents.map(e => [e.id, e]));
  const siteById = new Map(siteRows.map(s => [s.id, s]));
  const problems: string[] = [];

  const inWindow = (d: string) => d >= START && d <= END;

  for (const e of outEvents) {
    if (!inWindow(String(e.eventDate)))
      problems.push(`event ${e.id} dated ${e.eventDate} outside window`);
    if (e.hasCoHost && !e.communityPartnerId)
      problems.push(`event ${e.id} has co-host with no community partner`);
    if (!e.hasCoHost && e.communityPartnerId)
      problems.push(`event ${e.id} has a community partner but no co-host`);
    if (siteById.get(e.siteId!)?.isSingleSeniorOnly && e.eventIsYouthFocused)
      problems.push(`event ${e.id} is youth-focused at a seniors-only site`);
    if ((e.eventDuration ?? 0) < 1)
      problems.push(`event ${e.id} has a zero-length duration`);
    if (!/^\d+(\.\d{2})$/.test(String(e.totalCost)))
      problems.push(`event ${e.id} cost ${e.totalCost} is not a money string`);
  }

  for (const r of outReferrals) {
    if (!inWindow(String(r.referralDate)))
      problems.push(`referral ${r.id} dated ${r.referralDate} outside window`);
  }

  for (const d of outDists) {
    if (!inWindow(String(d.distributionDate)))
      problems.push(`distribution ${d.id} dated outside window`);
    if (d.eventId) {
      const ev = eventById.get(d.eventId);
      if (!ev) problems.push(`distribution ${d.id} references a missing event`);
      else {
        if (ev.siteId !== d.siteId)
          problems.push(
            `distribution ${d.id} is at a different site than its event`
          );
        if (String(ev.eventDate) !== String(d.distributionDate))
          problems.push(`distribution ${d.id} is dated apart from its event`);
      }
    }
  }

  // Line items must reconcile to the distribution total, the way the API
  // computes it from cost_per_unit at the time of distribution.
  const itemsByDist = new Map<string, PendingItem[]>();
  for (const it of outItems) {
    const list = itemsByDist.get(it.distributionId!);
    if (list) list.push(it);
    else itemsByDist.set(it.distributionId!, [it]);
  }
  for (const d of outDists) {
    const items = itemsByDist.get(d.id) ?? [];
    if (!items.length) {
      problems.push(`distribution ${d.id} has no line items`);
      continue;
    }
    const sum = items.reduce(
      (s, it) => s + parseFloat(String(it.lineTotal)),
      0
    );
    if (Math.abs(sum - parseFloat(String(d.totalCost))) > 0.005)
      problems.push(
        `distribution ${d.id} total ${d.totalCost} != line sum ${sum.toFixed(2)}`
      );
    for (const it of items) {
      if ((it.quantityDistributed ?? 0) <= 0)
        problems.push(`distribution ${d.id} has a non-positive quantity`);
    }
  }

  // The check constraint on site_supplies.quantity forbids negatives, so the
  // drawdown must never have over-distributed.
  for (const row of outSiteSupplies) {
    if ((row.quantity ?? 0) < 0)
      problems.push(
        `site_supplies ${row.siteId}/${row.supplyId} went negative`
      );
  }

  // Every transactional record should have produced exactly one feed entry.
  const feedTargets = new Set(outFeed.map(f => f.targetId));
  for (const e of outEvents)
    if (!feedTargets.has(e.id))
      problems.push(`event ${e.id} has no feed entry`);
  for (const r of outReferrals)
    if (!feedTargets.has(r.id))
      problems.push(`referral ${r.id} has no feed entry`);
  for (const d of outDists)
    if (!feedTargets.has(d.id))
      problems.push(`distribution ${d.id} has no feed entry`);
  const expectedFeed =
    outEvents.length +
    outReferrals.length +
    outDists.length +
    new Set(outSiteSupplies.map(r => r.siteId)).size;
  if (outFeed.length !== expectedFeed)
    problems.push(`feed has ${outFeed.length} rows, expected ${expectedFeed}`);

  if (problems.length) {
    console.error(`\nSelf-check FAILED (${problems.length} problems):`);
    for (const p of problems.slice(0, 25)) console.error(`  ${p}`);
    if (problems.length > 25)
      console.error(`  ...and ${problems.length - 25} more`);
    process.exit(1);
  }
  console.log('Self-check passed.\n');

  // ---- report ----------------------------------------------------------
  console.log('Planned rows:');
  console.log(`  site_supplies:             ${outSiteSupplies.length}`);
  console.log(`  events:                    ${outEvents.length}`);
  console.log(`  referrals:                 ${outReferrals.length}`);
  console.log(`  supply_distributions:      ${outDists.length}`);
  console.log(`  supply_distribution_items: ${outItems.length}`);
  console.log(`  activity_feed:             ${outFeed.length}`);

  const byMonth = new Map<string, number>();
  for (const e of outEvents) {
    const k = String(e.eventDate).slice(0, 7);
    byMonth.set(k, (byMonth.get(k) ?? 0) + 1);
  }
  console.log('\nEvents per month:');
  for (const k of [...byMonth.keys()].sort()) {
    console.log(
      `  ${k}  ${'#'.repeat(Math.round(byMonth.get(k)! / 2))} ${byMonth.get(k)}`
    );
  }

  const participants = outEvents.reduce(
    (s, e) => s + (e.newParticipants ?? 0) + (e.returningParticipants ?? 0),
    0
  );
  const spend = outEvents.reduce(
    (s, e) => s + parseFloat(String(e.totalCost)),
    0
  );
  console.log(
    `\nTotals: ${participants} participants, $${spend.toFixed(2)} event spend, ` +
      `$${outDists.reduce((s, d) => s + parseFloat(String(d.totalCost)), 0).toFixed(2)} distributed supply value`
  );

  if (!write) {
    console.log('\nDry run — re-run with --yes to write.');
    process.exit(0);
  }

  // ---- write -----------------------------------------------------------
  const chunk = <T>(xs: T[], n: number): T[][] => {
    const out: T[][] = [];
    for (let i = 0; i < xs.length; i += n) out.push(xs.slice(i, i + n));
    return out;
  };

  console.log('\nWriting...');
  // Order matters: events before the distributions that reference them.
  for (const rows of chunk(outSiteSupplies, 300))
    await db.insert(siteSupplies).values(rows);
  console.log(`  site_supplies: ${outSiteSupplies.length}`);

  for (const rows of chunk(outEvents, 300))
    await db.insert(events).values(rows);
  console.log(`  events: ${outEvents.length}`);

  for (const rows of chunk(outReferrals, 300))
    await db.insert(referrals).values(rows);
  console.log(`  referrals: ${outReferrals.length}`);

  for (const rows of chunk(outDists, 300))
    await db.insert(supplyDistributions).values(rows);
  console.log(`  supply_distributions: ${outDists.length}`);

  for (const rows of chunk(outItems, 300))
    await db.insert(supplyDistributionItems).values(rows);
  console.log(`  supply_distribution_items: ${outItems.length}`);

  for (const rows of chunk(outFeed, 300))
    await db.insert(activityFeed).values(rows);
  console.log(`  activity_feed: ${outFeed.length}`);

  console.log('\nDone.');
  process.exit(0);
}

run().catch(e => {
  console.error('ERR', e);
  process.exit(1);
});
