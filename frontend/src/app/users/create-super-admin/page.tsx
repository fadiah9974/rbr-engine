"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { UserForm } from "@/components/forms/UserForm";
import { useAuth } from "@/hooks/useAuth";
import type { RegisterPayload } from "@/services/authService";
import { createSuperAdminUser } from "@/services/userService";

const emptySuperAdmin: RegisterPayload = {
  email: "",
  nama_lengkap: "",
  password: "",
  role: "SUPER_ADMIN",
  username: "",
};

export default function CreateSuperAdminUserPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [form, setForm] = useState(emptySuperAdmin);

  async function handleSubmit() {
    await createSuperAdminUser(form, token);
    router.push("/users");
  }

  return (
    <AppShell>
      <Card>
        <CardHeader
          title="Buat Akun Super Admin"
          description="Tambahkan akun dengan akses penuh ke data pengguna dan organisasi."
        />
        <CardContent>
          <UserForm hideRole value={form} onChange={setForm} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
