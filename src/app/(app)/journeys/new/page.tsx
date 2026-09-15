import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleCountryIds, accessibleBrandIds } from "@/lib/rbac";
import { Card } from "@/components/ui/card";
import { Field, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";
import { createJourney } from "@/lib/actions/journeys";

export default async function NewJourneyPage() {
  const user = await requireUser();
  const countryScope = accessibleCountryIds(user);
  const brandScope = accessibleBrandIds(user);

  const [countries, brands] = await Promise.all([
    db.country.findMany({ where: countryScope === "ALL" ? {} : { id: { in: countryScope } }, orderBy: { name: "asc" } }),
    db.brand.findMany({ where: brandScope === "ALL" ? {} : { id: { in: brandScope } }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/journeys" className="text-xs text-gray-500 hover:underline">← Journeys</Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">New Journey</h1>
      </div>

      <Card>
        <form action={createJourney} className="space-y-4">
          <Field label="Name">
            <input name="name" required className={inputClass} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Country">
              <select name="countryId" required className={inputClass} defaultValue="">
                <option value="" disabled>Select a country</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Brand">
              <select name="brandId" required className={inputClass} defaultValue="">
                <option value="" disabled>Select a brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Journey Type">
            <select name="journeyType" defaultValue="ONLINE" className={inputClass}>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Target audience">
              <input name="targetAudience" className={inputClass} />
            </Field>
            <Field label="Trigger">
              <input name="trigger" className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Owner">
              <input name="owner" className={inputClass} />
            </Field>
            <Field label="Status">
              <input name="status" defaultValue="Not Started" className={inputClass} />
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
            <button type="submit" className={primaryButtonClass}>Create Journey</button>
            <Link href="/journeys" className={secondaryButtonClass}>Cancel</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
