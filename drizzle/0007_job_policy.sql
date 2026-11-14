ALTER TABLE "jobs" ADD COLUMN "policy" text;--> statement-breakpoint
-- Marketing & Sales Representative: 10% of each client's setup payment, plus its policies.
UPDATE "jobs" SET
  "compensation" = '10% commission on each client''s setup payment',
  "policy" = COALESCE("policy", 'Commission: 10% of the setup payment of every client you bring in (example: a $1,500 website pays you $150)
Commission is paid within 7 days after the client''s setup payment clears
Payment by Zelle, Cash App, PayPal or bank transfer
A client counts for you when you register them with our team before they sign; if two people refer the same client, the first one registered gets the commission
No commission on payments that are refunded, disputed or canceled
You are an independent contractor, not an employee: you set your own hours and handle your own taxes
Only promise the prices and features listed on yakimelempire.com/pricing; never make guarantees we have not approved
No spam, fake reviews, or paid ads using the Yakimel Empire name without written approval
Keep client information confidential and never share it outside Yakimel Empire
Either side can end the agreement at any time; commissions already earned are still paid')
WHERE "slug" = 'marketing-sales-representative';
--> statement-breakpoint
-- Affiliate Partner: refer clients only, 10% of the setup payment. Saved as a draft for review.
INSERT INTO "jobs" ("id", "slug", "title", "team", "location", "employment_type", "compensation", "summary", "description", "responsibilities", "requirements", "policy", "status")
VALUES (
  gen_random_uuid()::text,
  'affiliate-partner',
  'Affiliate Partner',
  'Partnerships',
  'Remote (anywhere)',
  'Referral partner · No hours, no quota',
  '10% of each referred client''s setup payment',
  'Know a business that needs a website, an online store or an AI assistant? Introduce them to us and earn 10% when they sign.',
  'Yakimel Empire builds websites, Shopify stores and WhatsApp AI assistants for small businesses in the United States, Haiti and the diaspora. As an Affiliate Partner you don''t sell anything: you introduce business owners you know, our team does the rest, and you earn 10% of their setup payment when they become a client.',
  'Tell business owners you know about Yakimel Empire
Share our live demos at yakimelempire.com/demo
Send us the business name and contact, or ask them to mention your name when they book a call
Our team handles the call, the sale and the project',
  'You know business owners: salons, restaurants, shops, clinics, churches, contractors…
Active on WhatsApp or social media
No sales experience needed
Anyone 18 or older, anywhere in the world',
  'Commission: 10% of the referred client''s setup payment (example: a $1,500 website pays you $150; a $3,000 clinic package pays you $300)
Commission is paid within 7 days after the client''s setup payment clears
Payment by Zelle, Cash App, PayPal or bank transfer
A referral counts when it is registered with our team before the client signs; if two people refer the same client, the first one registered gets the commission
No commission on payments that are refunded, disputed or canceled, or on your own business
You are an independent partner, not an employee, and you handle your own taxes
Don''t promise prices, discounts or results; send people to yakimelempire.com/pricing
No spam, fake reviews, or paid ads using the Yakimel Empire name without written approval
Either side can end the partnership at any time; commissions already earned are still paid',
  'DRAFT'
)
ON CONFLICT ("slug") DO NOTHING;
