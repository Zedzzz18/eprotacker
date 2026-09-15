"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canWrite, isAdmin } from "@/lib/rbac";
import type { ChannelType } from "@/generated/prisma/client";

function str(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

function channelData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    channelType: String(formData.get("channelType") ?? "ONLINE") as ChannelType,
    description: str(formData, "description"),
    owner: str(formData, "owner"),
    active: formData.get("active") === "on",
  };
}

export async function createChannel(formData: FormData) {
  const user = await requireUser();
  if (!canWrite(user)) throw new Error("Not authorized to create channels.");

  const data = channelData(formData);
  if (!data.name) throw new Error("Name is required.");

  await db.channel.create({ data });

  revalidatePath("/channels");
  redirect("/channels");
}

export async function updateChannel(id: string, formData: FormData) {
  const user = await requireUser();
  if (!canWrite(user)) throw new Error("Not authorized to edit channels.");

  const data = channelData(formData);
  if (!data.name) throw new Error("Name is required.");

  await db.channel.update({ where: { id }, data });

  revalidatePath("/channels");
  redirect("/channels");
}

export async function deleteChannel(id: string) {
  const user = await requireUser();
  if (!isAdmin(user)) throw new Error("Only admins can delete channels.");

  await db.channel.delete({ where: { id } });
  revalidatePath("/channels");
  redirect("/channels");
}
