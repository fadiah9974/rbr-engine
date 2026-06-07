"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { CategoryForm } from "@/components/forms/CategoryForm";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { createCategory, type CategoryPayload } from "@/services/categoryService";

const emptyCategory: CategoryPayload = { nama_kategori: "" };

export default function CreateCategoryPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [form, setForm] = useState(emptyCategory);

  async function handleSubmit() {
    await createCategory(form, token);
    router.push("/categories");
  }

  return (
    <AppShell allowedRoles={["ADMIN"]}>
      <Card>
        <CardHeader
          title="Tambah Kategori"
          description="Buat kategori hasil yang akan dipakai oleh rule engine."
        />
        <CardContent>
          <CategoryForm value={form} onChange={setForm} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
