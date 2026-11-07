/**
 * Seeds the Command Center with the company structure, roles, apps and the
 * first Super Admin account. Safe to run more than once.
 *
 *   npm run db:seed
 *
 * Reads from .env.local:
 *   DATABASE_URL     (or DATABASE_URL_UNPOOLED)
 *   ADMIN_EMAIL      e.g. info@yakimelempire.com
 *   ADMIN_PASSWORD   at least 12 characters
 *   ADMIN_NAME       optional, defaults to "Administrator"
 */
import bcrypt from "bcryptjs";
import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as s from "../lib/db/schema";
import { LEGACY_ROLE_MAP, ROLE_DEFINITIONS } from "../lib/admin/roles";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error("Set DATABASE_URL in .env.local first.");

const sql = postgres(url, { max: 1, prepare: false });
const db = drizzle({ client: sql, schema: s });

const DEPARTMENTS: { slug: string; name: string; parent?: string; description?: string }[] = [
  { slug: "executive", name: "Executive Office" },
  { slug: "human-resources", name: "Human Resources" },
  { slug: "finance", name: "Finance" },
  {
    slug: "technology",
    name: "Technology",
    description: "DigiMarket, Health Hyr, BrandForge AI, OmniPresence AI and future apps",
  },
  { slug: "eznob", name: "EZNOB" },
  { slug: "eznob-office-services", name: "Office Services", parent: "eznob" },
  { slug: "eznob-business-services", name: "Business Services", parent: "eznob" },
];

/** Divisions removed from the company structure (children listed before parents). */
const REMOVED_DEPARTMENTS = [
  "dream-ink-books",
  "dream-ink-digital-products",
  "dream-ink-shopify-etsy",
  "dream-ink-digitals",
  "gallery-clothing",
  "gallery-templates",
  "gallery-creative-products",
  "yakimel-gallery",
];

const APPS: { slug: string; name: string; domain?: string; status: "LIVE" | "DEVELOPMENT"; progress?: number }[] = [
  { slug: "digimarket", name: "DigiMarket", domain: "digimarketapp.com", status: "LIVE" },
  { slug: "whatsapp-ai-assistant", name: "WhatsApp AI Assistant", status: "LIVE" },
  { slug: "health-hyr", name: "Health Hyr", domain: "healthhyr.com", status: "DEVELOPMENT" },
  { slug: "yakimel-design-studio", name: "Yakimel Design Studio", status: "DEVELOPMENT" },
  { slug: "omnipresence-ai", name: "OmniPresence AI", status: "DEVELOPMENT", progress: 72 },
  { slug: "brandforge-ai", name: "BrandForge AI", status: "DEVELOPMENT" },
];

async function main() {
  // Company
  const companyId = "yakimel-empire-llc";
  await db
    .insert(s.companies)
    .values({ id: companyId, name: "Yakimel Empire", legalName: "Yakimel Empire LLC" })
    .onConflictDoNothing();

  // Departments (parents first, thanks to the list order)
  const deptIds: Record<string, string> = {};
  for (const d of DEPARTMENTS) {
    const [row] = await db
      .insert(s.departments)
      .values({
        companyId,
        slug: d.slug,
        name: d.name,
        description: d.description,
        parentDepartmentId: d.parent ? deptIds[d.parent] : null,
      })
      .onConflictDoUpdate({ target: s.departments.slug, set: { name: d.name } })
      .returning({ id: s.departments.id });
    deptIds[d.slug] = row.id;
  }

  // Remove retired divisions, but never one that still has people, projects or work attached.
  for (const slug of REMOVED_DEPARTMENTS) {
    const dept = await db.query.departments.findFirst({ where: eq(s.departments.slug, slug) });
    if (!dept) continue;
    const [inUse] = await Promise.all([
      Promise.all([
        db.select({ id: s.employees.id }).from(s.employees).where(eq(s.employees.departmentId, dept.id)).limit(1),
        db.select({ id: s.projects.id }).from(s.projects).where(eq(s.projects.departmentId, dept.id)).limit(1),
        db.select({ id: s.tasks.id }).from(s.tasks).where(eq(s.tasks.departmentId, dept.id)).limit(1),
        db.select({ id: s.supportTickets.id }).from(s.supportTickets).where(eq(s.supportTickets.departmentId, dept.id)).limit(1),
        db.select({ id: s.apps.id }).from(s.apps).where(eq(s.apps.departmentId, dept.id)).limit(1),
        db.select({ id: s.departments.id }).from(s.departments).where(eq(s.departments.parentDepartmentId, dept.id)).limit(1),
      ]).then((rows) => rows.some((r) => r.length > 0)),
    ]);
    if (inUse) {
      console.log(`Kept "${dept.name}": it still has people, projects, tasks, tickets, apps or sub-departments.`);
      continue;
    }
    await db.delete(s.departments).where(eq(s.departments.id, dept.id));
    console.log(`Removed department "${dept.name}".`);
  }

  // Roles
  const roleIds: Record<string, string> = {};
  for (const r of ROLE_DEFINITIONS) {
    const [row] = await db
      .insert(s.roles)
      .values({ key: r.key, name: r.name, description: r.description, isSystem: true })
      .onConflictDoUpdate({ target: s.roles.key, set: { name: r.name, description: r.description } })
      .returning({ id: s.roles.id });
    roleIds[r.key] = row.id;
  }

  // Move anyone on a renamed Phase 1 role to its new role, then remove the old one.
  const legacy = await db.select().from(s.roles).where(inArray(s.roles.key, Object.keys(LEGACY_ROLE_MAP)));
  for (const old of legacy) {
    await db
      .update(s.employees)
      .set({ roleId: roleIds[LEGACY_ROLE_MAP[old.key]] })
      .where(eq(s.employees.roleId, old.id));
    await db.delete(s.roles).where(eq(s.roles.id, old.id));
  }

  // Apps
  for (const a of APPS) {
    await db
      .insert(s.apps)
      .values({
        departmentId: deptIds.technology,
        slug: a.slug,
        name: a.name,
        domain: a.domain,
        status: a.status,
        progressPercent: a.progress,
      })
      .onConflictDoNothing();
  }

  // First Super Admin
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("Structure seeded. Set ADMIN_EMAIL and ADMIN_PASSWORD to create the first admin.");
    return;
  }
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");

  const existing = await db.query.users.findFirst({ where: eq(s.users.email, email) });
  if (existing) {
    console.log(`Admin ${email} already exists — nothing changed.`);
    return;
  }

  const [user] = await db
    .insert(s.users)
    .values({ email, passwordHash: await bcrypt.hash(password, 12) })
    .returning({ id: s.users.id });
  await db.insert(s.employees).values({
    userId: user.id,
    departmentId: deptIds.executive,
    roleId: roleIds.SUPER_ADMIN,
    fullName: process.env.ADMIN_NAME || "Administrator",
    email,
    title: "Owner",
  });
  console.log(`Created Super Admin ${email}. Sign in at /admin/login.`);
}

main()
  .then(() => sql.end())
  .catch(async (e) => {
    console.error(e);
    await sql.end();
    process.exit(1);
  });
