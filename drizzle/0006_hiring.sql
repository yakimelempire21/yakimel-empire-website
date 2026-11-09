CREATE TYPE "public"."application_status" AS ENUM('NEW', 'REVIEWING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('DRAFT', 'OPEN', 'CLOSED');--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"location" text,
	"link_url" text,
	"cover_letter" text,
	"resume_path" text,
	"resume_name" text,
	"status" "application_status" DEFAULT 'NEW' NOT NULL,
	"notes" text,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"team" text,
	"location" text,
	"employment_type" text,
	"compensation" text,
	"summary" text,
	"description" text NOT NULL,
	"responsibilities" text,
	"requirements" text,
	"status" "job_status" DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_applications_job_idx" ON "job_applications" USING btree ("job_id","created_at");--> statement-breakpoint
-- First role, saved as a draft so the team can review it before publishing.
INSERT INTO "jobs" ("id", "slug", "title", "team", "location", "employment_type", "compensation", "summary", "description", "responsibilities", "requirements", "status")
VALUES (
  gen_random_uuid()::text,
  'marketing-sales-representative',
  'Marketing & Sales Representative',
  'Marketing',
  'Remote (anywhere)',
  'Independent contractor · Flexible hours',
  'Commission only — paid on every client you bring in',
  'Help small businesses discover Yakimel Empire''s websites, Shopify stores and AI assistants, and earn a commission on every client you sign.',
  'Yakimel Empire LLC builds websites, online stores, apps and AI tools for small businesses in the United States, Haiti and the diaspora. We are looking for motivated marketing and sales representatives who enjoy talking with business owners and helping them grow. You work remotely, on your own schedule, and earn a commission on every client you bring in.',
  'Find small businesses that need a website, an online store or an AI assistant
Reach out by message, social media, phone or in person and present our packages
Share personalized demos and follow up with interested business owners
Pass qualified leads to our team and help close the sale
Post about Yakimel Empire on your social media',
  'Comfortable talking with business owners and people you don''t know yet
Active on social media (Facebook, Instagram, TikTok or LinkedIn)
Organized and self-motivated: you set your own goals
English required; Haitian Creole, French or Spanish is a plus
Sales or marketing experience is a plus, not required',
  'DRAFT'
)
ON CONFLICT ("slug") DO NOTHING;
