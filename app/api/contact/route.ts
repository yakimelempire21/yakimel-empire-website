import { NextResponse } from "next/server";
import { recordWebsiteRequest } from "@/lib/admin/intake";
import { CONTACT_INBOX, createTransport, fromAddress, mailConfigured } from "@/lib/mailer";

function generateTicketNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `YE-${timestamp}${random}`;
}

export async function POST(request: Request) {
  // Declared outside try so a failed email still succeeds when the request was saved.
  let saved = false;
  let ticketNumber = "";
  try {
    const { name, email, message, website } = await request.json();

    if (website) {
      return NextResponse.json({ success: true, ticketNumber: "N/A" });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    ticketNumber = generateTicketNumber();

    saved = await recordWebsiteRequest({
      reference: ticketNumber,
      kind: "inquiry",
      name,
      email,
      subject: String(message).startsWith("Escalated from chatbot")
        ? "Chat assistant escalation"
        : String(message).replace(/\s+/g, " ").trim().slice(0, 70) + (String(message).length > 70 ? "…" : ""),
      body: message,
    });

    if (!mailConfigured()) {
      console.error("Contact form: ZOHO_USER / ZOHO_APP_PASSWORD are not set.");
      if (saved) return NextResponse.json({ success: true, ticketNumber });
      return NextResponse.json({ error: "Email is not configured" }, { status: 500 });
    }

    const transporter = createTransport();

    await transporter.sendMail({
      from: fromAddress("Yakimel Empire Website"),
      to: CONTACT_INBOX,
      replyTo: email,
      subject: `New contact form message — ${ticketNumber}`,
      text: `Ticket: ${ticketNumber}\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    await transporter.sendMail({
      from: fromAddress("Yakimel Empire LLC Support"),
      to: email,
      subject: `We received your request — Ticket ${ticketNumber}`,
      text: `Hi ${name},

Thank you for contacting Yakimel Empire LLC Support.

We have successfully received your request, and a support ticket has been created.

Ticket Number: ${ticketNumber}

Our team will review your request and respond within 24-48 business hours. Response times may vary during weekends, holidays, or periods of high support volume.

Please avoid submitting multiple tickets for the same issue, as this may delay the review process. If you need to provide additional information, documents, or screenshots, simply reply to this email and they will be added to your existing request.

We appreciate your patience and thank you for contacting Yakimel Empire LLC.

Best regards,
Yakimel Empire LLC Support Team
info@yakimelempire.com

This is an automated confirmation message. Your request has been received and is awaiting review.`,
    });

    return NextResponse.json({ success: true, ticketNumber });
  } catch (error) {
    console.error("Contact form error:", error);
    if (saved) return NextResponse.json({ success: true, ticketNumber });
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}