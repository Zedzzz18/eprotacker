export type StatusColor = "green" | "orange" | "red" | "gray" | "blue";

const GREEN = ["ready", "completed", "approved", "published", "yes"];
const ORANGE = ["in progress", "in review", "pending", "tbd"];
const RED = ["not started", "blocked", "no", "overdue", "open"];
const BLUE = ["draft"];

export function statusColor(status: string | null | undefined): StatusColor {
  if (!status) return "gray";
  const s = status.toLowerCase();
  if (GREEN.some((v) => s.includes(v))) return "green";
  if (ORANGE.some((v) => s.includes(v))) return "orange";
  if (RED.some((v) => s.includes(v))) return "red";
  if (BLUE.some((v) => s.includes(v))) return "blue";
  return "gray";
}

export function statusDot(status: string | null | undefined) {
  const color = statusColor(status);
  return { green: "🟢", orange: "🟠", red: "🔴", blue: "🔵", gray: "⚪️" }[color];
}
