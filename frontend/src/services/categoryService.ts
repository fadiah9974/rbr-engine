import { api, unwrapData, type ApiDataResponse } from "./api";
import { createFormData } from "@/lib/formData";
import type { Organization } from "./organizationService";

export type Category = {
  id_kategori: number;
  nama_kategori: string;
  id_organisasi?: number | null;
  organisasi?: Organization | null;
  created_at?: string;
  updated_at?: string;
};

export type CategoryPayload = Pick<Category, "nama_kategori">;

export function getCategories(token: string) {
  return api<Category[]>("/categories", { token });
}

export function getCategoryById(id: number, token: string) {
  return api<Category>(`/categories/${id}`, { token });
}

export async function createCategory(payload: CategoryPayload, token: string) {
  const response = await api<ApiDataResponse<Category>>("/categories", {
    method: "POST",
    token,
    body: createFormData(payload),
  });

  return unwrapData(response);
}

export async function updateCategory(
  id: number,
  payload: CategoryPayload,
  token: string
) {
  const response = await api<ApiDataResponse<Category>>(`/categories/${id}`, {
    method: "PUT",
    token,
    body: createFormData(payload),
  });

  return unwrapData(response);
}

export function deleteCategory(id: number, token: string) {
  return api(`/categories/${id}`, {
    method: "DELETE",
    token,
  });
}