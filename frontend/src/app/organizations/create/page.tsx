"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { OrganizationForm } from "@/components/forms/OrganizationForm";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import {
  createOrganization,
  type OrganizationPayload,
} from "@/services/organizationService";

const emptyOrganization: OrganizationPayload = {
  alamat: "",
  instansi: "",
  tipe: "",
};

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [form, setForm] = useState(emptyOrganization);

  async function handleSubmit() {
    await createOrganization(form, token);
    router.push("/organizations");
  }

  return (
    <AppShell>
      <Card>
        <CardHeader
          title="Input Organisasi"
          description="Tambahkan instansi yang akan terhubung dengan akun pengguna."
        />
        <CardContent>
          <OrganizationForm value={form} onChange={setForm} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
