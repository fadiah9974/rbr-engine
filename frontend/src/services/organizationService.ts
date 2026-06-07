import { api } from "./api";
import { createFormData } from "@/lib/formData";

export type Organization = {
  id_organisasi: number;
  instansi: string;
  tipe: string;
  alamat: string;
};

export type OrganizationPayload = Omit<Organization, "id_organisasi">;

export function getOrganizations(token: string) {
  return api<Organization[]>("/organizations", { token });
}

export function createOrganization(payload: OrganizationPayload, token: string) {
  return api<Organization>("/organizations", {
    method: "POST",
    token,
    body: createFormData(payload),
  });
}

export function updateOrganization(
  id: number,
  payload: OrganizationPayload,
  token: string
) {
  return api(`/organizations/${id}`, {
    method: "PUT",
    token,
    body: createFormData(payload),
  });
}

export function deleteOrganization(id: number, token: string) {
  return api(`/organizations/${id}`, { method: "DELETE", token });
}
