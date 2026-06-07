import type { Variable } from "@/services/variableService";

export const variableTypeOptions = [
  "boolean",
  "number",
] as const satisfies readonly Variable["tipe_variabel"][];

export const variableTypeLabels: Record<Variable["tipe_variabel"], string> = {
  boolean: "Ya / Tidak",
  number: "Score",
};

export function getVariableTypeLabel(type: Variable["tipe_variabel"]) {
  return variableTypeLabels[type];
}
