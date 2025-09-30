CREATE TABLE "supply_distribution_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"distribution_id" uuid NOT NULL,
	"supply_id" uuid NOT NULL,
	"quantity_distributed" integer NOT NULL,
	"unit_cost_at_time" numeric(12, 2) NOT NULL,
	"line_total" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "supply_dist_items_quantity_check" CHECK (quantity_distributed > 0),
	CONSTRAINT "supply_dist_items_unit_cost_check" CHECK (unit_cost_at_time >= 0),
	CONSTRAINT "supply_dist_items_line_total_check" CHECK (line_total >= 0)
);
--> statement-breakpoint
CREATE TABLE "supply_distributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid,
	"site_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"distribution_date" date NOT NULL,
	"distribution_type" varchar(50) DEFAULT 'door_to_door' NOT NULL,
	"recipient_notes" text NOT NULL,
	"total_cost" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "supply_distribution_items" ADD CONSTRAINT "supply_distribution_items_distribution_id_supply_distributions_id_fk" FOREIGN KEY ("distribution_id") REFERENCES "public"."supply_distributions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supply_distribution_items" ADD CONSTRAINT "supply_distribution_items_supply_id_supplies_id_fk" FOREIGN KEY ("supply_id") REFERENCES "public"."supplies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supply_distributions" ADD CONSTRAINT "supply_distributions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supply_distributions" ADD CONSTRAINT "supply_distributions_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supply_distributions" ADD CONSTRAINT "supply_distributions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "supply_dist_items_dist_idx" ON "supply_distribution_items" USING btree ("distribution_id");--> statement-breakpoint
CREATE INDEX "supply_dist_items_supply_idx" ON "supply_distribution_items" USING btree ("supply_id");--> statement-breakpoint
CREATE INDEX "supply_dist_items_quantity_idx" ON "supply_distribution_items" USING btree ("quantity_distributed");--> statement-breakpoint
CREATE INDEX "supply_dist_site_idx" ON "supply_distributions" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "supply_dist_user_idx" ON "supply_distributions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "supply_dist_event_idx" ON "supply_distributions" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "supply_dist_date_idx" ON "supply_distributions" USING btree ("distribution_date");--> statement-breakpoint
CREATE INDEX "supply_dist_type_idx" ON "supply_distributions" USING btree ("distribution_type");