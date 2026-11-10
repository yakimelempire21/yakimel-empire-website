import Image from "next/image";
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
      {/* Mint glass-server scene */}
      <Image
        src="/admin-login-bg.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover object-[50%_46%]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-white/10" />

      <div className="relative w-full max-w-[440px] rounded-[28px] border border-white/70 bg-white/55 px-8 pb-9 pt-8 shadow-[0_30px_80px_-30px_rgba(14,59,50,0.45),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl sm:px-10">
        <div className="flex flex-col items-center text-center">
          <Image src="/yakimel-icon.png" alt="Yakimel Empire LLC" width={2000} height={1541} priority className="h-24 w-auto" />
          <span aria-hidden="true" className="mt-2 block h-px w-10 bg-[#C9962B]/70" />
          <h1 className="mt-4 font-display text-[2rem] font-bold leading-tight text-os-ink">Yakimel OS</h1>
          <p className="text-[15px] text-os-ink/80">Enterprise Control System</p>
          <p className="mt-5 text-lg text-os-ink">Sign in to your workspace.</p>
        </div>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
