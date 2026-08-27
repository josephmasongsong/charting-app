ALTER TABLE "users" ADD COLUMN "invited_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "invited_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "invite_accepted_at" timestamp;