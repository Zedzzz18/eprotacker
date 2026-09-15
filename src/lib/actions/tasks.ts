"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canWrite } from "@/lib/rbac";
import type { TaskPriority, TaskStatus } from "@/generated/prisma/client";

function str(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

function parseDate(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v ? new Date(v) : null;
}

function taskData(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    description: str(formData, "description"),
    countryId: str(formData, "countryId"),
    journeyId: str(formData, "journeyId"),
    ownerId: str(formData, "ownerId"),
    priority: (str(formData, "priority") ?? "MEDIUM") as TaskPriority,
    status: (str(formData, "status") ?? "NOT_STARTED") as TaskStatus,
    dueDate: parseDate(formData, "dueDate"),
  };
}

export async function createTask(formData: FormData) {
  const user = await requireUser();
  if (!canWrite(user)) throw new Error("Not authorized to create tasks.");

  const data = taskData(formData);
  if (!data.title) throw new Error("Title is required.");

  const projectId = str(formData, "projectId");
  if (!projectId) throw new Error("Project is required.");

  await db.task.create({ data: { ...data, projectId } });

  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function updateTask(id: string, formData: FormData) {
  const user = await requireUser();
  if (!canWrite(user)) throw new Error("Not authorized to edit tasks.");

  const data = taskData(formData);
  if (!data.title) throw new Error("Title is required.");

  await db.task.update({ where: { id }, data });

  revalidatePath("/tasks");
  revalidatePath(`/journeys/${data.journeyId ?? ""}`);
  redirect("/tasks");
}

export async function deleteTask(id: string) {
  const user = await requireUser();
  if (!canWrite(user)) throw new Error("Not authorized to delete tasks.");

  await db.task.delete({ where: { id } });
  revalidatePath("/tasks");
  redirect("/tasks");
}
