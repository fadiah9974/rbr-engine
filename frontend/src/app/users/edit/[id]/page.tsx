"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { UserForm } from "@/components/forms/UserForm";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/hooks/useAuth";
import type { RegisterPayload, User } from "@/services/authService";
import {
  getOrganizations,
  type Organization,
} from "@/services/organizationService";
import { getUsers, updateUser } from "@/services/userService";

function toForm(user: User): RegisterPayload {
  return {
    email: user.email,
    id_organisasi: user.id_organisasi || null,
    nama_lengkap: user.nama_lengkap,
    password: "",
    role: user.role,
    username: user.username,
  };
}

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token, user: currentUser } = useAuth();
  const userId = useMemo(() => Number(params.id), [params.id]);
  const [form, setForm] = useState<RegisterPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (!token || !userId) return;

    Promise.all([getUsers(token), getOrganizations(token)])
      .then(([users, organizationItems]) => {
        const selectedUser = users.find((item) => item.id_user === userId);

        if (!selectedUser) {
          router.push("/users");
          return;
        }

        setForm(toForm(selectedUser));
        setOrganizations(organizationItems);
      })
      .finally(() => setLoading(false));
  }, [router, token, userId]);

  async function handleSubmit() {
    if (!token || !form) return;

    await updateUser(userId, form, token);
    router.push("/users");
  }

  return (
    <AppShell>
      <Card>
        <CardHeader
          title="Edit User"
          description="Perbarui profil, role, organisasi, atau password pengguna."
        />
        <CardContent>
          {loading || !form ? (
            <Loader />
          ) : (
            <UserForm
              hideRole={!isSuperAdmin}
              organizations={organizations}
              passwordRequired={false}
              submitLabel="Update"
              value={form}
              onChange={setForm}
              onSubmit={handleSubmit}
            />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
