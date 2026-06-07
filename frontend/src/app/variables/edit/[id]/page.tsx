"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { VariableForm } from "@/components/forms/VariableForm";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/helper";
import {
  getVariableById,
  updateVariable,
  type VariablePayload,
} from "@/services/variableService";
import { ApiError } from "@/services/api";

const emptyVariable: VariablePayload = {
  deskripsi: "",
  nama_variabel: "",
  tipe_variabel: "boolean",
};

export default function EditVariablePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const [form, setForm] = useState<VariablePayload>(emptyVariable);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const id = Number(params.id);

  useEffect(() => {
    if (!token || !id) return;

    setLoading(true);
    setMessage("");

    getVariableById(id, token)
      .then((item) => {
        setForm({
          deskripsi: item.deskripsi || "",
          nama_variabel: item.nama_variabel,
          tipe_variabel: item.tipe_variabel,
        });
      })
      .catch((error) => {
        if (error instanceof ApiError && [403, 404].includes(error.status)) {
          router.replace("/variables");
          return;
        }

        setMessage(getErrorMessage(error, "Gagal memuat variabel"));
      })
      .finally(() => setLoading(false));
  }, [id, router, token]);

  async function handleSubmit() {
    if (!token) return;

    try {
      await updateVariable(id, form, token);
      router.push("/variables");
    } catch (error) {
      setMessage(getErrorMessage(error, "Gagal memperbarui variabel"));
    }
  }

  return (
    <AppShell allowedRoles={["ADMIN"]}>
      <Card>
        <CardHeader
          title="Edit Variabel"
          description="Perbarui data variabel yang dipakai oleh rule engine."
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
            <VariableForm value={form} onChange={setForm} onSubmit={handleSubmit} />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
