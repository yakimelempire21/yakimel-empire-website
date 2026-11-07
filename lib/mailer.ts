import nodemailer from "nodemailer";

/**
 * Sends the website's form emails through Zoho Mail (SMTP).
 *
 * Required environment variables (set them in .env.local and in Vercel):
 *   ZOHO_USER          the Zoho mailbox that sends, e.g. info@yakimelempire.com
 *   ZOHO_APP_PASSWORD  an app-specific password created in Zoho
 *
 * Optional:
 *   ZOHO_SMTP_HOST  default smtp.zoho.com (use smtppro.zoho.com for paid
 *                   organization plans, or smtp.zoho.eu / .in for other regions)
 *   ZOHO_SMTP_PORT  default 465 (SSL)
 *   CONTACT_INBOX   where new requests are delivered; default ZOHO_USER
 */
export const MAIL_USER = process.env.ZOHO_USER ?? "";
export const CONTACT_INBOX = process.env.CONTACT_INBOX || MAIL_USER;

export function mailConfigured(): boolean {
  return Boolean(process.env.ZOHO_USER && process.env.ZOHO_APP_PASSWORD);
}

export function createTransport() {
  const port = Number(process.env.ZOHO_SMTP_PORT || 465);
  return nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST || "smtp.zoho.com",
    port,
    secure: port === 465,
    auth: {
      user: process.env.ZOHO_USER,
      pass: process.env.ZOHO_APP_PASSWORD,
    },
  });
}

/** Zoho only allows sending "from" the signed-in mailbox, so use it with a display name. */
export function fromAddress(displayName: string): string {
  return `"${displayName}" <${MAIL_USER}>`;
}
