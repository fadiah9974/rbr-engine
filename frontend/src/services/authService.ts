import { api } from "./api";
import { createFormData } from "@/lib/formData";
import type { Organization } from "./organizationService";

export type Role = "SUPER_ADMIN" | "ADMIN" | "PENGGUNA";

export type User = {
  id_user: number;
  username: string;
  nama_lengkap: string;
  role: Role;
  email: string;
  id_organisasi?: number | null;
  organisasi?: Organization | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  username: string;
  nama_lengkap: string;
  id_organisasi?: number | null;
  role?: Role;
};

export function login(payload: LoginPayload) {
  return api<{ token: string; user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterPayload) {
  return api("/auth/register", {
    method: "POST",
    body: createFormData(payload),
  });
}

export function getRegisterOrganizations() {
  return api<Organization[]>("/auth/organizations");
}
