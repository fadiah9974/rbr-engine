"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { VariableForm } from "@/components/forms/VariableForm";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { createVariable, type VariablePayload } from "@/services/variableService";

const emptyVariable: VariablePayload = { deskripsi: "", nama_variabel: "", tipe_variabel: "boolean" };

export default function CreateVariablePage() {
  const router = useRouter();
  const { token } = useAuth();
  const [form, setForm] = useState(emptyVariable);

  async function handleSubmit() {
    await createVariable(form, token);
    router.push("/variables");
  }

  return (
    <AppShell allowedRoles={["ADMIN"]}>
      <Card>
        <CardHeader
          title="Tambah Variabel"
          description="Buat variabel baru yang akan dipakai dalam rule dan case."
        />
        <CardContent>
          <VariableForm value={form} onChange={setForm} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
