import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Field, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";
import { createCountry } from "@/lib/actions/countries";

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

export default async function NewCountryPage() {
  const user = await requireUser();
  if (!isAdmin(user)) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/countries" className="text-xs text-gray-500 hover:underline">← Countries</Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">New Country</h1>
      </div>

      <Card>
        <form action={createCountry} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input name="name" required className={inputClass} />
            </Field>
            <Field label="Code">
              <input name="code" required maxLength={4} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Region">
              <input name="region" className={inputClass} />
            </Field>
            <Field label="Country owner">
              <input name="countryOwner" className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Project status">
              <input name="projectStatus" defaultValue="Not Started" className={inputClass} />
            </Field>
            <Field label="Launch date">
              <input type="date" name="launchDate" className={inputClass} />
            </Field>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">Readiness</div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {READINESS_FIELDS.map(([key, label]) => (
                <Field key={key} label={label}>
                  <select name={key} defaultValue="Not Started" className={inputClass}>
                    {READINESS_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className={primaryButtonClass}>Create Country</button>
            <Link href="/countries" className={secondaryButtonClass}>Cancel</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
