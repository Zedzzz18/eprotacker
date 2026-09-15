import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";
import { Card } from "@/components/ui/card";
import { Field, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";
import { createBrand } from "@/lib/actions/brands";

export default async function NewBrandPage() {
  const user = await requireUser();
  if (!isAdmin(user)) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/brands" className="text-xs text-gray-500 hover:underline">← Brands</Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">New Brand</h1>
      </div>

      <Card>
        <form action={createBrand} className="space-y-4">
          <Field label="Name">
            <input name="name" required className={inputClass} />
          </Field>
          <Field label="Brand owner">
            <input name="brandOwner" className={inputClass} />
          </Field>
          <Field label="Communication strategy">
            <textarea name="communicationStrategy" rows={3} className={inputClass} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="active" defaultChecked />
            Active
          </label>

          <div className="flex gap-2 pt-2">
            <button type="submit" className={primaryButtonClass}>Create Brand</button>
            <Link href="/brands" className={secondaryButtonClass}>Cancel</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
