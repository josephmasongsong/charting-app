ALTER TABLE "events" ADD COLUMN "successes" text;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "challenges" text;
--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "description";
