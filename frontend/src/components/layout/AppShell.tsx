"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/services/authService";

type AppShellProps = {
  children: React.ReactNode;
  allowedRoles?: Role[];
};

export const AppShell = ({ children, allowedRoles }: AppShellProps) => {
  const router = useRouter();
  const { authReady, token, user } = useAuth();

  const isForbidden =
    authReady &&
    token &&
    user &&
    allowedRoles &&
    !allowedRoles.includes(user.role);

  useEffect(() => {
    if (authReady && !token) {
      router.replace("/login");
      return;
    }

    if (isForbidden) {
      router.replace("/dashboard");
    }
  }, [authReady, isForbidden, router, token]);

  if (!authReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <Loader text="Memuat sesi..." />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <Loader text="Mengarahkan ke login..." />
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <Loader text="Akses ditolak. Mengarahkan ke dashboard..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
        </main>

        <Footer />
      </div>
    </div>
  );
};