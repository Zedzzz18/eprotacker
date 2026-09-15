import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Field, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";
import { createProject } from "@/lib/actions/projects";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/projects" className="text-xs text-gray-500 hover:underline">← Projects</Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">New Project</h1>
      </div>

      <Card>
        <form action={createProject} className="space-y-4">
          <Field label="Name">
            <input name="name" required className={inputClass} />
          </Field>
          <Field label="Description">
            <textarea name="description" rows={3} className={inputClass} />
          </Field>
          <Field label="Status">
            <input name="status" defaultValue="In Progress" className={inputClass} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Start date">
              <input type="date" name="startDate" className={inputClass} />
            </Field>
            <Field label="End date">
              <input type="date" name="endDate" className={inputClass} />
            </Field>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className={primaryButtonClass}>Create Project</button>
            <Link href="/projects" className={secondaryButtonClass}>Cancel</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
