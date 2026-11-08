/**
 * Yakimel Empire — Command Center database schema (Drizzle ORM, PostgreSQL).
 *
 * Ported from the original apps/api Prisma schema. Phase 1 covers the
 * organization, authentication, CRM, projects and the unified inbox.
 * HR (leave, documents) and Finance (invoices, expenses) tables come next.
 *
 * After changing this file: `npm run db:generate` then `npm run db:migrate`.
 */
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  serial,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date());

// ============================================================
// ENUMS
// ============================================================

export const employeeStatus = pgEnum("employee_status", ["ACTIVE", "SUSPENDED", "INVITED", "DEACTIVATED"]);
export const invitationStatus = pgEnum("invitation_status", ["PENDING", "ACCEPTED", "EXPIRED", "REVOKED"]);
export const appStatus = pgEnum("app_status", ["LIVE", "DEVELOPMENT", "MAINTENANCE", "OFFLINE"]);
export const clientStatus = pgEnum("client_status", ["LEAD", "ACTIVE", "PAST", "ARCHIVED"]);
export const projectStatus = pgEnum("project_status", [
  "LEAD",
  "CONSULTATION",
  "PROPOSAL",
  "CONTRACT",
  "DEPOSIT",
  "DESIGN",
  "DEVELOPMENT",
  "TESTING",
  "CLIENT_REVIEW",
  "COMPLETED",
  "CANCELLED",
]);
export const taskStatus = pgEnum("task_status", ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED"]);
export const taskPriority = pgEnum("task_priority", ["LOW", "MEDIUM", "HIGH", "URGENT"]);
export const messageSource = pgEnum("message_source", [
  "WEBSITE_INQUIRY",
  "WEBSITE_PROJECT_REQUEST",
  "DIGIMARKET_SUPPORT",
  "HEALTHHYR_SUPPORT",
  "EZNOB",
  "DREAM_INK_DIGITALS",
  "INTERNAL_TEAM",
  "SYSTEM_ALERT",
]);
export const conversationStatus = pgEnum("conversation_status", ["OPEN", "ASSIGNED", "PENDING", "RESOLVED", "CLOSED"]);
export const ticketStatus = pgEnum("ticket_status", ["OPEN", "IN_PROGRESS", "WAITING_ON_CLIENT", "RESOLVED", "CLOSED"]);
export const ticketPriority = pgEnum("ticket_priority", ["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export const auditAction = pgEnum("audit_action", [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "LOGIN_FAILED",
  "PERMISSION_CHANGE",
  "EXPORT",
]);

// ============================================================
// COMPANY / ORG STRUCTURE
// ============================================================

export const companies = pgTable("companies", {
  id: id(),
  name: text("name").notNull(),
  legalName: text("legal_name"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const departments = pgTable(
  "departments",
  {
    id: id(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    parentDepartmentId: text("parent_department_id").references((): AnyPgColumn => departments.id),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("departments_company_idx").on(t.companyId)],
);

// ============================================================
// AUTH / ROLES
// ============================================================

/**
 * Roles. `key` is the stable value used in code (see lib/admin/permissions.ts):
 * SUPER_ADMIN, EXECUTIVE, COMPANY_ADMIN, DEPARTMENT_MANAGER, EMPLOYEE,
 * FINANCE, HR, IT_SUPPORT.
 */
export const roles = pgTable("roles", {
  id: id(),
  key: text("key").notNull().unique(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isSystem: boolean("is_system").default(false).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  // Two-factor authentication (Phase 2)
  totpSecretEncrypted: text("totp_secret_encrypted"),
  totpEnabled: boolean("totp_enabled").default(false).notNull(),
  backupCodesEncrypted: text("backup_codes_encrypted"),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const employees = pgTable(
  "employees",
  {
    id: id(),
    /** Optional: an employee record can exist before they get a login. */
    userId: text("user_id")
      .unique()
      .references(() => users.id, { onDelete: "set null" }),
    departmentId: text("department_id")
      .notNull()
      .references(() => departments.id),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id),
    fullName: text("full_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    title: text("title"),
    startDate: timestamp("start_date", { withTimezone: true, mode: "date" }),
    status: employeeStatus("status").default("ACTIVE").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("employees_department_idx").on(t.departmentId), index("employees_role_idx").on(t.roleId)],
);

export const invitations = pgTable("invitations", {
  id: id(),
  email: text("email").notNull(),
  roleId: text("role_id")
    .notNull()
    .references(() => roles.id),
  departmentId: text("department_id")
    .notNull()
    .references(() => departments.id),
  invitedById: text("invited_by_id")
    .notNull()
    .references(() => users.id),
  tokenHash: text("token_hash").notNull().unique(),
  status: invitationStatus("status").default("PENDING").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: createdAt(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** SHA-256 of the random token stored in the browser cookie. */
    tokenHash: text("token_hash").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const loginHistory = pgTable(
  "login_history",
  {
    id: id(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    success: boolean("success").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    reason: text("reason"),
    createdAt: createdAt(),
  },
  (t) => [index("login_history_email_idx").on(t.email, t.createdAt)],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: id(),
    userId: text("user_id").references(() => users.id),
    action: auditAction("action").notNull(),
    resource: text("resource").notNull(),
    resourceId: text("resource_id"),
    metadata: jsonb("metadata"),
    ipAddress: text("ip_address"),
    createdAt: createdAt(),
  },
  (t) => [index("audit_logs_user_idx").on(t.userId), index("audit_logs_resource_idx").on(t.resource, t.resourceId)],
);

// ============================================================
// ECOSYSTEM — APPS / PRODUCTS REGISTRY
// ============================================================

export const apps = pgTable("apps", {
  id: id(),
  departmentId: text("department_id")
    .notNull()
    .references(() => departments.id),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  domain: text("domain"),
  status: appStatus("status").default("DEVELOPMENT").notNull(),
  progressPercent: integer("progress_percent"),
  apiKeyHash: text("api_key_hash").unique(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const appMetricSnapshots = pgTable(
  "app_metric_snapshots",
  {
    id: id(),
    appId: text("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    metrics: jsonb("metrics").notNull(),
    capturedAt: timestamp("captured_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("app_metrics_app_idx").on(t.appId, t.capturedAt)],
);

// ============================================================
// CLIENTS / CRM
// ============================================================

export const clients = pgTable(
  "clients",
  {
    id: id(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    company: text("company"),
    website: text("website"),
    notes: text("notes"),
    status: clientStatus("status").default("LEAD").notNull(),
    source: text("source"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("clients_email_idx").on(t.email), index("clients_status_idx").on(t.status)],
);

// ============================================================
// PROJECTS / TASKS
// ============================================================

export const projects = pgTable(
  "projects",
  {
    id: id(),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id),
    departmentId: text("department_id").references(() => departments.id),
    appId: text("app_id").references(() => apps.id),
    name: text("name").notNull(),
    service: text("service").notNull(),
    description: text("description"),
    budget: numeric("budget", { precision: 12, scale: 2 }),
    deposit: numeric("deposit", { precision: 12, scale: 2 }),
    deadline: timestamp("deadline", { withTimezone: true, mode: "date" }),
    status: projectStatus("status").default("LEAD").notNull(),
    projectManagerId: text("project_manager_id").references(() => users.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("projects_client_idx").on(t.clientId), index("projects_status_idx").on(t.status)],
);

export const tasks = pgTable(
  "tasks",
  {
    id: id(),
    projectId: text("project_id").references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    assigneeId: text("assignee_id").references(() => users.id),
    createdById: text("created_by_id").references(() => users.id),
    departmentId: text("department_id").references(() => departments.id),
    priority: taskPriority("priority").default("MEDIUM").notNull(),
    status: taskStatus("status").default("TODO").notNull(),
    dueDate: timestamp("due_date", { withTimezone: true, mode: "date" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("tasks_project_idx").on(t.projectId), index("tasks_assignee_idx").on(t.assigneeId)],
);

// ============================================================
// MESSAGES / UNIFIED INBOX
// ============================================================

export const conversations = pgTable(
  "conversations",
  {
    id: id(),
    /** Ticket number shown to the customer, e.g. YE-PROJ-1234567890. */
    reference: text("reference").unique(),
    source: messageSource("source").notNull(),
    status: conversationStatus("status").default("OPEN").notNull(),
    clientId: text("client_id").references(() => clients.id),
    subject: text("subject"),
    /** Structured form fields (project type, budget, timeline…). */
    details: jsonb("details").$type<Record<string, string>>(),
    assignedToId: text("assigned_to_id").references(() => users.id),
    isPriority: boolean("is_priority").default(false).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("conversations_source_idx").on(t.source), index("conversations_status_idx").on(t.status)],
);

export const messages = pgTable(
  "messages",
  {
    id: id(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderName: text("sender_name"),
    senderEmail: text("sender_email"),
    body: text("body").notNull(),
    isInbound: boolean("is_inbound").default(true).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("messages_conversation_idx").on(t.conversationId)],
);

// ============================================================
// SUPPORT TICKETS
// ============================================================

export const supportTickets = pgTable(
  "support_tickets",
  {
    id: id(),
    /** Short human number, e.g. TKT-1042. */
    number: serial("number").notNull(),
    conversationId: text("conversation_id").references(() => conversations.id, { onDelete: "set null" }),
    appId: text("app_id").references(() => apps.id),
    clientId: text("client_id").references(() => clients.id),
    departmentId: text("department_id").references(() => departments.id),
    subject: text("subject").notNull(),
    description: text("description").notNull(),
    priority: ticketPriority("priority").default("MEDIUM").notNull(),
    status: ticketStatus("status").default("OPEN").notNull(),
    assigneeId: text("assignee_id").references(() => users.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("tickets_status_idx").on(t.status), index("tickets_department_idx").on(t.departmentId)],
);

// ============================================================
// NOTIFICATIONS
// ============================================================

export const notificationKind = pgEnum("notification_kind", ["INBOX", "TASK", "TICKET", "PROJECT", "SECURITY", "SYSTEM"]);

export const notifications = pgTable(
  "notifications",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: notificationKind("kind").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    href: text("href"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("notifications_user_idx").on(t.userId, t.readAt, t.createdAt)],
);

// ============================================================
// FINANCE
// ============================================================

export const invoiceStatus = pgEnum("invoice_status", ["DRAFT", "SENT", "PARTIAL", "PAID", "VOID"]);
export const paymentMethod = pgEnum("payment_method", ["CARD", "BANK_TRANSFER", "ZELLE", "CASH_APP", "PAYPAL", "STRIPE", "CASH", "CHECK", "OTHER"]);
export const billingInterval = pgEnum("billing_interval", ["MONTHLY", "QUARTERLY", "YEARLY"]);
export const subscriptionKind = pgEnum("subscription_kind", ["INCOME", "EXPENSE"]);
export const subscriptionStatus = pgEnum("subscription_status", ["ACTIVE", "PAUSED", "CANCELLED"]);

export const invoices = pgTable(
  "invoices",
  {
    id: id(),
    /** Human number, shown as INV-1001. */
    number: serial("number").notNull(),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
    status: invoiceStatus("status").default("DRAFT").notNull(),
    issueDate: timestamp("issue_date", { withTimezone: true, mode: "date" }).notNull(),
    dueDate: timestamp("due_date", { withTimezone: true, mode: "date" }),
    /** Sum of line items, kept in sync on every save. */
    total: numeric("total", { precision: 12, scale: 2 }).default("0").notNull(),
    amountPaid: numeric("amount_paid", { precision: 12, scale: 2 }).default("0").notNull(),
    notes: text("notes"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdById: text("created_by_id").references(() => users.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("invoices_client_idx").on(t.clientId), index("invoices_status_idx").on(t.status)],
);

export const invoiceItems = pgTable(
  "invoice_items",
  {
    id: id(),
    invoiceId: text("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: numeric("quantity", { precision: 10, scale: 2 }).default("1").notNull(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
    position: integer("position").default(0).notNull(),
  },
  (t) => [index("invoice_items_invoice_idx").on(t.invoiceId)],
);

export const payments = pgTable(
  "payments",
  {
    id: id(),
    invoiceId: text("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
    clientId: text("client_id").references(() => clients.id),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    method: paymentMethod("method").default("OTHER").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true, mode: "date" }).notNull(),
    reference: text("reference"),
    notes: text("notes"),
    recordedById: text("recorded_by_id").references(() => users.id),
    createdAt: createdAt(),
  },
  (t) => [index("payments_invoice_idx").on(t.invoiceId), index("payments_paid_idx").on(t.paidAt)],
);

export const expenses = pgTable(
  "expenses",
  {
    id: id(),
    date: timestamp("date", { withTimezone: true, mode: "date" }).notNull(),
    category: text("category").notNull(),
    vendor: text("vendor"),
    description: text("description"),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    departmentId: text("department_id").references(() => departments.id),
    appId: text("app_id").references(() => apps.id),
    recordedById: text("recorded_by_id").references(() => users.id),
    createdAt: createdAt(),
  },
  (t) => [index("expenses_date_idx").on(t.date)],
);

/** Recurring money: client plans (income) and company software/services (expense). */
export const subscriptions = pgTable("subscriptions", {
  id: id(),
  kind: subscriptionKind("kind").notNull(),
  name: text("name").notNull(),
  clientId: text("client_id").references(() => clients.id),
  vendor: text("vendor"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  interval: billingInterval("interval").default("MONTHLY").notNull(),
  nextDate: timestamp("next_date", { withTimezone: true, mode: "date" }),
  status: subscriptionStatus("status").default("ACTIVE").notNull(),
  notes: text("notes"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// ============================================================
// CONTRACTS & DOCUMENTS
// ============================================================

export const documentType = pgEnum("document_type", ["CONTRACT", "PROPOSAL", "SOW", "INVOICE", "RECEIPT", "COMPANY", "HR", "OTHER"]);
export const documentStatus = pgEnum("document_status", ["DRAFT", "SENT", "SIGNED", "EXPIRED", "ARCHIVED"]);

export const documents = pgTable(
  "documents",
  {
    id: id(),
    title: text("title").notNull(),
    type: documentType("type").default("OTHER").notNull(),
    status: documentStatus("status").default("DRAFT").notNull(),
    clientId: text("client_id").references(() => clients.id),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
    departmentId: text("department_id").references(() => departments.id),
    /** Storage path inside the private "documents" bucket (when a file was uploaded). */
    storagePath: text("storage_path"),
    fileName: text("file_name"),
    mimeType: text("mime_type"),
    sizeBytes: integer("size_bytes"),
    /** Or a link to a file kept elsewhere (Google Drive, DocuSign…). */
    externalUrl: text("external_url"),
    value: numeric("value", { precision: 12, scale: 2 }),
    signedAt: timestamp("signed_at", { withTimezone: true, mode: "date" }),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }),
    notes: text("notes"),
    uploadedById: text("uploaded_by_id").references(() => users.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("documents_type_idx").on(t.type), index("documents_client_idx").on(t.clientId)],
);

// ============================================================
// RELATIONS (for db.query.* with `with`)
// ============================================================

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  company: one(companies, { fields: [departments.companyId], references: [companies.id] }),
  parent: one(departments, { fields: [departments.parentDepartmentId], references: [departments.id], relationName: "hierarchy" }),
  children: many(departments, { relationName: "hierarchy" }),
  employees: many(employees),
  apps: many(apps),
}));

export const employeesRelations = relations(employees, ({ one }) => ({
  user: one(users, { fields: [employees.userId], references: [users.id] }),
  department: one(departments, { fields: [employees.departmentId], references: [departments.id] }),
  role: one(roles, { fields: [employees.roleId], references: [roles.id] }),
}));

export const usersRelations = relations(users, ({ one }) => ({
  employee: one(employees, { fields: [users.id], references: [employees.userId] }),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(projects),
  conversations: many(conversations),
  tickets: many(supportTickets),
  invoices: many(invoices),
  documents: many(documents),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, { fields: [invoices.clientId], references: [clients.id] }),
  project: one(projects, { fields: [invoices.projectId], references: [projects.id] }),
  items: many(invoiceItems),
  payments: many(payments),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceItems.invoiceId], references: [invoices.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] }),
  client: one(clients, { fields: [payments.clientId], references: [clients.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  client: one(clients, { fields: [subscriptions.clientId], references: [clients.id] }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  department: one(departments, { fields: [expenses.departmentId], references: [departments.id] }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  client: one(clients, { fields: [documents.clientId], references: [clients.id] }),
  project: one(projects, { fields: [documents.projectId], references: [projects.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, { fields: [projects.clientId], references: [clients.id] }),
  department: one(departments, { fields: [projects.departmentId], references: [departments.id] }),
  tasks: many(tasks),
  invoices: many(invoices),
  documents: many(documents),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  department: one(departments, { fields: [tasks.departmentId], references: [departments.id] }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  client: one(clients, { fields: [supportTickets.clientId], references: [clients.id] }),
  conversation: one(conversations, { fields: [supportTickets.conversationId], references: [conversations.id] }),
  department: one(departments, { fields: [supportTickets.departmentId], references: [departments.id] }),
  app: one(apps, { fields: [supportTickets.appId], references: [apps.id] }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  client: one(clients, { fields: [conversations.clientId], references: [clients.id] }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
}));

export const appsRelations = relations(apps, ({ one, many }) => ({
  department: one(departments, { fields: [apps.departmentId], references: [departments.id] }),
  metrics: many(appMetricSnapshots),
}));

export const appMetricSnapshotsRelations = relations(appMetricSnapshots, ({ one }) => ({
  app: one(apps, { fields: [appMetricSnapshots.appId], references: [apps.id] }),
}));

// ============================================================
// REVIEWS (client testimonials shown on yakimelempire.com)
// ============================================================

export const reviewStatus = pgEnum("review_status", ["PENDING", "APPROVED", "HIDDEN"]);

export const reviews = pgTable(
  "reviews",
  {
    id: id(),
    name: text("name").notNull(),
    company: text("company"),
    role: text("role"),
    email: text("email"),
    rating: integer("rating").notNull(),
    body: text("body").notNull(),
    service: text("service"),
    /** The client agreed to have this review shown publicly. */
    consent: boolean("consent").default(false).notNull(),
    status: reviewStatus("status").default("PENDING").notNull(),
    /** "website" (sent through /review) or "team" (entered in YAKIMEL OS). */
    source: text("source").default("website").notNull(),
    ipAddress: text("ip_address"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("reviews_status_idx").on(table.status, table.createdAt)],
);
