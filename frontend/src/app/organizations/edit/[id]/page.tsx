"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { OrganizationForm } from "@/components/forms/OrganizationForm";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/hooks/useAuth";
import {
  getOrganizations,
  updateOrganization,
  type OrganizationPayload,
} from "@/services/organizationService";

const emptyOrganization: OrganizationPayload = {
  alamat: "",
  instansi: "",
  tipe: "",
};

export default function EditOrganizationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const [form, setForm] = useState<OrganizationPayload>(emptyOrganization);
  const [loading, setLoading] = useState(true);
  const id = Number(params.id);

  useEffect(() => {
    if (!token || !id) return;

    getOrganizations(token)
      .then((items) => {
        const item = items.find((organization) => organization.id_organisasi === id);
        if (item) {
          setForm({
            alamat: item.alamat,
            instansi: item.instansi,
            tipe: item.tipe,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id, token]);

  async function handleSubmit() {
    await updateOrganization(id, form, token);
    router.push("/organizations");
  }

  return (
    <AppShell>
      <Card>
        <CardHeader
          title="Edit Organisasi"
          description="Perbarui data instansi yang terhubung dengan pengguna."
        />
        <CardContent>
          {loading ? (
            <Loader />
          ) : (
            <OrganizationForm value={form} onChange={setForm} onSubmit={handleSubmit} />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
