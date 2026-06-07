"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { Table } from "@/components/ui/Table";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/helper";
import { getRoleLabel } from "@/lib/role";
import type { User } from "@/services/authService";
import { deleteUser, getUsers } from "@/services/userService";

export default function UsersPage() {
  const { token, user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const isAdmin = currentUser?.role === "ADMIN";

  async function loadUsers() {
    if (!token) return;

    setLoading(true);
    setMessage("");

    try {
      const data = await getUsers(token);
      setUsers(data);
    } catch (error) {
      setMessage(getErrorMessage(error, "Gagal memuat data user"));
    } finally {
      setLoading(false);
    }
  }

  function canEditTargetUser(targetUser: User) {
    if (!currentUser) return false;

    if (isSuperAdmin) {
      return true;
    }

    if (
      isAdmin &&
      targetUser.role === "PENGGUNA" &&
      targetUser.id_organisasi === currentUser.id_organisasi
    ) {
      return true;
    }

    return false;
  }

  function canDeleteTargetUser(targetUser: User) {
    if (!currentUser) return false;

    const isCurrentUser = targetUser.id_user === currentUser.id_user;

    if (isCurrentUser) {
      return false;
    }

    if (isSuperAdmin) {
      return true;
    }

    if (
      isAdmin &&
      targetUser.role === "PENGGUNA" &&
      targetUser.id_organisasi === currentUser.id_organisasi
    ) {
      return true;
    }

    return false;
  }

  async function handleDelete(id: number) {
    if (!token) return;

    const targetUser = users.find((item) => item.id_user === id);

    if (!targetUser) {
      setMessage("User tidak ditemukan.");
      return;
    }

    if (!canDeleteTargetUser(targetUser)) {
      setMessage("Akses ditolak. Anda tidak memiliki izin menghapus user ini.");
      return;
    }

    const confirmed = window.confirm(
      "Yakin ingin menghapus user ini? Tindakan ini tidak bisa dibatalkan."
    );

    if (!confirmed) return;

    setDeletingId(id);
    setMessage("");

    try {
      await deleteUser(id, token);
      await loadUsers();
    } catch (error) {
      setMessage(getErrorMessage(error, "Gagal menghapus user"));
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <AppShell allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
      <Card>
        <CardHeader
          title="Users"
          description={
            isSuperAdmin
              ? "Kelola akun pengguna, admin, dan super admin."
              : "Kelola akun pengguna dalam organisasi Anda."
          }
          action={
            <div className="flex flex-wrap justify-end gap-2">
              <Link href="/users/create">
                <Button type="button" variant="secondary">
                  Buat Akun Pengguna
                </Button>
              </Link>

              {isSuperAdmin && (
                <>
                  <Link href="/users/create-admin">
                    <Button type="button">Buat Akun Admin</Button>
                  </Link>

                  <Link href="/users/create-super-admin">
                    <Button type="button" variant="secondary">
                      Buat Super Admin
                    </Button>
                  </Link>
                </>
              )}
            </div>
          }
          className="items-center gap-4"
        />

        {message && (
          <CardContent className="pb-0">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {message}
            </div>
          </CardContent>
        )}

        {loading ? (
          <CardContent>
            <Loader />
          </CardContent>
        ) : users.length === 0 ? (
          <CardContent>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              Belum ada user yang bisa ditampilkan.
            </div>
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <Table
              headers={[
                "Nama",
                "Username",
                "Email",
                "Role",
                "Organisasi",
                "Aksi",
              ]}
            >
              {users.map((user) => {
                const canEditUser = canEditTargetUser(user);
                const canDeleteUser = canDeleteTargetUser(user);

                return (
                  <tr
                    className="transition-colors hover:bg-slate-50/70"
                    key={user.id_user}
                  >
                    <td className="px-4 py-4 font-medium text-slate-900">
                      {user.nama_lengkap}
                    </td>

                    <td className="px-4 py-4">{user.username}</td>

                    <td className="px-4 py-4">{user.email}</td>

                    <td className="px-4 py-4">{getRoleLabel(user.role)}</td>

                    <td className="px-4 py-4">
                      {user.organisasi?.instansi || "-"}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {canEditUser ? (
                          <Link href={`/users/edit/${user.id_user}`}>
                            <Button type="button" variant="secondary">
                              Edit
                            </Button>
                          </Link>
                        ) : (
                          <Button type="button" variant="secondary" disabled>
                            Edit
                          </Button>
                        )}

                        {canDeleteUser && (
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => handleDelete(user.id_user)}
                            disabled={deletingId === user.id_user}
                            isLoading={deletingId === user.id_user}
                          >
                            Hapus
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </Table>
          </CardContent>
        )}
      </Card>
    </AppShell>
  );
}