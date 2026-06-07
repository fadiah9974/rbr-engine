"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { UserForm } from "@/components/forms/UserForm";
import { useAuth } from "@/hooks/useAuth";
import type { RegisterPayload } from "@/services/authService";
import { createAdminUser } from "@/services/userService";
import {
  getOrganizations,
  type Organization,
} from "@/services/organizationService";

const emptyAdmin: RegisterPayload = {
  email: "",
  id_organisasi: null,
  nama_lengkap: "",
  password: "",
  role: "ADMIN",
  username: "",
};

export default function CreateAdminUserPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [form, setForm] = useState(emptyAdmin);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    if (!token) return;

    getOrganizations(token).then(setOrganizations).catch(() => setOrganizations([]));
  }, [token]);

  async function handleSubmit() {
    await createAdminUser(form, token);
    router.push("/users");
  }

  return (
    <AppShell>
      <Card>
        <CardHeader
          title="Input Admin Pengguna"
          description="Tambahkan admin yang dapat mengelola rule, kategori, dan variabel."
        />
        <CardContent>
          <UserForm
            hideRole
            organizations={organizations}
            value={form}
            onChange={setForm}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </AppShell>
  );
}
