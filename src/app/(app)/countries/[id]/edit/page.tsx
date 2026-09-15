import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleCountryIds, isAdmin } from "@/lib/rbac";
import { Card } from "@/components/ui/card";
import { Field, inputClass, primaryButtonClass, secondaryButtonClass, dangerButtonClass } from "@/components/ui/form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-button";
import { updateCountry, deleteCountry } from "@/lib/actions/countries";

const READINESS_STATUSES = ["Not Started", "Draft", "In Progress", "In Review", "Ready", "Approved", "Completed"];
const READINESS_FIELDS = [
  ["legalStatus", "Legal"],
  ["offerStatus", "Offer"],
  ["crmStatus", "CRM"],
  ["webStatus", "Web"],
  ["communicationStatus", "Communication"],
  ["documentationStatus", "Documentation"],
  ["trainingStatus", "Training"],
  ["partnerStatus", "Partner"],
] as const;

function toDateInput(d: Date | null) {
  return d ? d.toISOString().slice(0, 10) : "";
}

export default async function EditCountryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const scope = accessibleCountryIds(user);
  if (scope !== "ALL" && !scope.includes(id)) notFound();

  const country = await db.country.findUnique({ where: { id } });
  if (!country) notFound();

  const boundUpdate = updateCountry.bind(null, id);
  const boundDelete = deleteCountry.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/countries/${id}`} className="text-xs text-gray-500 hover:underline">← {country.name}</Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Edit Country</h1>
      </div>

      <Card>
        <form action={boundUpdate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input name="name" required defaultValue={country.name} className={inputClass} />
            </Field>
            <Field label="Code">
              <input name="code" required maxLength={4} defaultValue={country.code} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Region">
              <input name="region" defaultValue={country.region ?? ""} className={inputClass} />
            </Field>
            <Field label="Country owner">
              <input name="countryOwner" defaultValue={country.countryOwner ?? ""} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Project status">
              <input name="projectStatus" defaultValue={country.projectStatus} className={inputClass} />
            </Field>
            <Field label="Launch date">
              <input type="date" name="launchDate" defaultValue={toDateInput(country.launchDate)} className={inputClass} />
            </Field>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">Readiness</div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {READINESS_FIELDS.map(([key, label]) => (
                <Field key={key} label={label}>
                  <select name={key} defaultValue={country[key]} className={inputClass}>
                    {READINESS_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className={primaryButtonClass}>Save Changes</button>
            <Link href={`/countries/${id}`} className={secondaryButtonClass}>Cancel</Link>
          </div>
        </form>

        {isAdmin(user) && (
          <form action={boundDelete} className="mt-4 border-t border-gray-100 pt-4">
            <ConfirmSubmitButton
              label="Delete Country"
              confirmText="Delete this country and ALL its journeys, tasks, partners and data? This cannot be undone."
              className={dangerButtonClass}
            />
          </form>
        )}
      </Card>
    </div>
  );
}
