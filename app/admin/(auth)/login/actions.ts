"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/lib/admin/auth";
import { databaseConfigured } from "@/lib/db";

export type LoginState = { error?: string; email?: string } | undefined;

export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  if (!databaseConfigured()) {
    return { error: "The Command Center database is not connected yet (DATABASE_URL is missing)." };
  }
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password.", email };

  const result = await signIn(email, password);
  // Return the email so the form keeps it after React resets the inputs.
  if (!result.ok) return { error: result.error, email };
  redirect("/admin");
}
