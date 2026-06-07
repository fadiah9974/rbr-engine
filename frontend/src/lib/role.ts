import type { Role } from "@/services/authService";

export const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  PENGGUNA: "Pengguna",
  SUPER_ADMIN: "Super Admin",
};

export function getRoleLabel(role: Role) {
  return roleLabels[role];
}
