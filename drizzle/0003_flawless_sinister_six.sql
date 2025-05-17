CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"event_date" timestamp NOT NULL,
	"description" text NOT NULL,
	"event_duration" integer DEFAULT 0 NOT NULL,
	"admin_duration" integer DEFAULT 0 NOT NULL,
	"new_participants" integer DEFAULT 0 NOT NULL,
	"returning_participants" integer DEFAULT 0 NOT NULL,
	"event_is_youth_focused" boolean DEFAULT false NOT NULL,
	"has_co_sponsor" boolean DEFAULT false NOT NULL,
	"amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"activity_type_id" uuid NOT NULL,
	"site_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_activity_type_id_activity_types_id_fk" FOREIGN KEY ("activity_type_id") REFERENCES "public"."activity_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_idx" ON "events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_type_idx" ON "events" USING btree ("activity_type_id");--> statement-breakpoint
CREATE INDEX "site_idx" ON "events" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "date_idx" ON "events" USING btree ("event_date");