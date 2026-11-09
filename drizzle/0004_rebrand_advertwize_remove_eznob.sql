-- Advertwize replaces OmniPresence AI in the app ecosystem (keeps its history, API key and metrics).
UPDATE "apps"
SET "name" = 'Advertwize',
    "slug" = 'advertwize',
    "description" = 'Plan campaigns, manage advertising and understand performance in one place.'
WHERE "slug" = 'omnipresence-ai'
  AND NOT EXISTS (SELECT 1 FROM "apps" WHERE "slug" = 'advertwize');
--> statement-breakpoint
UPDATE "departments"
SET "description" = 'DigiMarket, Health Hyr, BrandForge AI, Advertwize and future apps'
WHERE "slug" = 'technology';
--> statement-breakpoint
-- EZNOB is no longer a department. Remove its divisions first, then EZNOB itself,
-- but never one that still has people, invitations, apps, projects, tasks, tickets,
-- expenses, documents or sub-departments attached.
DELETE FROM "departments" d
WHERE d."slug" IN ('eznob-office-services', 'eznob-business-services', 'eznob')
  AND NOT EXISTS (SELECT 1 FROM "employees" x WHERE x."department_id" = d."id")
  AND NOT EXISTS (SELECT 1 FROM "invitations" x WHERE x."department_id" = d."id")
  AND NOT EXISTS (SELECT 1 FROM "apps" x WHERE x."department_id" = d."id")
  AND NOT EXISTS (SELECT 1 FROM "projects" x WHERE x."department_id" = d."id")
  AND NOT EXISTS (SELECT 1 FROM "tasks" x WHERE x."department_id" = d."id")
  AND NOT EXISTS (SELECT 1 FROM "support_tickets" x WHERE x."department_id" = d."id")
  AND NOT EXISTS (SELECT 1 FROM "expenses" x WHERE x."department_id" = d."id")
  AND NOT EXISTS (SELECT 1 FROM "documents" x WHERE x."department_id" = d."id")
  AND d."slug" <> 'eznob';
--> statement-breakpoint
DELETE FROM "departments" d
WHERE d."slug" = 'eznob'
  AND NOT EXISTS (SELECT 1 FROM "departments" c WHERE c."parent_department_id" = d."id")
  AND NOT EXISTS (SELECT 1 FROM "employees" x WHERE x."department_id" = d."id")
  AND NOT EXISTS (SELECT 1 FROM "invitations" x WHERE x."department_id" = d."id")
  AND NOT EXISTS (SELECT 1 FROM "apps" x WHERE x."department_id" = d."id")
  AND NOT EXISTS (SELECT 1 FROM "projects" x WHERE x."department_id" = d."id")
  AND NOT EXISTS (SELECT 1 FROM "tasks" x WHERE x."department_id" = d."id")
  AND NOT EXISTS (SELECT 1 FROM "support_tickets" x WHERE x."department_id" = d."id")
  AND NOT EXISTS (SELECT 1 FROM "expenses" x WHERE x."department_id" = d."id")
  AND NOT EXISTS (SELECT 1 FROM "documents" x WHERE x."department_id" = d."id");
