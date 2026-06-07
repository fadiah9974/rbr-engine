"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { Table } from "@/components/ui/Table";
import { useAuth } from "@/hooks/useAuth";
import { ruleOperatorSymbols } from "@/lib/ruleOperator";
import { deleteRule, getRules, type Rule } from "@/services/ruleService";

export default function RulesPage() {
  const { token } = useAuth();
  const [rules, setRules] = useState<Rule[]>([]);

  useEffect(() => {
    if (token) getRules(token).then(setRules).catch(() => setRules([]));
  }, [token]);

  async function handleDelete(id: number) {
    if (!token) return;

    await deleteRule(id, token);
    setRules(await getRules(token));
  }

  return (
    <AppShell allowedRoles={["ADMIN"]}>
      <Card>
        <CardHeader
          title="Rules"
          description="Daftar aturan yang dipakai untuk mencocokkan hasil case."
          action={
            <Link href="/rules/create">
              <Button type="button">Tambah Rule</Button>
            </Link>
          }
          className="items-center gap-4"
        />

        {rules.length === 0 ? (
          <CardContent>
            <Loader text="Belum ada rule." />
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <Table headers={["Kategori", "Detail Rule", "Rekomendasi", "Aksi"]}>
              {rules.map((rule) => (
                <tr className="transition-colors hover:bg-slate-50/70" key={rule.id_rule}>
                  <td className="px-4 py-4 font-semibold text-slate-900">
                    {rule.kategori.nama_kategori}
                  </td>
                  <td className="px-4 py-4">
                    <div className="grid gap-1">
                      {rule.details.map((detail) => (
                        <div key={detail.id_rule_detail}>
                          {detail.variabel.nama_variabel}{" "}
                          {ruleOperatorSymbols[detail.operator]}{" "}
                          <strong>{detail.nilai}</strong>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="max-w-xs px-4 py-4">{rule.rekomendasi || "-"}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/rules/edit/${rule.id_rule}`}>
                        <Button type="button" variant="secondary">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => handleDelete(rule.id_rule)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </CardContent>
        )}
      </Card>
    </AppShell>
  );
}
