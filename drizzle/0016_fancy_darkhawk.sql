CREATE TABLE "site_supplies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"supply_id" uuid NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_supplies_unique_constraint" UNIQUE("site_id","supply_id"),
	CONSTRAINT "site_supplies_quantity_check" CHECK (quantity >= 0)
);
--> statement-breakpoint
ALTER TABLE "site_supplies" ADD CONSTRAINT "site_supplies_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_supplies" ADD CONSTRAINT "site_supplies_supply_id_supplies_id_fk" FOREIGN KEY ("supply_id") REFERENCES "public"."supplies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "site_supplies_site_idx" ON "site_supplies" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "site_supplies_supply_idx" ON "site_supplies" USING btree ("supply_id");--> statement-breakpoint
CREATE INDEX "site_supplies_quantity_idx" ON "site_supplies" USING btree ("quantity");