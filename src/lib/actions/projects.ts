"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canWrite, isAdmin } from "@/lib/rbac";

function str(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

function parseDate(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v ? new Date(v) : null;
}

function projectData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    description: str(formData, "description"),
    status: str(formData, "status") ?? "In Progress",
    startDate: parseDate(formData, "startDate"),
    endDate: parseDate(formData, "endDate"),
  };
}

export async function createProject(formData: FormData) {
  const user = await requireUser();
  if (!canWrite(user)) throw new Error("Not authorized to create projects.");

  const data = projectData(formData);
  if (!data.name) throw new Error("Name is required.");

  await db.project.create({ data });

  revalidatePath("/projects");
  redirect("/projects");
}

export async function updateProject(id: string, formData: FormData) {
  const user = await requireUser();
  if (!canWrite(user)) throw new Error("Not authorized to edit projects.");

  const data = projectData(formData);
  if (!data.name) throw new Error("Name is required.");

  await db.project.update({ where: { id }, data });

  revalidatePath("/projects");
  redirect("/projects");
}

export async function deleteProject(id: string) {
  const user = await requireUser();
  if (!isAdmin(user)) throw new Error("Only admins can delete projects.");

  await db.project.delete({ where: { id } });
  revalidatePath("/projects");
  redirect("/projects");
}
