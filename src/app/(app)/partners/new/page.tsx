import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleCountryIds } from "@/lib/rbac";
import { Card } from "@/components/ui/card";
import { Field, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";
import { createPartner } from "@/lib/actions/partners";

export default async function NewPartnerPage() {
  const user = await requireUser();
  const scope = accessibleCountryIds(user);
  const where = scope === "ALL" ? {} : { id: { in: scope } };

  const countries = await db.country.findMany({ where, orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/partners" className="text-xs text-gray-500 hover:underline">← Partners</Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">New Partner</h1>
      </div>

      <Card>
        <form action={createPartner} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input name="name" required className={inputClass} />
            </Field>
            <Field label="Country">
              <select name="countryId" required className={inputClass} defaultValue="">
                <option value="" disabled>Select country</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Contact">
              <input name="contact" className={inputClass} />
            </Field>
            <Field label="Contract status">
              <input name="contractStatus" defaultValue="Draft" className={inputClass} />
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Technology">
              <input name="technology" className={inputClass} />
            </Field>
            <Field label="Offer">
              <input name="offer" className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Technical integration">
              <input name="technicalIntegration" className={inputClass} />
            </Field>
            <Field label="Commercial offer">
              <input name="commercialOffer" className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Customer support">
              <input name="customerSupport" className={inputClass} />
            </Field>
            <Field label="SLA">
              <input name="sla" className={inputClass} />
            </Field>
          </div>

          <Field label="Notes">
            <textarea name="notes" rows={3} className={inputClass} />
          </Field>

          <div className="flex gap-2 pt-2">
            <button type="submit" className={primaryButtonClass}>Create Partner</button>
            <Link href="/partners" className={secondaryButtonClass}>Cancel</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
