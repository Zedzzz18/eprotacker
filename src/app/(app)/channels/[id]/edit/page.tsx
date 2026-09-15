import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";
import { Card } from "@/components/ui/card";
import { Field, inputClass, primaryButtonClass, secondaryButtonClass, dangerButtonClass } from "@/components/ui/form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-button";
import { updateChannel, deleteChannel } from "@/lib/actions/channels";

export default async function EditChannelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const channel = await db.channel.findUnique({ where: { id } });
  if (!channel) notFound();

  const boundUpdate = updateChannel.bind(null, id);
  const boundDelete = deleteChannel.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/channels" className="text-xs text-gray-500 hover:underline">← Channels</Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Edit Channel</h1>
      </div>

      <Card>
        <form action={boundUpdate} className="space-y-4">
          <Field label="Name">
            <input name="name" required defaultValue={channel.name} className={inputClass} />
          </Field>
          <Field label="Type">
            <select name="channelType" className={inputClass} defaultValue={channel.channelType}>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </Field>
          <Field label="Description">
            <textarea name="description" rows={3} defaultValue={channel.description ?? ""} className={inputClass} />
          </Field>
          <Field label="Owner">
            <input name="owner" defaultValue={channel.owner ?? ""} className={inputClass} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="active" defaultChecked={channel.active} />
            Active
          </label>

          <div className="flex gap-2 pt-2">
            <button type="submit" className={primaryButtonClass}>Save Changes</button>
            <Link href="/channels" className={secondaryButtonClass}>Cancel</Link>
          </div>
        </form>

        {isAdmin(user) && (
          <form action={boundDelete} className="mt-4 border-t border-gray-100 pt-4">
            <ConfirmSubmitButton
              label="Delete Channel"
              confirmText="Delete this channel? This cannot be undone."
              className={dangerButtonClass}
            />
          </form>
        )}
      </Card>
    </div>
  );
}
