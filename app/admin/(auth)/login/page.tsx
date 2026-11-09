import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/admin/auth";
import { databaseConfigured } from "@/lib/db";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in | YAKIMEL OS" };

export default async function LoginPage() {
  // Always render at request time (it reads the session cookie).
  await connection();
  let signedIn = false;
  if (databaseConfigured()) {
    try {
      signedIn = Boolean(await getCurrentUser());
    } catch (error) {
      // Show the form even if the database can't be reached; signing in will explain.
      console.error("Login page: database check failed:", error);
    }
  }
  if (signedIn) redirect("/admin");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(107,47,214,0.16),transparent_60%)]"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-os-lime/70 blur-xl" aria-hidden="true" />
            <Image src="/yakimel-icon.png" alt="" width={64} height={64} className="relative h-16 w-16" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-[0.14em] text-os-ink">YAKIMEL OS</h1>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.3em] text-os-muted">Enterprise Control System</p>
        </div>
        <div className="rounded-2xl border border-os-ink/15 bg-white p-7 shadow-[0_24px_60px_-30px_rgba(42,11,54,0.35)]">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-os-muted">
          <Link href="/" className="hover:text-os-ink">
            ← Back to yakimelempire.com
          </Link>
        </p>
      </div>
    </main>
  );
}
