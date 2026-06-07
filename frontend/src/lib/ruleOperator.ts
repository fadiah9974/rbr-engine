import type { RuleOperator } from "@/services/ruleService";

export const ruleOperatorOptions = [
  "equal",
  "less_than",
  "greater_than",
  "less_than_equal",
  "greater_than_equal",
] as const satisfies readonly RuleOperator[];

export const ruleOperatorLabels: Record<RuleOperator, string> = {
  equal: "Sama dengan",
  less_than: "Lebih kecil dari",
  greater_than: "Lebih besar dari",
  less_than_equal: "Lebih kecil sama dengan",
  greater_than_equal: "Lebih besar sama dengan",
};

export const ruleOperatorSymbols: Record<RuleOperator, string> = {
  equal: "=",
  less_than: "<",
  greater_than: ">",
  less_than_equal: "<=",
  greater_than_equal: ">=",
};
