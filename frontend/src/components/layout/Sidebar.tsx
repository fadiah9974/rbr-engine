"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Database,
  FileSpreadsheet,
  FolderTree,
  LayoutDashboard,
  ListChecks,
  ScrollText,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/services/authService";

const logoSrc = "/Logo_RBR_Engine.png";

const menus: {
  href: string;
  icon: LucideIcon;
  label: string;
  roles: Role[];
}[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["SUPER_ADMIN", "ADMIN", "PENGGUNA"] },
  { href: "/users", icon: Users, label: "Users", roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/organizations", icon: Building2, label: "Organisasi", roles: ["SUPER_ADMIN"] },
  { href: "/database", icon: Database, label: "Database", roles: ["SUPER_ADMIN"] },
  { href: "/variables", icon: ListChecks, label: "Variables", roles: ["ADMIN"] },
  { href: "/categories", icon: FolderTree, label: "Categories", roles: ["ADMIN"] },
  { href: "/rules", icon: ScrollText, label: "Rules", roles: ["ADMIN"] },
  { href: "/cases", icon: FileSpreadsheet, label: "Cases", roles: ["PENGGUNA"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const allowedMenus = menus.filter((menu) => user && menu.roles.includes(user.role));
  const panelLabel = user?.role === "PENGGUNA" ? "User Panel" : "Management Console";

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-teal-400/10 bg-[linear-gradient(165deg,#020617_0%,#0f172a_52%,#073b3a_100%)] p-4 text-white shadow-[12px_0_36px_rgba(2,6,23,0.22)] lg:flex lg:flex-col">
      <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_44px_rgba(2,6,23,0.22)] backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl">
            <img
              src={logoSrc}
              alt="RBR Engine logo"
              className="h-full w-full object-contain [filter:drop-shadow(0_10px_18px_rgba(2,6,23,0.35))]"
            />
          </div>
          <div className="min-w-0">
            <div className="truncate font-bold tracking-tight text-white">RBR Engine</div>
            <div className="truncate text-xs text-slate-400">{panelLabel}</div>
          </div>
        </div>
      </div>
      <div className="mb-3 px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400/80">
        Menu
      </div>
      <nav className="grid gap-1.5">
        {allowedMenus.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
          <Link
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
              active
                ? "bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white shadow-[0_12px_26px_rgba(20,184,166,0.26)]"
                : "text-slate-300 hover:translate-x-1 hover:bg-teal-400/10 hover:text-white"
            }`}
            href={href}
            key={href}
          >
            <Icon className={`h-4 w-4 transition-colors ${active ? "text-white" : "text-slate-400 group-hover:text-teal-100"}`} />
            <span>{label}</span>
          </Link>
          );
        })}
      </nav>
      {user && (
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.06] p-3 shadow-[0_18px_44px_rgba(2,6,23,0.26)] backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-teal-300/20 bg-gradient-to-br from-[#14b8a6]/30 to-[#0f766e]/20 text-sm font-bold text-teal-50 shadow-inner">
              {user.nama_lengkap.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold">{user.nama_lengkap}</div>
              <div className="truncate text-xs text-slate-400">{user.email}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
