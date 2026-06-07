import { api, unwrapData, type ApiDataResponse } from "./api";
import { createFormData } from "@/lib/formData";
import type { Category } from "./categoryService";
import type { Variable } from "./variableService";

export type RuleOperator =
  | "equal"
  | "less_than"
  | "greater_than"
  | "less_than_equal"
  | "greater_than_equal";

export type RuleDetail = {
  id_rule_detail: number;
  id_rule: number;
  id_variabel: number;
  operator: RuleOperator;
  nilai: string;
  variabel: Variable;
};

export type Rule = {
  id_rule: number;
  id_kategori: number;
  id_organisasi?: number | null;
  rekomendasi?: string | null;
  kategori: Category;
  details: RuleDetail[];
  created_at?: string;
  updated_at?: string;
};

export type RuleDetailPayload = {
  id_variabel: number;
  operator: RuleOperator;
  nilai: string;
};

export type RulePayload = {
  id_kategori: number;
  rekomendasi: string;
  details: RuleDetailPayload[];
};

function toRuleFormData(payload: RulePayload) {
  return createFormData({
    id_kategori: payload.id_kategori,
    rekomendasi: payload.rekomendasi,
    details: JSON.stringify(payload.details),
  });
}

export function getRules(token: string) {
  return api<Rule[]>("/rules", { token });
}

export function getRuleById(id: number, token: string) {
  return api<Rule>(`/rules/${id}`, { token });
}

export async function createRule(payload: RulePayload, token: string) {
  const response = await api<ApiDataResponse<Rule>>("/rules", {
    method: "POST",
    token,
    body: toRuleFormData(payload),
  });

  return unwrapData(response);
}

export async function updateRule(id: number, payload: RulePayload, token: string) {
  const response = await api<ApiDataResponse<Rule>>(`/rules/${id}`, {
    method: "PUT",
    token,
    body: toRuleFormData(payload),
  });

  return unwrapData(response);
}

export function deleteRule(id: number, token: string) {
  return api(`/rules/${id}`, {
    method: "DELETE",
    token,
  });
}