import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Field, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";
import { createChannel } from "@/lib/actions/channels";

export default function NewChannelPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/channels" className="text-xs text-gray-500 hover:underline">← Channels</Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">New Channel</h1>
      </div>

      <Card>
        <form action={createChannel} className="space-y-4">
          <Field label="Name">
            <input name="name" required className={inputClass} />
          </Field>
          <Field label="Type">
            <select name="channelType" className={inputClass} defaultValue="ONLINE">
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </Field>
          <Field label="Description">
            <textarea name="description" rows={3} className={inputClass} />
          </Field>
          <Field label="Owner">
            <input name="owner" className={inputClass} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="active" defaultChecked />
            Active
          </label>

          <div className="flex gap-2 pt-2">
            <button type="submit" className={primaryButtonClass}>Create Channel</button>
            <Link href="/channels" className={secondaryButtonClass}>Cancel</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
