"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { CategoryForm } from "@/components/forms/CategoryForm";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/helper";
import {
  getCategoryById,
  updateCategory,
  type CategoryPayload,
} from "@/services/categoryService";
import { ApiError } from "@/services/api";

const emptyCategory: CategoryPayload = {
  nama_kategori: "",
};

export default function EditCategoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const [form, setForm] = useState<CategoryPayload>(emptyCategory);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const id = Number(params.id);

  useEffect(() => {
    if (!token || !id) return;

    setLoading(true);
    setMessage("");

    getCategoryById(id, token)
      .then((item) => {
        setForm({
          nama_kategori: item.nama_kategori,
        });
      })
      .catch((error) => {
        if (error instanceof ApiError && [403, 404].includes(error.status)) {
          router.replace("/categories");
          return;
        }

        setMessage(getErrorMessage(error, "Gagal memuat kategori"));
      })
      .finally(() => setLoading(false));
  }, [id, router, token]);

  async function handleSubmit() {
    if (!token) return;

    try {
      await updateCategory(id, form, token);
      router.push("/categories");
    } catch (error) {
      setMessage(getErrorMessage(error, "Gagal memperbarui kategori"));
    }
  }

  return (
    <AppShell allowedRoles={["ADMIN"]}>
      <Card>
        <CardHeader
          title="Edit Kategori"
          description="Perbarui kategori hasil untuk rule engine."
        />
        <CardContent>
          {message && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {message}
            </div>
          )}

          {loading ? (
            <Loader />
          ) : (
            <CategoryForm value={form} onChange={setForm} onSubmit={handleSubmit} />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
