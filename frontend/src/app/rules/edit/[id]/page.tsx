"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RuleForm } from "@/components/forms/RuleForm";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/helper";
import { getCategories, type Category } from "@/services/categoryService";
import {
  getRuleById,
  updateRule,
  type RulePayload,
} from "@/services/ruleService";
import { getVariables, type Variable } from "@/services/variableService";
import { ApiError } from "@/services/api";

const emptyRule: RulePayload = {
  id_kategori: 0,
  rekomendasi: "",
  details: [{ id_variabel: 0, operator: "greater_than_equal", nilai: "" }],
};

export default function EditRulePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<RulePayload>(emptyRule);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [variables, setVariables] = useState<Variable[]>([]);

  const id = Number(params.id);

  useEffect(() => {
    if (!token || !id) return;

    setLoading(true);
    setMessage("");

    Promise.all([getCategories(token), getVariables(token), getRuleById(id, token)])
      .then(([categoryItems, variableItems, rule]) => {
        setCategories(categoryItems);
        setVariables(variableItems);

        setForm({
          id_kategori: rule.id_kategori,
          rekomendasi: rule.rekomendasi || "",
          details: rule.details.map((detail) => ({
            id_variabel: detail.id_variabel,
            operator: detail.operator,
            nilai: detail.nilai,
          })),
        });
      })
      .catch((error) => {
        if (error instanceof ApiError && [403, 404].includes(error.status)) {
          router.replace("/rules");
          return;
        }

        setMessage(getErrorMessage(error, "Gagal memuat rule"));
      })
      .finally(() => setLoading(false));
  }, [id, router, token]);

  async function handleSubmit() {
    if (!token) return;

    try {
      await updateRule(id, form, token);
      router.push("/rules");
    } catch (error) {
      setMessage(getErrorMessage(error, "Gagal memperbarui rule"));
    }
  }

  return (
    <AppShell allowedRoles={["ADMIN"]}>
      <Card>
        <CardHeader
          title="Edit Rule"
          description="Perbarui kondisi dan rekomendasi untuk rule engine."
        />
        <CardContent>
          {message && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {message}
            </div>
          )}

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
