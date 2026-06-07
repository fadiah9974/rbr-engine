"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { UserForm } from "@/components/forms/UserForm";
import { useAuth } from "@/hooks/useAuth";
import type { RegisterPayload } from "@/services/authService";
import { createRegularUser } from "@/services/userService";
import {
  getOrganizations,
  type Organization,
} from "@/services/organizationService";

const emptyUser: RegisterPayload = {
  email: "",
  id_organisasi: null,
  nama_lengkap: "",
  password: "",
  role: "PENGGUNA",
  username: "",
};

export default function CreateUserPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [form, setForm] = useState(emptyUser);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    if (!token) return;

    getOrganizations(token).then(setOrganizations).catch(() => setOrganizations([]));
  }, [token]);

  async function handleSubmit() {
    await createRegularUser(form, token);
    router.push("/users");
  }

  return (
    <AppShell>
      <Card>
        <CardHeader
          title="Buat Akun Pengguna"
          description="Tambahkan akun pengguna yang dapat membuat dan melihat case."
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
