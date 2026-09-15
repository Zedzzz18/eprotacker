import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const roles = [...new Set(user.scopes.map((s) => s.role.replace("_", " ")))];

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={user.fullName} roles={roles} />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
