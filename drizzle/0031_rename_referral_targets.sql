-- Rename the stored referral targets to match the new taxonomy in
-- src/lib/referral-options.ts. referred_to is plain varchar with no DB enum, so
-- this is a data-only change. The activity feed keeps the value in its jsonb
-- metadata, so those rows are rewritten too.
UPDATE "referrals"
SET "referred_to" = CASE "referred_to"
  WHEN 'tenant_support_worker' THEN 'health_services'
  WHEN 'third_party' THEN 'third_party_provider'
END
WHERE "referred_to" IN ('tenant_support_worker', 'third_party');
--> statement-breakpoint
UPDATE "activity_feed"
SET "metadata" = jsonb_set(
  "metadata",
  '{referredTo}',
  to_jsonb(CASE "metadata"->>'referredTo'
    WHEN 'tenant_support_worker' THEN 'health_services'::text
    WHEN 'third_party' THEN 'third_party_provider'::text
  END)
)
WHERE "activity_type" IN ('referral_logged', 'referral_deleted')
  AND "metadata"->>'referredTo' IN ('tenant_support_worker', 'third_party');
