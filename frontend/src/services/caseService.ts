import { api } from "./api";
import { createFormData } from "@/lib/formData";
import type { Category } from "./categoryService";
import type { Organization } from "./organizationService";
import type { Rule } from "./ruleService";
import type { User } from "./authService";
import type { Variable } from "./variableService";

export type CaseAnswer = {
  id_case_answer: number;
  id_case: number;
  id_variabel: number;
  nilai: string;
  variabel: Variable;
};

export type CaseResult = {
  id_case_result: number;
  id_case: number;
  id_rule?: number | null;
  id_kategori?: number | null;
  rekomendasi?: string | null;
  kategori?: Category | null;
  rule?: Rule | null;
};

export type CaseItem = {
  id_case: number;
  id_user: number;
  id_organisasi?: number | null;
  id_rule?: number | null;
  id_kategori?: number | null;
  nama_asesi: string;
  rekomendasi?: string | null;
  created_at: string;
  user: Pick<User, "id_user" | "nama_lengkap" | "email">;
  organisasi?: Organization | null;
  rule?: Rule | null;
  kategori?: Category | null;
  results: CaseResult[];
  answers: CaseAnswer[];
};

export type CaseAnswerPayload = {
  id_variabel: number;
  nilai: string;
};

export type CasePayload = {
  nama_asesi: string;
  id_organisasi?: number;
  answers: CaseAnswerPayload[];
};

function toCaseFormData(payload: CasePayload) {
  return createFormData({
    nama_asesi: payload.nama_asesi,
    answers: JSON.stringify(payload.answers),
  });
}

export function getCases(token: string) {
  return api<CaseItem[]>("/cases", { token });
}

export function createCase(payload: CasePayload, token: string) {
  return api<CaseItem>("/cases", {
    method: "POST",
    token,
    body: toCaseFormData(payload),
  });
}

export function deleteCase(id: number, token: string) {
  return api(`/cases/${id}`, { method: "DELETE", token });
}
