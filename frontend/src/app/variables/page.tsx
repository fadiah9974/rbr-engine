"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { Table } from "@/components/ui/Table";
import { useAuth } from "@/hooks/useAuth";
import { getVariableTypeLabel } from "@/lib/variableType";
import { deleteVariable, getVariables, type Variable } from "@/services/variableService";

export default function VariablesPage() {
  const { token } = useAuth();
  const [variables, setVariables] = useState<Variable[]>([]);

  useEffect(() => {
    if (token) getVariables(token).then(setVariables).catch(() => setVariables([]));
  }, [token]);

  async function handleDelete(id: number) {
    if (!token) return;

    await deleteVariable(id, token);
    setVariables(await getVariables(token));
  }

  return (
    <AppShell allowedRoles={["ADMIN"]}>
      <Card>
        <CardHeader
          title="Variables"
          description="Kelola variabel yang dipakai sebagai input rule dan case."
          action={<Link href="/variables/create"><Button type="button">Tambah Variabel</Button></Link>}
          className="items-center gap-4"
        />
        {variables.length === 0 ? (
          <CardContent>
            <Loader text="Belum ada variabel." />
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <Table headers={["Nama", "Tipe", "Deskripsi", "Aksi"]}>
              {variables.map((item) => (
                <tr className="transition-colors hover:bg-slate-50/70" key={item.id_variabel}>
                  <td className="px-4 py-4 font-medium text-slate-900">{item.nama_variabel}</td>
                  <td className="px-4 py-4">{getVariableTypeLabel(item.tipe_variabel)}</td>
                  <td className="px-4 py-4">{item.deskripsi || "-"}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/variables/edit/${item.id_variabel}`}>
                        <Button type="button" variant="secondary">Edit</Button>
                      </Link>
                      <Button type="button" variant="danger" onClick={() => handleDelete(item.id_variabel)}>
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
