/**
 * YAKIMEL OS roles and what each one can open.
 * Kept free of server-only imports so the seed script can use it too.
 */
export const ROLE_KEYS = [
  "SUPER_ADMIN",
  "EXECUTIVE",
  "FINANCE",
  "DEVELOPER",
  "PROJECT_MANAGER",
  "SUPPORT_AGENT",
  "DEPARTMENT_MANAGER",
  "HR",
  "EMPLOYEE",
] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];

export const ROLE_DEFINITIONS: { key: RoleKey; name: string; description: string }[] = [
  { key: "SUPER_ADMIN", name: "Owner / Super Admin", description: "Full access to everything, including roles, security and settings." },
  { key: "EXECUTIVE", name: "Executive Admin", description: "Runs company operations across every department." },
  { key: "FINANCE", name: "Finance", description: "Finance, invoices, contracts and client billing." },
  { key: "DEVELOPER", name: "Developer", description: "Apps, system health and technical support tickets." },
  { key: "PROJECT_MANAGER", name: "Project Manager", description: "Clients, projects, tasks and the inbox." },
  { key: "SUPPORT_AGENT", name: "Support Agent", description: "Inbox messages and support tickets." },
  { key: "DEPARTMENT_MANAGER", name: "Department Manager", description: "Their own department's people, projects and tasks." },
  { key: "HR", name: "HR", description: "Employees, departments and team records." },
  { key: "EMPLOYEE", name: "Employee", description: "Their own tasks and notifications." },
];

/** Roles from Phase 1 that were renamed; the seed moves people to the new role. */
export const LEGACY_ROLE_MAP: Record<string, RoleKey> = {
  COMPANY_ADMIN: "EXECUTIVE",
  IT_SUPPORT: "DEVELOPER",
};

/** Areas of YAKIMEL OS. */
export type Area =
  | "dashboard"
  | "departments"
  | "employees"
  | "clients"
  | "projects"
  | "tasks"
  | "apps"
  | "inbox"
  | "tickets"
  | "notifications"
  | "security"
  | "roles"
  | "finance";

const ALL: Area[] = [
  "dashboard",
  "departments",
  "employees",
  "clients",
  "projects",
  "tasks",
  "apps",
  "inbox",
  "tickets",
  "notifications",
  "security",
  "roles",
  "finance",
];

export const ROLE_ACCESS: Record<RoleKey, Area[]> = {
  SUPER_ADMIN: ALL,
  EXECUTIVE: ALL.filter((a) => a !== "roles"),
  FINANCE: ["dashboard", "clients", "projects", "tasks", "notifications", "finance"],
  DEVELOPER: ["dashboard", "apps", "tickets", "tasks", "notifications", "security"],
  PROJECT_MANAGER: ["dashboard", "clients", "projects", "tasks", "inbox", "tickets", "notifications"],
  SUPPORT_AGENT: ["dashboard", "inbox", "tickets", "clients", "tasks", "notifications"],
  DEPARTMENT_MANAGER: ["dashboard", "departments", "employees", "projects", "tasks", "notifications"],
  HR: ["dashboard", "departments", "employees", "tasks", "notifications"],
  EMPLOYEE: ["dashboard", "tasks", "notifications"],
};

export function canAccess(role: string | null | undefined, area: Area): boolean {
  if (!role || !(role in ROLE_ACCESS)) return false;
  return ROLE_ACCESS[role as RoleKey].includes(area);
}

/** Roles allowed to create/edit employee records. */
export const EMPLOYEE_MANAGERS: RoleKey[] = ["SUPER_ADMIN", "EXECUTIVE", "HR"];

/** Roles that only see their own department's records. */
export const DEPARTMENT_SCOPED: RoleKey[] = ["DEPARTMENT_MANAGER"];

/** Roles that only see tasks assigned to them. */
export const OWN_TASKS_ONLY: RoleKey[] = ["EMPLOYEE"];

/** Roles that see the company-wide KPIs on the dashboard. */
export const EXECUTIVE_VIEW: RoleKey[] = ["SUPER_ADMIN", "EXECUTIVE"];
