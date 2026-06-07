import { api } from "./api";

export type DatabaseField = {
  name: string;
  type: "string" | "text" | "number" | "boolean" | "enum" | "password";
  options?: string[];
  required?: boolean;
  requiredOnCreate?: boolean;
  nullable?: boolean;
  hiddenInTable?: boolean;
};

export type DatabaseTable = {
  key: string;
  label: string;
  idField: string;
  fields: DatabaseField[];
};

export type DatabaseRow = Record<string, string | number | boolean | null>;

export function getDatabaseTables(token: string) {
  return api<DatabaseTable[]>("/database/tables", { token });
}

export function getDatabaseRows(table: string, token: string) {
  return api<DatabaseRow[]>(`/database/${table}`, { token });
}

export function createDatabaseRow(
  table: string,
  payload: Record<string, unknown>,
  token: string
) {
  return api<DatabaseRow>(`/database/${table}`, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateDatabaseRow(
  table: string,
  id: string | number,
  payload: Record<string, unknown>,
  token: string
) {
  return api<DatabaseRow>(`/database/${table}/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteDatabaseRow(
  table: string,
  id: string | number,
  token: string
) {
  return api(`/database/${table}/${id}`, {
    method: "DELETE",
    token,
  });
}
