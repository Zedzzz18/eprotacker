import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleCountryIds, accessibleBrandIds } from "@/lib/rbac";
import { Card } from "@/components/ui/card";
import { Field, inputClass, primaryButtonClass, secondaryButtonClass, dangerButtonClass } from "@/components/ui/form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-button";
import { updateJourney, deleteJourney } from "@/lib/actions/journeys";

function toDateInput(d: Date | null) {
  return d ? d.toISOString().slice(0, 10) : "";
}

export default async function EditJourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const countryScope = accessibleCountryIds(user);
  const brandScope = accessibleBrandIds(user);

  const journey = await db.journey.findUnique({ where: { id } });
  if (!journey) notFound();
  if (countryScope !== "ALL" && !countryScope.includes(journey.countryId)) notFound();
  if (brandScope !== "ALL" && !brandScope.includes(journey.brandId)) notFound();

  const [countries, brands] = await Promise.all([
    db.country.findMany({ where: countryScope === "ALL" ? {} : { id: { in: countryScope } }, orderBy: { name: "asc" } }),
    db.brand.findMany({ where: brandScope === "ALL" ? {} : { id: { in: brandScope } }, orderBy: { name: "asc" } }),
  ]);

  const boundUpdate = updateJourney.bind(null, id);
  const boundDelete = deleteJourney.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/journeys/${id}`} className="text-xs text-gray-500 hover:underline">← {journey.name}</Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Edit Journey</h1>
      </div>

      <Card>
        <form action={boundUpdate} className="space-y-4">
          <Field label="Name">
            <input name="name" required defaultValue={journey.name} className={inputClass} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Country">
              <select name="countryId" required className={inputClass} defaultValue={journey.countryId}>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Brand">
              <select name="brandId" required className={inputClass} defaultValue={journey.brandId}>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Journey Type">
            <select name="journeyType" defaultValue={journey.journeyType} className={inputClass}>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Target audience">
              <input name="targetAudience" defaultValue={journey.targetAudience ?? ""} className={inputClass} />
            </Field>
            <Field label="Trigger">
              <input name="trigger" defaultValue={journey.trigger ?? ""} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Owner">
              <input name="owner" defaultValue={journey.owner ?? ""} className={inputClass} />
            </Field>
            <Field label="Status">
              <input name="status" defaultValue={journey.status} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Start date">
              <input type="date" name="startDate" defaultValue={toDateInput(journey.startDate)} className={inputClass} />
            </Field>
            <Field label="End date">
              <input type="date" name="endDate" defaultValue={toDateInput(journey.endDate)} className={inputClass} />
            </Field>
          </div>

          <Field label="Description">
            <textarea name="description" rows={3} defaultValue={journey.description ?? ""} className={inputClass} />
          </Field>

          <div className="flex gap-2 pt-2">
            <button type="submit" className={primaryButtonClass}>Save Changes</button>
            <Link href={`/journeys/${id}`} className={secondaryButtonClass}>Cancel</Link>
          </div>
        </form>

        <form action={boundDelete} className="mt-4 border-t border-gray-100 pt-4">
          <ConfirmSubmitButton
            label="Delete Journey"
            confirmText="Delete this journey and all its steps? This cannot be undone."
            className={dangerButtonClass}
          />
        </form>
      </Card>
    </div>
  );
}
