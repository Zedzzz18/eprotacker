"use server";

import { db } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { redirect } from "next/navigation";

export type LoginState = { error?: string };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Please enter your username and password." };
  }

  const user = await db.user.findUnique({ where: { username } });

  if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Invalid username or password." };
  }

  await createSession(user.id);
  redirect("/dashboard");
}
