"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { Table } from "@/components/ui/Table";
import { useAuth } from "@/hooks/useAuth";
import {
  deleteOrganization,
  getOrganizations,
  type Organization,
} from "@/services/organizationService";

export default function OrganizationsPage() {
  const { token } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    if (token) getOrganizations(token).then(setOrganizations).catch(() => setOrganizations([]));
  }, [token]);

  async function handleDelete(id: number) {
    if (!token) return;

    await deleteOrganization(id, token);
    setOrganizations(await getOrganizations(token));
  }

  return (
    <AppShell>
      <Card>
        <CardHeader
          title="Organisasi"
          description="Data instansi yang terhubung dengan pengguna dan rule engine."
          action={
            <Link href="/organizations/create">
              <Button type="button">Input Organisasi</Button>
            </Link>
          }
          className="items-center gap-4"
        />
        {organizations.length === 0 ? (
          <CardContent>
            <Loader text="Belum ada organisasi." />
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <Table headers={["Instansi", "Tipe", "Alamat", "Aksi"]}>
              {organizations.map((item) => (
                <tr className="transition-colors hover:bg-slate-50/70" key={item.id_organisasi}>
                  <td className="px-4 py-4 font-medium text-slate-900">{item.instansi}</td>
                  <td className="px-4 py-4">{item.tipe}</td>
                  <td className="px-4 py-4">{item.alamat}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/organizations/edit/${item.id_organisasi}`}>
                        <Button type="button" variant="secondary">Edit</Button>
                      </Link>
                      <Button type="button" variant="danger" onClick={() => handleDelete(item.id_organisasi)}>
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </CardContent>
        )}
      </Card>
    </AppShell>
  );
}
