CREATE TYPE "public"."review_status" AS ENUM('PENDING', 'APPROVED', 'HIDDEN');--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"company" text,
	"role" text,
	"email" text,
	"rating" integer NOT NULL,
	"body" text NOT NULL,
	"service" text,
	"consent" boolean DEFAULT false NOT NULL,
	"status" "review_status" DEFAULT 'PENDING' NOT NULL,
	"source" text DEFAULT 'website' NOT NULL,
	"ip_address" text,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "reviews_status_idx" ON "reviews" USING btree ("status","created_at");