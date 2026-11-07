# YAKIMEL OS — Command Center

The internal system for running Yakimel Empire, at **/admin** on the website.

## Phase 1

- **Sign in** with email + password. Sessions are stored in the database. Accounts lock for 15 minutes after 5 wrong passwords. Every sign-in and change is written to the audit log.
- **Roles.** 8 roles (Super Admin, Executive, Company Admin, Department Manager, Employee, Finance, HR, IT Support). What each role can open is set in `lib/admin/roles.ts`.
- **Inbox.** Both website forms are saved here automatically. You can reply by email (sent via Zoho), add internal notes, change the status, or convert a request into a project.
- **Clients.** Website requests create leads automatically. Repeat customers are matched by email.
- **Projects** with a sales and production pipeline, plus tasks.
- **Employees** with departments and roles. You can optionally give someone a login. Only a Super Admin can grant Super Admin or Executive.
- **Apps.** Status and progress for each product.

## Phase 2 — YAKIMEL OS

- **Look and feel:** graphite and royal-blue glass design, a sidebar grouped by section (Company, Ecosystem, Communication, Business, Technology, Analytics, System), global search, and a notification bell.
- **Executive Dashboard:** a greeting, the company status (all systems operational or attention needed), key numbers, and an ecosystem card for each app.
- **App Control Centers:** each app has its own page at `/admin/apps/<slug>`, showing its status, progress, and the latest metrics it reported.
- **Departments:** the company hierarchy, with headcount and apps per department.
- **Tasks:** company-wide tasks with priority, deadlines and assignees. Employees only see their own tasks.
- **Support Tickets:** create a ticket from any inbox message, or open one directly.
- **Inbox:** filter by source; assign a message, mark it priority, create a ticket, convert the sender to a client, or create a project.
- **Notifications:** sent for new website requests, assigned tasks and tickets, completed tasks, and critical tickets.
- **Security Center:** active sessions (which can be signed out), failed and suspicious sign-ins, and the audit logs.
- **Users & Roles:** 9 roles (Owner, Executive Admin, Finance, Developer, Project Manager, Support Agent, Department Manager, HR, Employee).
- **My account:** change your password. Doing so signs out your other devices.

### Connecting an app (ecosystem gateway)

1. Go to YAKIMEL OS → Ecosystem → the app → **Create API key**. Copy the key; it's only shown once.
2. Store it in that app's environment, for example `YAKIMEL_OS_KEY`.
3. Have the app report its numbers on a schedule:
   ```
   POST https://www.yakimelempire.com/api/ecosystem/metrics
   Authorization: Bearer <key>
   { "metrics": { "users": 12450, "orders": 327, "revenue": 4820.5, "errors": 0 } }
   ```
   Any flat numbers or short text are accepted, up to 30 keys.

## Setup

1. **Create a database.** In Vercel, go to **Storage → Create → Neon (Postgres)** and connect it to this project. Vercel adds `DATABASE_URL` and `DATABASE_URL_UNPOOLED` for you.
2. **Copy the two URLs into `.env.local`**, along with the first admin account:
   ```
   DATABASE_URL=...
   DATABASE_URL_UNPOOLED=...
   ADMIN_EMAIL=info@yakimelempire.com
   ADMIN_PASSWORD=a-long-private-password
   ADMIN_NAME=Your Name
   ```
3. **Install, create the tables, and add the starting data:**
   ```
   npm install
   npm run db:migrate
   npm run db:seed
   ```
4. Sign in at `/admin/login`. After that, remove `ADMIN_PASSWORD` from `.env.local`.

## Changing the database

Edit `lib/db/schema.ts`, then run `npm run db:generate` (this creates a migration in `drizzle/`) and `npm run db:migrate`. Commit the `drizzle/` folder.

## Coming next

- **Phase 3 (Business):** finance, invoices, subscriptions, contracts and documents.
- **Phase 4 (App Control Centers):** user, payment and moderation actions for each app; system health; analytics.
- **Phase 5:** the Ask Yakimel AI command bar and the desktop app.
- **HR additions:** leave requests, employee documents, email invitations, password reset, two-factor authentication.
