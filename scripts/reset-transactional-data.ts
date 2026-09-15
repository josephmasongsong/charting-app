// scripts/reset-transactional-data.ts
//
// Purges transactional records (activity feed, distributions + their items,
// events, referrals, site inventory) while leaving reference data untouched
// (users, sites, supplies, activity types, program goals, community partners).
//
// NOTE: supplies.quantity (the global stock counter) is deliberately left
// as-is — revisit if a future reset should also zero global stock.
//
// Usage:
//   npx tsx --env-file=.env scripts/reset-transactional-data.ts        # dry run + backup
//   npx tsx --env-file=.env scripts/reset-transactional-data.ts --yes  # actually delete
import { mkdirSync, writeFileSync } from 'fs';
import {
  db,
  events,
  referrals,
  supplyDistributions,
  supplyDistributionItems,
  siteSupplies,
} from '../src/db';
import { activityFeed } from '../src/db/schema/activity-feed.schema';
import { sql } from 'drizzle-orm';

// Deletion order matters: supply_distributions references events (NO ACTION),
// so distributions go before events. Items would cascade off distributions but
// are deleted explicitly to keep the script self-documenting.
const PURGE_TABLES = [
  'activity_feed',
  'supply_distribution_items',
  'supply_distributions',
  'events',
  'referrals',
  'site_supplies',
];
const KEEP_TABLES = [
  'users',
  'sites',
  'supplies',
  'activity_types',
  'program_goals',
  'community_partners',
];

async function counts(): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const table of [...PURGE_TABLES, ...KEEP_TABLES]) {
    const r = await db.execute(sql.raw(`SELECT count(*)::int AS n FROM ${table}`));
    out[table] = Number((r.rows[0] as { n: number }).n);
  }
  return out;
}

async function main() {
  const host = new URL(process.env.DATABASE_URL ?? '').hostname;
  console.log(`Target database host: ${host}\n`);

  const before = await counts();
  console.log('Current row counts:');
  for (const [table, n] of Object.entries(before)) {
    const tag = PURGE_TABLES.includes(table) ? 'PURGE' : 'keep ';
    console.log(`  ${tag}  ${table}: ${n}`);
  }

  // Backup the purge tables before anything else.
  mkdirSync('backups', { recursive: true });
  const backup: Record<string, unknown[]> = {};
  for (const table of PURGE_TABLES) {
    const r = await db.execute(sql.raw(`SELECT * FROM ${table}`));
    backup[table] = r.rows;
  }
  const file = `backups/reset-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  writeFileSync(file, JSON.stringify(backup, null, 2));
  console.log(`\nBackup written: ${file}`);

  if (!process.argv.includes('--yes')) {
    console.log('\nDry run — re-run with --yes to delete.');
    process.exit(0);
  }

  await db.transaction(async tx => {
    await tx.delete(activityFeed);
    await tx.delete(supplyDistributionItems);
    await tx.delete(supplyDistributions);
    await tx.delete(events);
    await tx.delete(referrals);
    await tx.delete(siteSupplies);
  });

  const after = await counts();
  console.log('\nPost-delete counts:');
  let ok = true;
  for (const [table, n] of Object.entries(after)) {
    const expected = PURGE_TABLES.includes(table) ? 0 : before[table];
    const pass = n === expected;
    if (!pass) ok = false;
    console.log(
      `  ${pass ? 'OK  ' : 'FAIL'}  ${table}: ${n}${pass ? '' : ` (expected ${expected})`}`
    );
  }
  if (!ok) {
    console.error('\nWARNING: post-check mismatch — inspect before proceeding.');
    process.exit(1);
  }
  console.log('\nDone. Reference data untouched.');
  process.exit(0);
}

main().catch(e => {
  console.error('ERR', e.message);
  process.exit(1);
});
