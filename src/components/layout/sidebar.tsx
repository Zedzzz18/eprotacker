"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe2,
  Tag,
  Handshake,
  FolderKanban,
  Route,
  Radio,
  ListChecks,
  Package,
  FileText,
  Search,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/countries", label: "Countries", icon: Globe2 },
  { href: "/brands", label: "Brands", icon: Tag },
  { href: "/partners", label: "Partners", icon: Handshake },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/journeys", label: "Journeys", icon: Route },
  { href: "/channels", label: "Channels", icon: Radio },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/offers", label: "Offers", icon: Package },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/search", label: "Search", icon: Search },
] as const;

export function Sidebar({ userName, roles }: { userName: string; roles: string[] }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-sm font-bold text-white">
          e⚡
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">e-PRO Control Tower</div>
          <div className="text-[11px] text-gray-400">Belux Charging Transition</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center gap-2 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-gray-900">{userName}</div>
            <div className="truncate text-[11px] text-gray-400">{roles.join(", ") || "Viewer"}</div>
          </div>
        </div>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="mt-1 w-full rounded-lg px-3 py-1.5 text-left text-xs text-gray-500 hover:bg-gray-100"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
