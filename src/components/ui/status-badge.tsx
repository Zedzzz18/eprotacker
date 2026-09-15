import { statusColor } from "@/lib/status";

const COLOR_CLASSES: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  orange: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-rose-50 text-rose-700 ring-rose-600/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
  gray: "bg-gray-100 text-gray-600 ring-gray-500/20",
};

export function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return null;
  const color = statusColor(status);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${COLOR_CLASSES[color]}`}
    >
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const classes: Record<string, string> = {
    LOW: "bg-gray-100 text-gray-600",
    MEDIUM: "bg-sky-50 text-sky-700",
    HIGH: "bg-amber-50 text-amber-700",
    CRITICAL: "bg-rose-100 text-rose-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes[priority] ?? classes.MEDIUM}`}>
      {priority}
    </span>
  );
}
