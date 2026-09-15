import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleCountryIds, accessibleBrandIds } from "@/lib/rbac";
import { Card } from "@/components/ui/card";
import { Field, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";
import { createJourneyStep } from "@/lib/actions/journeys";

export default async function NewJourneyStepPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const countryScope = accessibleCountryIds(user);
  const brandScope = accessibleBrandIds(user);

  const journey = await db.journey.findUnique({ where: { id }, include: { steps: true } });
  if (!journey) notFound();
  if (countryScope !== "ALL" && !countryScope.includes(journey.countryId)) notFound();
  if (brandScope !== "ALL" && !brandScope.includes(journey.brandId)) notFound();

  const channels = await db.channel.findMany({ where: { active: true }, orderBy: { name: "asc" } });
  const nextOrder = journey.steps.length + 1;
  const boundCreate = createJourneyStep.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/journeys/${id}`} className="text-xs text-gray-500 hover:underline">← {journey.name}</Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">New Step</h1>
      </div>

      <Card>
        <form action={boundCreate} className="space-y-4">
          <Field label="Name">
            <input name="name" required className={inputClass} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Order">
              <input type="number" name="order" defaultValue={nextOrder} min={1} className={inputClass} />
            </Field>
            <Field label="Online / Offline">
              <select name="onlineOffline" defaultValue="Online" className={inputClass}>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </Field>
          </div>

          <Field label="Channel">
            <select name="channelId" className={inputClass} defaultValue="">
              <option value="">—</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Owner">
              <input name="owner" className={inputClass} />
            </Field>
            <Field label="Status">
              <input name="status" defaultValue="Not Started" className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Trigger">
              <input name="trigger" className={inputClass} />
            </Field>
            <Field label="URL">
              <input name="url" className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Start date">
              <input type="date" name="startDate" className={inputClass} />
            </Field>
            <Field label="End date">
              <input type="date" name="endDate" className={inputClass} />
            </Field>
          </div>

          <Field label="Description">
            <textarea name="description" rows={3} className={inputClass} />
          </Field>

          <div className="flex gap-2 pt-2">
            <button type="submit" className={primaryButtonClass}>Create Step</button>
            <Link href={`/journeys/${id}`} className={secondaryButtonClass}>Cancel</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
