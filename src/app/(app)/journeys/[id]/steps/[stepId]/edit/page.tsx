import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleCountryIds, accessibleBrandIds } from "@/lib/rbac";
import { Card } from "@/components/ui/card";
import { Field, inputClass, primaryButtonClass, secondaryButtonClass, dangerButtonClass } from "@/components/ui/form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-button";
import { updateJourneyStep, deleteJourneyStep } from "@/lib/actions/journeys";

function toDateInput(d: Date | null) {
  return d ? d.toISOString().slice(0, 10) : "";
}

export default async function EditJourneyStepPage({
  params,
}: {
  params: Promise<{ id: string; stepId: string }>;
}) {
  const { id, stepId } = await params;
  const user = await requireUser();
  const countryScope = accessibleCountryIds(user);
  const brandScope = accessibleBrandIds(user);

  const journey = await db.journey.findUnique({ where: { id } });
  if (!journey) notFound();
  if (countryScope !== "ALL" && !countryScope.includes(journey.countryId)) notFound();
  if (brandScope !== "ALL" && !brandScope.includes(journey.brandId)) notFound();

  const step = await db.journeyStep.findUnique({ where: { id: stepId } });
  if (!step || step.journeyId !== id) notFound();

  const channels = await db.channel.findMany({ where: { active: true }, orderBy: { name: "asc" } });
  const boundUpdate = updateJourneyStep.bind(null, id, stepId);
  const boundDelete = deleteJourneyStep.bind(null, id, stepId);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/journeys/${id}`} className="text-xs text-gray-500 hover:underline">← {journey.name}</Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Edit Step</h1>
      </div>

      <Card>
        <form action={boundUpdate} className="space-y-4">
          <Field label="Name">
            <input name="name" required defaultValue={step.name} className={inputClass} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Order">
              <input type="number" name="order" defaultValue={step.order} min={1} className={inputClass} />
            </Field>
            <Field label="Online / Offline">
              <select name="onlineOffline" defaultValue={step.onlineOffline} className={inputClass}>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </Field>
          </div>

          <Field label="Channel">
            <select name="channelId" className={inputClass} defaultValue={step.channelId ?? ""}>
              <option value="">—</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Owner">
              <input name="owner" defaultValue={step.owner ?? ""} className={inputClass} />
            </Field>
            <Field label="Status">
              <input name="status" defaultValue={step.status} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Trigger">
              <input name="trigger" defaultValue={step.trigger ?? ""} className={inputClass} />
            </Field>
            <Field label="URL">
              <input name="url" defaultValue={step.url ?? ""} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Start date">
              <input type="date" name="startDate" defaultValue={toDateInput(step.startDate)} className={inputClass} />
            </Field>
            <Field label="End date">
              <input type="date" name="endDate" defaultValue={toDateInput(step.endDate)} className={inputClass} />
            </Field>
          </div>

          <Field label="Description">
            <textarea name="description" rows={3} defaultValue={step.description ?? ""} className={inputClass} />
          </Field>

          <div className="flex gap-2 pt-2">
            <button type="submit" className={primaryButtonClass}>Save Changes</button>
            <Link href={`/journeys/${id}`} className={secondaryButtonClass}>Cancel</Link>
          </div>
        </form>

        <form action={boundDelete} className="mt-4 border-t border-gray-100 pt-4">
          <ConfirmSubmitButton
            label="Delete Step"
            confirmText="Delete this step? This cannot be undone."
            className={dangerButtonClass}
          />
        </form>
      </Card>
    </div>
  );
}
