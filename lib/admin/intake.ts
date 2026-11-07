import "server-only";
import { sql } from "drizzle-orm";
import { databaseConfigured, db, tables as t } from "@/lib/db";
import { notifyArea } from "./notify";

type Intake = {
  reference: string;
  kind: "inquiry" | "project";
  name: string;
  email: string;
  phone?: string;
  company?: string;
  website?: string;
  subject: string;
  body: string;
  details?: Record<string, string>;
};

/**
 * Saves a website form submission into the Command Center inbox:
 * upserts the client (as a lead) and opens a conversation with the message.
 * Returns false when no database is configured or the write fails, so the
 * form can still fall back to email alone.
 */
export async function recordWebsiteRequest(input: Intake): Promise<boolean> {
  if (!databaseConfigured()) return false;
  try {
    const email = input.email.trim().toLowerCase();
    const conversationId = await db.transaction(async (tx) => {
      const [client] = await tx
        .insert(t.clients)
        .values({
          fullName: input.name,
          email,
          phone: input.phone || null,
          company: input.company || null,
          website: input.website || null,
          source: input.kind === "project" ? "Website — project request" : "Website — contact form",
        })
        .onConflictDoUpdate({
          target: t.clients.email,
          // Keep existing values; fill in blanks from the new submission.
          set: {
            phone: sql`coalesce(${t.clients.phone}, excluded.phone)`,
            company: sql`coalesce(${t.clients.company}, excluded.company)`,
            website: sql`coalesce(${t.clients.website}, excluded.website)`,
            updatedAt: new Date(),
          },
        })
        .returning({ id: t.clients.id });

      const [conversation] = await tx
        .insert(t.conversations)
        .values({
          reference: input.reference,
          source: input.kind === "project" ? "WEBSITE_PROJECT_REQUEST" : "WEBSITE_INQUIRY",
          clientId: client.id,
          subject: input.subject,
          details: input.details,
        })
        .returning({ id: t.conversations.id });

      await tx.insert(t.messages).values({
        conversationId: conversation.id,
        senderName: input.name,
        senderEmail: email,
        body: input.body,
        isInbound: true,
      });
      return conversation.id;
    });

    await notifyArea("inbox", {
      kind: "INBOX",
      title: input.kind === "project" ? `New project request from ${input.name}` : `New message from ${input.name}`,
      body: input.subject,
      href: `/admin/inbox/${conversationId}`,
    }).catch((e) => console.error("Notification failed:", e));
    return true;
  } catch (error) {
    console.error("Could not save website request to the database:", error);
    return false;
  }
}
