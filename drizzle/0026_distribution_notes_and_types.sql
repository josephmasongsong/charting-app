-- Renames the community_room_pickup type to tenant_request and drops the
-- mandatory recipient_notes column (the optional `notes` column stays).
--
-- distribution_type is varchar with no database enum, so the rename is a plain
-- UPDATE and no constraint has to move. The table held 0 rows when this was
-- written, so both statements are no-ops here; they are correct against any
-- environment that does have rows.
--
-- emergency_distribution is deliberately NOT remapped: the option is gone from
-- the picker, but any historical row keeps its value and still renders through
-- distributionTypeLabel()'s retired-label table.
UPDATE "supply_distributions" SET "distribution_type" = 'tenant_request' WHERE "distribution_type" = 'community_room_pickup';
--> statement-breakpoint
ALTER TABLE "supply_distributions" DROP COLUMN "recipient_notes";
