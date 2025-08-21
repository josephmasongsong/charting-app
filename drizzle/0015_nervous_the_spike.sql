CREATE TABLE "supplies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"cost_per_unit" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "supply_name_idx" ON "supplies" USING btree ("name");--> statement-breakpoint
CREATE INDEX "supply_cost_idx" ON "supplies" USING btree ("cost_per_unit");--> statement-breakpoint
CREATE INDEX "supply_quantity_idx" ON "supplies" USING btree ("quantity");