"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canWrite } from "@/lib/rbac";
import type { JourneyType } from "@/generated/prisma/client";

function str(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

function parseDate(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v ? new Date(v) : null;
}

function parseInt10(formData: FormData, key: string, fallback: number) {
  const v = String(formData.get(key) ?? "").trim();
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

function journeyData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    journeyType: (str(formData, "journeyType") ?? "ONLINE") as JourneyType,
    targetAudience: str(formData, "targetAudience"),
    trigger: str(formData, "trigger"),
    owner: str(formData, "owner"),
    startDate: parseDate(formData, "startDate"),
    endDate: parseDate(formData, "endDate"),
    status: str(formData, "status") ?? "Not Started",
    description: str(formData, "description"),
  };
}

export async function createJourney(formData: FormData) {
  const user = await requireUser();
  if (!canWrite(user)) throw new Error("Not authorized to create journeys.");

  const data = journeyData(formData);
  if (!data.name) throw new Error("Name is required.");

  const countryId = str(formData, "countryId");
  const brandId = str(formData, "brandId");
  if (!countryId || !brandId) throw new Error("Country and brand are required.");

  const journey = await db.journey.create({ data: { ...data, countryId, brandId } });

  revalidatePath("/journeys");
  redirect(`/journeys/${journey.id}`);
}

export async function updateJourney(id: string, formData: FormData) {
  const user = await requireUser();
  if (!canWrite(user)) throw new Error("Not authorized to edit journeys.");

  const data = journeyData(formData);
  if (!data.name) throw new Error("Name is required.");

  const countryId = str(formData, "countryId");
  const brandId = str(formData, "brandId");
  if (!countryId || !brandId) throw new Error("Country and brand are required.");

  await db.journey.update({ where: { id }, data: { ...data, countryId, brandId } });

  revalidatePath("/journeys");
  revalidatePath(`/journeys/${id}`);
  redirect(`/journeys/${id}`);
}

export async function deleteJourney(id: string) {
  const user = await requireUser();
  if (!canWrite(user)) throw new Error("Not authorized to delete journeys.");

  await db.journey.delete({ where: { id } });
  revalidatePath("/journeys");
  redirect("/journeys");
}

function journeyStepData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    order: parseInt10(formData, "order", 1),
    channelId: str(formData, "channelId"),
    onlineOffline: str(formData, "onlineOffline") ?? "Online",
    owner: str(formData, "owner"),
    trigger: str(formData, "trigger"),
    description: str(formData, "description"),
    status: str(formData, "status") ?? "Not Started",
    startDate: parseDate(formData, "startDate"),
    endDate: parseDate(formData, "endDate"),
    url: str(formData, "url"),
  };
}

export async function createJourneyStep(journeyId: string, formData: FormData) {
  const user = await requireUser();
  if (!canWrite(user)) throw new Error("Not authorized to create journey steps.");

  const data = journeyStepData(formData);
  if (!data.name) throw new Error("Name is required.");

  await db.journeyStep.create({ data: { ...data, journeyId } });

  revalidatePath(`/journeys/${journeyId}`);
  redirect(`/journeys/${journeyId}`);
}

export async function updateJourneyStep(journeyId: string, stepId: string, formData: FormData) {
  const user = await requireUser();
  if (!canWrite(user)) throw new Error("Not authorized to edit journey steps.");

  const data = journeyStepData(formData);
  if (!data.name) throw new Error("Name is required.");

  await db.journeyStep.update({ where: { id: stepId }, data });

  revalidatePath(`/journeys/${journeyId}`);
  redirect(`/journeys/${journeyId}`);
}

export async function deleteJourneyStep(journeyId: string, stepId: string) {
  const user = await requireUser();
  if (!canWrite(user)) throw new Error("Not authorized to delete journey steps.");

  await db.journeyStep.delete({ where: { id: stepId } });
  revalidatePath(`/journeys/${journeyId}`);
  redirect(`/journeys/${journeyId}`);
}
