ALTER TABLE "apps" ADD COLUMN "metrics_url" text;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "health" text;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "checked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "down_since" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "last_error" text;