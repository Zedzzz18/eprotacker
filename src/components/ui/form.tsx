import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";
export const labelClass = "mb-1 block text-sm font-medium text-gray-700";
export const primaryButtonClass =
  "rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800";
export const secondaryButtonClass =
  "rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50";
export const dangerButtonClass =
  "rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50";
export const linkButtonClass =
  "rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}
