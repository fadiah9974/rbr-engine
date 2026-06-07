import { api, unwrapData, type ApiDataResponse } from "./api";
import { createFormData } from "@/lib/formData";
import type { RegisterPayload, User } from "./authService";

type ApiUserResponse =
  | ApiDataResponse<User>
  | {
      message?: string;
      user: User;
    };

function unwrapUser(response: ApiUserResponse) {
  if (
    response &&
    typeof response === "object" &&
    !Array.isArray(response) &&
    "user" in response
  ) {
    return response.user;
  }

  return unwrapData(response);
}

export function getUsers(token: string) {
  return api<User[]>("/superadmin/users", { token });
}

export function getUserById(id: number, token: string) {
  return api<User>(`/superadmin/users/${id}`, { token });
}

export async function createRegularUser(payload: RegisterPayload, token: string) {
  const response = await api<ApiUserResponse>("/superadmin/users/regular", {
    method: "POST",
    token,
    body: createFormData({ ...payload, role: "PENGGUNA" }),
  });

  return unwrapUser(response);
}

export async function createAdminUser(payload: RegisterPayload, token: string) {
  const response = await api<ApiUserResponse>("/superadmin/users/admin", {
    method: "POST",
    token,
    body: createFormData({ ...payload, role: "ADMIN" }),
  });

  return unwrapUser(response);
}

export async function createSuperAdminUser(
  payload: RegisterPayload,
  token: string
) {
  const response = await api<ApiUserResponse>(
    "/superadmin/users/super-admin",
    {
      method: "POST",
      token,
      body: createFormData({ ...payload, role: "SUPER_ADMIN" }),
    }
  );

  return unwrapUser(response);
}

export async function updateUser(
  id: number,
  payload: RegisterPayload,
  token: string
) {
  const response = await api<ApiUserResponse>(`/superadmin/users/${id}`, {
    method: "PUT",
    token,
    body: createFormData(payload),
  });

  return unwrapUser(response);
}

export function deleteUser(id: number, token: string) {
  return api(`/superadmin/users/${id}`, {
    method: "DELETE",
    token,
  });
}
