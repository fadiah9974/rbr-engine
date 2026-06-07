import { api, unwrapData, type ApiDataResponse } from "./api";
import { createFormData } from "@/lib/formData";
import type { Organization } from "./organizationService";

export type Variable = {
  id_variabel: number;
  nama_variabel: string;
  tipe_variabel: "boolean" | "number";
  deskripsi?: string | null;
  id_organisasi?: number | null;
  organisasi?: Organization | null;
  created_at?: string;
  updated_at?: string;
};

export type VariablePayload = {
  nama_variabel: string;
  tipe_variabel: "boolean" | "number";
  deskripsi?: string | null;
};

export function getVariables(token: string) {
  return api<Variable[]>("/variables", { token });
}

export function getVariableById(id: number, token: string) {
  return api<Variable>(`/variables/${id}`, { token });
}

export async function createVariable(payload: VariablePayload, token: string) {
  const response = await api<ApiDataResponse<Variable>>("/variables", {
    method: "POST",
    token,
    body: createFormData(payload),
  });

  return unwrapData(response);
}

export async function updateVariable(
  id: number,
  payload: VariablePayload,
  token: string
) {
  const response = await api<ApiDataResponse<Variable>>(`/variables/${id}`, {
    method: "PUT",
    token,
    body: createFormData(payload),
  });

  return unwrapData(response);
}

export function deleteVariable(id: number, token: string) {
  return api(`/variables/${id}`, {
    method: "DELETE",
    token,
  });
}