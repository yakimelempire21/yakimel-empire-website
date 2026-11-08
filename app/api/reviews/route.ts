import { NextResponse } from "next/server";
import { and, count, eq, gt } from "drizzle-orm";
import { notifyArea } from "@/lib/admin/notify";
import { db, tables as t } from "@/lib/db";

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: Request) {
  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill the hidden "website" field.
  if (clip(data.website, 200)) return NextResponse.json({ success: true });

  const name = clip(data.name, 80);
  const body = clip(data.body, 1200);
  const rating = Number(data.rating);
  if (!name || body.length < 10 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Please add your name, a rating and a few words about your experience." }, { status: 400 });
  }

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  try {
    if (ipAddress) {
      const [{ n }] = await db
        .select({ n: count() })
        .from(t.reviews)
        .where(and(eq(t.reviews.ipAddress, ipAddress), gt(t.reviews.createdAt, new Date(Date.now() - 60 * 60_000))));
      if (n >= 3) return NextResponse.json({ error: "Thanks! We already received your review." }, { status: 429 });
    }

    await db.insert(t.reviews).values({
      name,
      body,
      rating,
      company: clip(data.company, 120) || null,
      role: clip(data.role, 80) || null,
      email: clip(data.email, 200) || null,
      service: clip(data.service, 80) || null,
      consent: data.consent === true,
      source: "website",
      ipAddress,
    });

    await notifyArea("clients", {
      kind: "INBOX",
      title: `New ${rating}★ review from ${name}`,
      body: body.slice(0, 140),
      href: "/admin/reviews",
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[reviews] could not save review:", (error as Error).message);
    return NextResponse.json({ error: "Something went wrong. Please try again in a moment." }, { status: 500 });
  }
}
