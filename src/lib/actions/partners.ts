"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canWrite } from "@/lib/rbac";
import { accessibleCountryIds } from "@/lib/rbac";

function str(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

function parseDate(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v ? new Date(v) : null;
}

function partnerData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    contact: str(formData, "contact"),
    contractStatus: str(formData, "contractStatus") ?? "Draft",
    startDate: parseDate(formData, "startDate"),
    endDate: parseDate(formData, "endDate"),
    technology: str(formData, "technology"),
    offer: str(formData, "offer"),
    technicalIntegration: str(formData, "technicalIntegration"),
    commercialOffer: str(formData, "commercialOffer"),
    customerSupport: str(formData, "customerSupport"),
    sla: str(formData, "sla"),
    notes: str(formData, "notes"),
  };
}

export async function createPartner(formData: FormData) {
  const user = await requireUser();
  if (!canWrite(user)) throw new Error("Not authorized to create partners.");

  const countryId = str(formData, "countryId");
  if (!countryId) throw new Error("Country is required.");

  const scope = accessibleCountryIds(user);
  if (scope !== "ALL" && !scope.includes(countryId)) throw new Error("Not authorized for this country.");

  const data = partnerData(formData);
  if (!data.name) throw new Error("Name is required.");

  await db.partner.create({ data: { ...data, countryId } });

  revalidatePath("/partners");
  redirect("/partners");
}

export async function updatePartner(id: string, formData: FormData) {
  const user = await requireUser();
  if (!canWrite(user)) throw new Error("Not authorized to edit partners.");

  const data = partnerData(formData);
  if (!data.name) throw new Error("Name is required.");

  await db.partner.update({ where: { id }, data });

  revalidatePath("/partners");
  redirect("/partners");
}

export async function deletePartner(id: string) {
  const user = await requireUser();
  if (!canWrite(user)) throw new Error("Not authorized to delete partners.");

  await db.partner.delete({ where: { id } });
  revalidatePath("/partners");
  redirect("/partners");
}
