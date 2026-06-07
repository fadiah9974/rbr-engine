"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { Table } from "@/components/ui/Table";
import { useAuth } from "@/hooks/useAuth";
import { deleteCategory, getCategories, type Category } from "@/services/categoryService";

export default function CategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (token) getCategories(token).then(setCategories).catch(() => setCategories([]));
  }, [token]);

  async function handleDelete(id: number) {
    if (!token) return;

    await deleteCategory(id, token);
    setCategories(await getCategories(token));
  }

  return (
    <AppShell allowedRoles={["ADMIN"]}>
      <Card>
        <CardHeader
          title="Categories"
          description="Kelola kategori hasil untuk rule engine."
          action={<Link href="/categories/create"><Button type="button">Tambah Kategori</Button></Link>}
          className="items-center gap-4"
        />
        {categories.length === 0 ? (
          <CardContent>
            <Loader text="Belum ada kategori." />
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <Table headers={["Nama", "Aksi"]}>
              {categories.map((item) => (
                <tr className="transition-colors hover:bg-slate-50/70" key={item.id_kategori}>
                  <td className="px-4 py-4 font-medium text-slate-900">{item.nama_kategori}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/categories/edit/${item.id_kategori}`}>
                        <Button type="button" variant="secondary">Edit</Button>
                      </Link>
                      <Button type="button" variant="danger" onClick={() => handleDelete(item.id_kategori)}>
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
