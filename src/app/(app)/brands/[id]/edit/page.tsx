import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleBrandIds, isAdmin } from "@/lib/rbac";
import { Card } from "@/components/ui/card";
import { Field, inputClass, primaryButtonClass, secondaryButtonClass, dangerButtonClass } from "@/components/ui/form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-button";
import { updateBrand, deleteBrand } from "@/lib/actions/brands";

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const scope = accessibleBrandIds(user);
  if (scope !== "ALL" && !scope.includes(id)) notFound();

  const brand = await db.brand.findUnique({ where: { id } });
  if (!brand) notFound();

  const boundUpdate = updateBrand.bind(null, id);
  const boundDelete = deleteBrand.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/brands/${id}`} className="text-xs text-gray-500 hover:underline">← {brand.name}</Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Edit Brand</h1>
      </div>

      <Card>
        <form action={boundUpdate} className="space-y-4">
          <Field label="Name">
            <input name="name" required defaultValue={brand.name} className={inputClass} />
          </Field>
          <Field label="Brand owner">
            <input name="brandOwner" defaultValue={brand.brandOwner ?? ""} className={inputClass} />
          </Field>
          <Field label="Communication strategy">
            <textarea name="communicationStrategy" rows={3} defaultValue={brand.communicationStrategy ?? ""} className={inputClass} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="active" defaultChecked={brand.active} />
            Active
          </label>

          <div className="flex gap-2 pt-2">
            <button type="submit" className={primaryButtonClass}>Save Changes</button>
            <Link href={`/brands/${id}`} className={secondaryButtonClass}>Cancel</Link>
          </div>
        </form>

        {isAdmin(user) && (
          <form action={boundDelete} className="mt-4 border-t border-gray-100 pt-4">
            <ConfirmSubmitButton
              label="Delete Brand"
              confirmText="Delete this brand and ALL its journeys and tasks? This cannot be undone."
              className={dangerButtonClass}
            />
          </form>
        )}
      </Card>
    </div>
  );
}
