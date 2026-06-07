"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RuleForm } from "@/components/forms/RuleForm";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/hooks/useAuth";
import { getCategories, type Category } from "@/services/categoryService";
import { createRule, type RulePayload } from "@/services/ruleService";
import { getVariables, type Variable } from "@/services/variableService";

const emptyRule: RulePayload = {
  id_kategori: 0,
  rekomendasi: "",
  details: [{ id_variabel: 0, operator: "greater_than_equal", nilai: "" }],
};

export default function CreateRulePage() {
  const router = useRouter();
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<RulePayload>(emptyRule);
  const [loading, setLoading] = useState(true);
  const [variables, setVariables] = useState<Variable[]>([]);

  useEffect(() => {
    if (!token) return;

    Promise.all([getCategories(token), getVariables(token)])
      .then(([categoryItems, variableItems]) => {
        setCategories(categoryItems);
        setVariables(variableItems);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit() {
    await createRule(form, token);
    router.push("/rules");
  }

  return (
    <AppShell allowedRoles={["ADMIN"]}>
      <Card>
        <CardHeader
          title="Tambah Rule"
          description="Susun kondisi dan rekomendasi untuk rule engine."
        />
        <CardContent>
          {loading ? (
            <Loader />
          ) : (
            <RuleForm
              categories={categories}
              value={form}
              variables={variables}
              onChange={setForm}
              onSubmit={handleSubmit}
            />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
