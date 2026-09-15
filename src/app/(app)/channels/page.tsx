import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canWrite } from "@/lib/rbac";
import { Card, CardTitle } from "@/components/ui/card";

export default async function ChannelsPage() {
  const user = await requireUser();

  const channels = await db.channel.findMany({
    include: { _count: { select: { journeySteps: true, taskChannels: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Channels</h1>
          <p className="mt-1 text-sm text-gray-500">Online and offline touchpoints used across journeys</p>
        </div>
        {canWrite(user) && (
          <Link href="/channels/new" className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800">
            + New Channel
          </Link>
        )}
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Used in Steps</th>
              <th className="px-4 py-3">Tasks</th>
              <th className="px-4 py-3">Active</th>
              {canWrite(user) && <th className="px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {channels.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{c.channelType}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{c.owner ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{c._count.journeySteps}</td>
                <td className="px-4 py-3 text-gray-600">{c._count.taskChannels}</td>
                <td className="px-4 py-3 text-gray-600">{c.active ? "Yes" : "No"}</td>
                {canWrite(user) && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link href={`/channels/${c.id}/edit`} className="text-xs font-medium text-gray-500 hover:underline">
                      Edit
                    </Link>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {channels.length === 0 && (
        <Card>
          <CardTitle>No channels</CardTitle>
          <p className="text-sm text-gray-500">No channels have been created yet.</p>
        </Card>
      )}
    </div>
  );
}
