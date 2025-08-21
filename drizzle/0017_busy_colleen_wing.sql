CREATE TABLE "event_supply_distributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"supply_id" uuid NOT NULL,
	"quantity_distributed" integer NOT NULL,
	"cost_per_unit_at_distribution" numeric(12, 2) NOT NULL,
	"total_cost" numeric(12, 2) NOT NULL,
	"notes" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quantity_distributed_check" CHECK (quantity_distributed > 0),
	CONSTRAINT "cost_check" CHECK (cost_per_unit_at_distribution >= 0 AND total_cost >= 0)
);
--> statement-breakpoint
ALTER TABLE "event_supply_distributions" ADD CONSTRAINT "event_supply_distributions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_supply_distributions" ADD CONSTRAINT "event_supply_distributions_supply_id_supplies_id_fk" FOREIGN KEY ("supply_id") REFERENCES "public"."supplies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_supply_distributions_event_idx" ON "event_supply_distributions" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_supply_distributions_supply_idx" ON "event_supply_distributions" USING btree ("supply_id");--> statement-breakpoint
CREATE INDEX "event_supply_distributions_date_idx" ON "event_supply_distributions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "event_supply_distributions_cost_idx" ON "event_supply_distributions" USING btree ("total_cost");