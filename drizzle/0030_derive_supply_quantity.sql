-- Drops supplies.quantity. How many units a supply has is now derived as the
-- sum of its site_supplies rows, wherever it is shown.
--
-- The column was a denormalised rollup: created at 0, then incremented and
-- decremented by the site-stocking routes. Anything that moved stock without
-- adjusting it desynchronised it permanently, and several things did —
-- distributions decremented site_supplies only, and scripts/reset-transactional-data.ts
-- purges site_supplies while leaving this column untouched by design. At the
-- time of writing 6 of 13 supplies disagreed with their own site rows; five of
-- them held a non-zero total with no site rows at all (Cooling Kit read 530
-- units against 84 actually on site).
--
-- No backfill is needed precisely because nothing reads the stored value any
-- more — dropping it IS the correction, and the numbers become right by
-- construction rather than by being repaired.
DROP INDEX "supply_quantity_idx";--> statement-breakpoint
ALTER TABLE "supplies" DROP COLUMN "quantity";
