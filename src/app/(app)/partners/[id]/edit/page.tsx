import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleCountryIds } from "@/lib/rbac";
import { Card } from "@/components/ui/card";
import { Field, inputClass, primaryButtonClass, secondaryButtonClass, dangerButtonClass } from "@/components/ui/form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-button";
import { updatePartner, deletePartner } from "@/lib/actions/partners";

function toDateInput(d: Date | null) {
  return d ? d.toISOString().slice(0, 10) : "";
}

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const scope = accessibleCountryIds(user);

  const partner = await db.partner.findUnique({ where: { id } });
  if (!partner) notFound();
  if (scope !== "ALL" && !scope.includes(partner.countryId)) notFound();

  const boundUpdate = updatePartner.bind(null, id);
  const boundDelete = deletePartner.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/partners" className="text-xs text-gray-500 hover:underline">← Partners</Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Edit Partner</h1>
      </div>

      <Card>
        <form action={boundUpdate} className="space-y-4">
          <Field label="Name">
            <input name="name" required defaultValue={partner.name} className={inputClass} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Contact">
              <input name="contact" defaultValue={partner.contact ?? ""} className={inputClass} />
            </Field>
            <Field label="Contract status">
              <input name="contractStatus" defaultValue={partner.contractStatus} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Start date">
              <input type="date" name="startDate" defaultValue={toDateInput(partner.startDate)} className={inputClass} />
            </Field>
            <Field label="End date">
              <input type="date" name="endDate" defaultValue={toDateInput(partner.endDate)} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Technology">
              <input name="technology" defaultValue={partner.technology ?? ""} className={inputClass} />
            </Field>
            <Field label="Offer">
              <input name="offer" defaultValue={partner.offer ?? ""} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Technical integration">
              <input name="technicalIntegration" defaultValue={partner.technicalIntegration ?? ""} className={inputClass} />
            </Field>
            <Field label="Commercial offer">
              <input name="commercialOffer" defaultValue={partner.commercialOffer ?? ""} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Customer support">
              <input name="customerSupport" defaultValue={partner.customerSupport ?? ""} className={inputClass} />
            </Field>
            <Field label="SLA">
              <input name="sla" defaultValue={partner.sla ?? ""} className={inputClass} />
            </Field>
          </div>

          <Field label="Notes">
            <textarea name="notes" rows={3} defaultValue={partner.notes ?? ""} className={inputClass} />
          </Field>

          <div className="flex gap-2 pt-2">
            <button type="submit" className={primaryButtonClass}>Save Changes</button>
            <Link href="/partners" className={secondaryButtonClass}>Cancel</Link>
          </div>
        </form>

        <form action={boundDelete} className="mt-4 border-t border-gray-100 pt-4">
          <ConfirmSubmitButton
            label="Delete Partner"
            confirmText="Delete this partner? This cannot be undone."
            className={dangerButtonClass}
          />
        </form>
      </Card>
    </div>
  );
}
