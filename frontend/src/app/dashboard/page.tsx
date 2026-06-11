"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Database, FileSpreadsheet, FolderTree, ListChecks, ScrollText, Users } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { getCases, type CaseItem } from "@/services/caseService";
import { getCategories } from "@/services/categoryService";
import { getOrganizations, type Organization } from "@/services/organizationService";
import { getRules } from "@/services/ruleService";
import type { User } from "@/services/authService";
import { getUsers } from "@/services/userService";
import { getVariables } from "@/services/variableService";

const logoSrc = "/Logo_RBR_Engine.png";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getCaseResult(caseItem: CaseItem) {
  const firstResult = caseItem.results[0];

  return firstResult?.kategori?.nama_kategori || caseItem.kategori?.nama_kategori || "Belum ada hasil";
}

function getRoleName(role: User["role"]) {
  if (role === "SUPER_ADMIN") return "Super Admin";
  if (role === "ADMIN") return "Admin";
  return "Pengguna";
}

export default function DashboardPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isPengguna = user?.role === "PENGGUNA";
  const [adminStats, setAdminStats] = useState({
    categories: 0,
    rules: 0,
    variables: 0,
  });
  const [caseStats, setCaseStats] = useState({
    cases: 0,
  });
  const [latestCases, setLatestCases] = useState<CaseItem[]>([]);
  const [latestOrganizations, setLatestOrganizations] = useState<Organization[]>([]);
  const [latestUsers, setLatestUsers] = useState<User[]>([]);
  const [superAdminStats, setSuperAdminStats] = useState({
    admins: 0,
    organizations: 0,
    regularUsers: 0,
    users: 0,
  });

  useEffect(() => {
    if (!token || !isAdmin) return;

    Promise.allSettled([getVariables(token), getCategories(token), getRules(token)]).then(
      ([variables, categories, rules]) => {
        setAdminStats({
          variables: variables.status === "fulfilled" ? variables.value.length : 0,
          categories: categories.status === "fulfilled" ? categories.value.length : 0,
          rules: rules.status === "fulfilled" ? rules.value.length : 0,
        });
      }
    );
  }, [isAdmin, token]);

  useEffect(() => {
    if (!token || !isSuperAdmin) return;

    Promise.allSettled([getUsers(token), getOrganizations(token)]).then(
      ([users, organizations]) => {
        const userItems = users.status === "fulfilled" ? users.value : [];
        const organizationItems = organizations.status === "fulfilled" ? organizations.value : [];

        setLatestUsers(userItems.slice(0, 4));
        setLatestOrganizations(organizationItems.slice(0, 4));
        setSuperAdminStats({
          admins: userItems.filter((item) => item.role === "ADMIN").length,
          users: userItems.length,
          regularUsers: userItems.filter((item) => item.role === "PENGGUNA").length,
          organizations: organizationItems.length,
        });
      }
    );
  }, [isSuperAdmin, token]);

  useEffect(() => {
    if (!token || !isPengguna) return;

    getCases(token)
      .then((items) => {
        setCaseStats({ cases: items.length });
        setLatestCases(items.slice(0, 4));
      })
      .catch(() => setCaseStats({ cases: 0 }));
  }, [isPengguna, token]);

  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="flex items-start gap-4">
          <img
            src={logoSrc}
            alt="RBR Engine logo"
            className="h-16 w-16 shrink-0 object-contain scale-[1.45] [filter:drop-shadow(0_8px_14px_rgba(15,23,42,0.12))]"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Dashboard RBR Engine
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Ringkasan aktivitas dan data yang tersedia untuk Anda.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {isAdmin ? (
            <>
              <StatsCard
                title="Variabel"
                value={adminStats.variables}
                icon={ListChecks}
                description="Indikator asesmen"
              />
              <StatsCard
                title="Kategori"
                value={adminStats.categories}
                icon={FolderTree}
                description="Kelompok hasil"
              />
              <StatsCard
                title="Aturan"
                value={adminStats.rules}
                icon={ScrollText}
                description="Aturan penilaian"
              />
            </>
          ) : isSuperAdmin ? (
            <>
              <StatsCard
                title="Akun"
                value={superAdminStats.users}
                icon={Users}
                description="Semua pengguna"
              />
              <StatsCard
                title="Admin"
                value={superAdminStats.admins}
                icon={Users}
                description="Pengelola sistem"
              />
              <StatsCard
                title="Organisasi"
                value={superAdminStats.organizations}
                icon={Building2}
                description="Instansi terdaftar"
              />
              <StatsCard
                title="Pengguna"
                value={superAdminStats.regularUsers}
                icon={Users}
                description="Akun asesmen"
              />
            </>
          ) : (
            <StatsCard
              title="Asesmen"
              value={caseStats.cases}
              icon={FileSpreadsheet}
              description="Riwayat asesmen"
            />
          )}
        </div>

        <Card>
          <CardHeader
            title="Aksi Cepat"
            description="Pilih tindakan yang ingin Anda lakukan."
          />
          <CardContent className="flex flex-wrap gap-3">
            {isAdmin && (
              <>
                <Link href="/variables">
                  <Button type="button">Kelola Variabel</Button>
                </Link>
                <Link href="/categories">
                  <Button type="button" variant="secondary">
                    Kelola Kategori
                  </Button>
                </Link>
                <Link href="/rules">
                  <Button type="button" variant="secondary">
                    Kelola Aturan
                  </Button>
                </Link>
              </>
            )}
            {isSuperAdmin && (
              <>
                <Link href="/users">
                  <Button type="button">Kelola Akun</Button>
                </Link>
                <Link href="/organizations">
                  <Button type="button" variant="secondary">
                    Kelola Organisasi
                  </Button>
                </Link>
                <Link href="/database">
                  <Button type="button" variant="secondary">
                    Database Manager
                  </Button>
                </Link>
              </>
            )}
            {isPengguna && (
              <Link href="/cases">
                <Button type="button">Buat Asesmen</Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {isPengguna && (
          <Card>
            <CardHeader
              title="Asesmen Terbaru"
              description="Riwayat asesmen yang terakhir dibuat."
              action={
                <Link href="/cases">
                  <Button type="button" variant="secondary">
                    Lihat Semua
                  </Button>
                </Link>
              }
              className="items-center gap-4"
            />
            <CardContent className="grid gap-3">
              {latestCases.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                Belum ada asesmen. Mulai dengan membuat asesmen baru.
                </div>
              ) : (
                latestCases.map((caseItem) => (
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3"
                    key={caseItem.id_case}
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{caseItem.nama_asesi}</div>
                      <div className="text-sm text-slate-500">{formatDate(caseItem.created_at)}</div>
                    </div>
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
                      {getCaseResult(caseItem)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card>
            <CardHeader
              title="Kesiapan Asesmen"
              description="Data utama yang digunakan untuk proses penilaian."
            />
            <CardContent className="grid gap-3 md:grid-cols-3">
              {[
                ["Variabel", adminStats.variables, "Indikator yang akan dinilai"],
                ["Kategori", adminStats.categories, "Kelompok hasil asesmen"],
                ["Aturan", adminStats.rules, "Aturan untuk rekomendasi"],
              ].map(([label, value, description]) => (
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4" key={label}>
                  <div className="text-sm font-semibold text-slate-500">{label}</div>
                  <div className="mt-2 text-2xl font-bold text-slate-950">{value}</div>
                  <div className="mt-1 text-sm text-slate-500">{description}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {isSuperAdmin && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Database Manager"
                description="Akses cepat CRUD data sistem untuk super admin."
                action={
                  <Link href="/database">
                    <Button type="button">
                      <Database className="mr-2 h-4 w-4" />
                      Buka Database
                    </Button>
                  </Link>
                }
                className="items-center gap-4"
              />
            </Card>

            <Card>
              <CardHeader
                title="Pengguna Terbaru"
                description="Akun terbaru yang terdaftar."
                action={
                  <Link href="/users">
                    <Button type="button" variant="secondary">
                      Kelola
                    </Button>
                  </Link>
                }
                className="items-center gap-4"
              />
              <CardContent className="grid gap-3">
                {latestUsers.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                    Belum ada pengguna.
                  </div>
                ) : (
                  latestUsers.map((item) => (
                    <div
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3"
                      key={item.id_user}
                    >
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-900">{item.nama_lengkap}</div>
                        <div className="truncate text-sm text-slate-500">{item.email}</div>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {getRoleName(item.role)}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                title="Organisasi"
                description="Instansi yang sudah terdaftar."
                action={
                  <Link href="/organizations">
                    <Button type="button" variant="secondary">
                      Kelola
                    </Button>
                  </Link>
                }
                className="items-center gap-4"
              />
              <CardContent className="grid gap-3">
                {latestOrganizations.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                    Belum ada organisasi.
                  </div>
                ) : (
                  latestOrganizations.map((item) => (
                    <div
                      className="rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3"
                      key={item.id_organisasi}
                    >
                      <div className="font-semibold text-slate-900">{item.instansi}</div>
                      <div className="text-sm text-slate-500">
                        {item.tipe} - {item.alamat}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
