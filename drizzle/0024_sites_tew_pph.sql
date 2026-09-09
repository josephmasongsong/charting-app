ALTER TABLE "sites" RENAME COLUMN "user_id" TO "tew_id";
--> statement-breakpoint
ALTER TABLE "sites" RENAME CONSTRAINT "sites_user_id_users_id_fk" TO "sites_tew_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "pph_id" uuid;
--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_pph_id_users_id_fk" FOREIGN KEY ("pph_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
