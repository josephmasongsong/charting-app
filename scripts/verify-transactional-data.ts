// scripts/verify-transactional-data.ts
//
// Checks seeded transactional data against the rules the database and the API
// actually enforce, by querying what landed rather than trusting what the
// seeder reported. Every INVARIANT query is written so a real defect makes the
// count non-zero — if the seeder broke, these go red.
//
// Usage:
//   npx tsx --env-file=.env scripts/verify-transactional-data.ts
import { db } from '../src/db';
import { sql } from 'drizzle-orm';
async function q(l: string, s: string) {
  const r = await db.execute(sql.raw(s));
  console.log(`--- ${l}`);
  console.table(r.rows);
}
/** Window the seeder was asked to cover; keep in sync with the seed script. */
const START = '2025-09-01';
const END = '2026-09-11';

async function main() {
  await q(
    'counts',
    `SELECT
    (SELECT count(*) FROM events)::int events,
    (SELECT count(*) FROM referrals)::int referrals,
    (SELECT count(*) FROM supply_distributions)::int dists,
    (SELECT count(*) FROM supply_distribution_items)::int items,
    (SELECT count(*) FROM site_supplies)::int site_supplies,
    (SELECT count(*) FROM activity_feed)::int feed`
  );

  await q(
    'INVARIANT: co-host without partner (want 0)',
    `SELECT count(*)::int bad FROM events WHERE has_co_host AND community_partner_id IS NULL`
  );
  await q(
    'INVARIANT: youth event at seniors-only site (want 0)',
    `SELECT count(*)::int bad FROM events e JOIN sites s ON s.id=e.site_id WHERE e.event_is_youth_focused AND s.is_single_senior_only`
  );
  await q(
    'INVARIANT: negative inventory (want 0)',
    `SELECT count(*)::int bad FROM site_supplies WHERE quantity < 0`
  );
  await q(
    'INVARIANT: dist total != sum of its line items (want 0)',
    `SELECT count(*)::int bad FROM (
       SELECT d.id FROM supply_distributions d JOIN supply_distribution_items i ON i.distribution_id=d.id
       GROUP BY d.id, d.total_cost HAVING abs(sum(i.line_total) - d.total_cost) > 0.005) x`
  );
  await q(
    'INVARIANT: distribution dated apart from its linked event (want 0)',
    `SELECT count(*)::int bad FROM supply_distributions d JOIN events e ON e.id=d.event_id
     WHERE d.distribution_date <> e.event_date OR d.site_id <> e.site_id`
  );
  await q(
    'INVARIANT: records with no feed entry (want 0,0,0)',
    `SELECT
      (SELECT count(*) FROM events e WHERE NOT EXISTS (SELECT 1 FROM activity_feed f WHERE f.target_id=e.id))::int ev,
      (SELECT count(*) FROM referrals r WHERE NOT EXISTS (SELECT 1 FROM activity_feed f WHERE f.target_id=r.id))::int ref,
      (SELECT count(*) FROM supply_distributions d WHERE NOT EXISTS (SELECT 1 FROM activity_feed f WHERE f.target_id=d.id))::int dist`
  );
  await q(
    'INVARIANT: dates outside window (want 0)',
    `SELECT (SELECT count(*) FROM events WHERE event_date < '${START}' OR event_date > '${END}')::int ev,
            (SELECT count(*) FROM referrals WHERE referral_date < '${START}' OR referral_date > '${END}')::int ref,
            (SELECT count(*) FROM supply_distributions WHERE distribution_date < '${START}' OR distribution_date > '${END}')::int dist`
  );
  await q(
    'INVARIANT: event author is the site TEW or PPH (want 0 bad)',
    `SELECT count(*)::int bad FROM events e JOIN sites s ON s.id=e.site_id
     WHERE e.user_id <> s.tew_id AND (s.pph_id IS NULL OR e.user_id <> s.pph_id)`
  );

  await q(
    'events by program goal',
    `SELECT pg.name goal, count(*)::int n, sum(e.new_participants+e.returning_participants)::int people
     FROM events e JOIN activity_types at ON at.id=e.activity_type_id JOIN program_goals pg ON pg.id=at.program_goal_id
     GROUP BY pg.name ORDER BY n DESC`
  );
  await q(
    'distributions by type',
    `SELECT distribution_type, count(*)::int n, sum(total_cost)::numeric(12,2) value FROM supply_distributions GROUP BY 1 ORDER BY n DESC`
  );
  await q(
    'referrals by channel/target',
    `SELECT channel, referred_to, count(*)::int n FROM referrals GROUP BY 1,2 ORDER BY n DESC LIMIT 6`
  );
  await q(
    'feed by type',
    `SELECT activity_type, count(*)::int n, min(created_at)::date first, max(created_at)::date last FROM activity_feed GROUP BY 1 ORDER BY n DESC`
  );
  await q(
    'workload by worker',
    `SELECT u.first_name||' '||u.last_name w, count(*)::int events FROM events e JOIN users u ON u.id=e.user_id GROUP BY 1 ORDER BY 2 DESC`
  );
  await q(
    'seasonal check: cooling supplies only in summer',
    `SELECT to_char(d.distribution_date,'YYYY-MM') mon, count(*)::int n FROM supply_distributions d
     JOIN supply_distribution_items i ON i.distribution_id=d.id JOIN supplies s ON s.id=i.supply_id
     WHERE s.name IN ('Cooling Kit','Cooling Towel') GROUP BY 1 ORDER BY 1`
  );
  process.exit(0);
}
main().catch(e => {
  console.error(e.message);
  process.exit(1);
});
