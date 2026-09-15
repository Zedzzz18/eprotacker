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

function countryData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    code: String(formData.get("code") ?? "").trim().toUpperCase(),
    region: str(formData, "region"),
    countryOwner: str(formData, "countryOwner"),
    projectStatus: str(formData, "projectStatus") ?? "Not Started",
    launchDate: parseDate(formData, "launchDate"),
    legalStatus: str(formData, "legalStatus") ?? "Not Started",
    offerStatus: str(formData, "offerStatus") ?? "Not Started",
    crmStatus: str(formData, "crmStatus") ?? "Not Started",
    webStatus: str(formData, "webStatus") ?? "Not Started",
    communicationStatus: str(formData, "communicationStatus") ?? "Not Started",
    documentationStatus: str(formData, "documentationStatus") ?? "Not Started",
    trainingStatus: str(formData, "trainingStatus") ?? "Not Started",
    partnerStatus: str(formData, "partnerStatus") ?? "Not Started",
  };
}

export async function createCountry(formData: FormData) {
  const user = await requireUser();
  if (!isAdmin(user)) throw new Error("Only admins can create countries.");

  const data = countryData(formData);
  if (!data.name || !data.code) throw new Error("Name and code are required.");

  const country = await db.country.create({ data });

  revalidatePath("/countries");
  redirect(`/countries/${country.id}`);
}

export async function updateCountry(id: string, formData: FormData) {
  const user = await requireUser();
  if (!canWrite(user)) throw new Error("Not authorized to edit countries.");

  const data = countryData(formData);
  if (!data.name || !data.code) throw new Error("Name and code are required.");

  await db.country.update({ where: { id }, data });

  revalidatePath("/countries");
  revalidatePath(`/countries/${id}`);
  redirect(`/countries/${id}`);
}

export async function deleteCountry(id: string) {
  const user = await requireUser();
  if (!isAdmin(user)) throw new Error("Only admins can delete countries.");

  await db.country.delete({ where: { id } });
  revalidatePath("/countries");
  redirect("/countries");
}
