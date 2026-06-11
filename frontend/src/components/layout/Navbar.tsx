"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { getRoleLabel } from "@/lib/role";

const logoSrc = "/Logo_RBR_Engine.png";

const pageTitles: Record<string, string> = {
  "/cases": "Cases",
  "/categories": "Categories",
  "/dashboard": "Dashboard",
  "/organizations": "Organisasi",
  "/rules": "Rules",
  "/users": "Users",
  "/variables": "Variables",
};

export function Navbar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const matchedPath = Object.keys(pageTitles)
    .sort((a, b) => b.length - a.length)
    .find((path) => pathname === path || pathname.startsWith(`${path}/`));
  const title = matchedPath ? pageTitles[matchedPath] : "RBR Engine";

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-4 py-4 shadow-[0_1px_18px_rgba(15,23,42,0.04)] backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden lg:hidden">
          <img
            src={logoSrc}
            alt="RBR Engine logo"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-slate-950">{title}</h1>
          <p className="truncate text-sm text-slate-500">
            {user ? `${user.nama_lengkap} - ${getRoleLabel(user.role)}` : "Kelola data RBR Engine"}
          </p>
        </div>
      </div>
      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden min-w-0 text-right sm:block">
            <div className="text-sm font-bold text-slate-800">{user.nama_lengkap}</div>
            <div className="text-xs text-slate-500">{getRoleLabel(user.role)}</div>
          </div>
          <Button type="button" variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>
      )}
    </header>
  );
}
