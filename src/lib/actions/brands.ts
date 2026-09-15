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

function brandData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    brandOwner: str(formData, "brandOwner"),
    communicationStrategy: str(formData, "communicationStrategy"),
    active: formData.get("active") === "on",
  };
}

export async function createBrand(formData: FormData) {
  const user = await requireUser();
  if (!isAdmin(user)) throw new Error("Only admins can create brands.");

  const data = brandData(formData);
  if (!data.name) throw new Error("Name is required.");

  const brand = await db.brand.create({ data });

  revalidatePath("/brands");
  redirect(`/brands/${brand.id}`);
}

export async function updateBrand(id: string, formData: FormData) {
  const user = await requireUser();
  if (!canWrite(user)) throw new Error("Not authorized to edit brands.");

  const data = brandData(formData);
  if (!data.name) throw new Error("Name is required.");

  await db.brand.update({ where: { id }, data });

  revalidatePath("/brands");
  revalidatePath(`/brands/${id}`);
  redirect(`/brands/${id}`);
}

export async function deleteBrand(id: string) {
  const user = await requireUser();
  if (!isAdmin(user)) throw new Error("Only admins can delete brands.");

  await db.brand.delete({ where: { id } });
  revalidatePath("/brands");
  redirect("/brands");
}
