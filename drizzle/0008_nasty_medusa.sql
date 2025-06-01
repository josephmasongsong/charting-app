ALTER TABLE "events" ADD COLUMN "has_co_host" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "community_partner_id" uuid;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "total_cost" numeric(12, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_community_partner_id_community_partners_id_fk" FOREIGN KEY ("community_partner_id") REFERENCES "public"."community_partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "has_co_sponsor";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "amount";