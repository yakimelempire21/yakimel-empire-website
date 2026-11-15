ALTER TABLE "jobs" ADD COLUMN "compensation_details" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "faq" text;--> statement-breakpoint
-- One public URL for the outreach role. Older URLs redirect here (next.config.ts).
UPDATE "jobs" SET "slug" = 'marketing-client-outreach-representative'
WHERE "slug" = 'marketing-sales-representative'
  AND NOT EXISTS (SELECT 1 FROM "jobs" WHERE "slug" = 'marketing-client-outreach-representative');
--> statement-breakpoint
-- Approved title, pay and FAQ. Description, responsibilities and qualifications are left as they are.
UPDATE "jobs" SET
  "title" = 'Affiliate Marketing & Client Outreach Representative',
  "location" = 'Remote',
  "employment_type" = 'Independent contractor · Flexible hours · Commission only',
  "compensation" = 'Earn 15% of each referred client’s first payment.',
  "summary" = 'Introduce business owners to Yakimel Empire’s website, Shopify and custom app services, and earn a commission on each new client you refer.',
  "compensation_details" = 'Commission-based opportunity
Earn 15% of the first payment Yakimel Empire receives from each new client you refer.
Example: If your referred client makes a first payment of $500, your commission is $75.
This opportunity does not include a fixed salary.',
  "faq" = 'Is this a salaried position?
No. This is a commission-only, independent contractor opportunity. It does not include a fixed salary.

How is the commission calculated?
You earn 15% of the first payment Yakimel Empire receives from each new client you refer. For example, if your referred client makes a first payment of $500, your commission is $75. The commission applies to the first payment only.',
  -- Draft terms written before the owner set the 15% rate were never approved: remove them.
  "policy" = CASE WHEN "policy" LIKE 'Commission: 10%%' THEN NULL ELSE "policy" END
WHERE "slug" = 'marketing-client-outreach-representative';
