"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CaseForm } from "@/components/forms/CaseForm";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { Table } from "@/components/ui/Table";
import { useAuth } from "@/hooks/useAuth";
import {
  createCase,
  deleteCase,
  getCases,
  type CaseItem,
  type CasePayload,
} from "@/services/caseService";
import { getVariables, type Variable } from "@/services/variableService";

const emptyCase: CasePayload = {
  nama_asesi: "",
  answers: [],
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getCaseResults(caseItem: CaseItem) {
  if (caseItem.results.length > 0) return caseItem.results;

  if (caseItem.kategori || caseItem.rekomendasi) {
    return [
      {
        id_case_result: caseItem.id_case,
        id_case: caseItem.id_case,
        id_rule: caseItem.id_rule,
        id_kategori: caseItem.id_kategori,
        kategori: caseItem.kategori,
        rule: caseItem.rule,
        rekomendasi: caseItem.rekomendasi,
      },
    ];
  }

  return [];
}

function renderCaseResults(caseItem: CaseItem) {
  const results = getCaseResults(caseItem);

  if (results.length === 0) return "Belum ada rule yang cocok";

  return (
    <div className="grid gap-2">
      {results.map((item) => (
        <div key={item.id_case_result} className="grid gap-0.5">
          <strong>{item.kategori?.nama_kategori || "Tidak cocok"}</strong>
          <span>{item.rekomendasi || "-"}</span>
        </div>
      ))}
    </div>
  );
}

export default function CasesPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [form, setForm] = useState<CasePayload>(emptyCase);
  const [variablesLoading, setVariablesLoading] = useState(true);
  const [casesLoading, setCasesLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<CaseItem | null>(null);
  const [variables, setVariables] = useState<Variable[]>([]);
  const isPengguna = user?.role === "PENGGUNA";

  useEffect(() => {
    if (user && !isPengguna) {
      router.push("/dashboard");
    }
  }, [isPengguna, router, user]);

  useEffect(() => {
    if (!token || !isPengguna) return;

    setVariablesLoading(true);

    getVariables(token)
      .then((variableItems) => {
        const answers = variableItems.map((variable) => ({
          id_variabel: variable.id_variabel,
          nilai: "",
        }));

        setVariables(variableItems);
        setForm({ ...emptyCase, answers });
      })
      .catch(() => {
        setVariables([]);
      })
      .finally(() => setVariablesLoading(false));
  }, [isPengguna, token]);

  async function loadCaseHistory() {
    if (!token) return;

    setCasesLoading(true);

    try {
      setCases(await getCases(token));
      setHistoryLoaded(true);
    } finally {
      setCasesLoading(false);
    }
  }

  async function toggleHistory() {
    const nextVisible = !historyVisible;

    setHistoryVisible(nextVisible);

    if (nextVisible && !historyLoaded) {
      await loadCaseHistory();
    }
  }

  async function refreshCases() {
    if (!historyLoaded) return;

    await loadCaseHistory();
  }

  async function handleSubmit() {
    if (!token) return;

    setSaving(true);
    try {
      const createdCase = await createCase(form, token);
      const answers = variables.map((variable) => ({
        id_variabel: variable.id_variabel,
        nilai: "",
      }));

      setResult(createdCase);
      setForm({ ...emptyCase, answers });
      await refreshCases();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;

    await deleteCase(id, token);
    await refreshCases();
  }

  return (
    <AppShell>
      <div className="grid gap-5">
        <Card>
          <CardHeader
            title="Asesmen"
            description="Isi data dan jawaban untuk melihat hasil penilaian."
          />
          <CardContent>
            {variablesLoading ? (
              <Loader />
            ) : (
              <CaseForm
                loading={saving}
                value={form}
                variables={variables}
                onChange={setForm}
                onSubmit={handleSubmit}
              />
            )}
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader title="Hasil Asesmen" />
            <CardContent>
              <div className="grid gap-1 text-sm text-slate-700">
                <div>
                  Nama Asesi: <strong>{result.nama_asesi}</strong>
                </div>
                <div>
                  Organisasi:{" "}
                  <strong>{result.organisasi?.instansi || "Tidak ada"}</strong>
                </div>
                <div>
                  Hasil: {renderCaseResults(result)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader
            title="Riwayat Asesmen"
            description="Daftar asesmen yang pernah diproses."
            action={
              <Button type="button" variant="secondary" onClick={toggleHistory}>
                {historyVisible ? "Sembunyikan" : "Lihat Riwayat"}
              </Button>
            }
            className="items-center gap-4"
          />
          {historyVisible && casesLoading ? (
            <CardContent className="border-t border-slate-100">
              <Loader text="Memuat riwayat..." />
            </CardContent>
          ) : historyVisible && cases.length === 0 ? (
            <CardContent className="border-t border-slate-100">
              <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                Belum ada riwayat asesmen.
              </div>
            </CardContent>
          ) : historyVisible ? (
            <CardContent className="p-0">
            <Table
              headers={[
                "Tanggal",
                "Nama Asesi",
                "Organisasi",
                ...(isPengguna ? [] : ["Pengguna"]),
                "Hasil",
                ...(isPengguna ? [] : ["Aksi"]),
              ]}
            >
              {cases.map((caseItem) => (
                <tr className="transition-colors hover:bg-slate-50/70" key={caseItem.id_case}>
                  <td className="px-4 py-4">{formatDate(caseItem.created_at)}</td>
                  <td className="px-4 py-4 font-semibold text-slate-900">
                    {caseItem.nama_asesi}
                  </td>
                  <td className="px-4 py-4">
                    {caseItem.organisasi?.instansi || "-"}
                  </td>
                  {!isPengguna && (
                    <td className="px-4 py-4">{caseItem.user.nama_lengkap}</td>
                  )}
                  <td className="max-w-sm px-4 py-4">
                    {renderCaseResults(caseItem)}
                  </td>
                  {!isPengguna && (
                    <td className="px-4 py-4">
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => handleDelete(caseItem.id_case)}
                      >
                        Hapus
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </Table>
            </CardContent>
          ) : (
            <CardContent className="border-t border-slate-100">
              <div className="text-sm text-slate-500">
                Riwayat disembunyikan agar pengisian asesmen tetap ringan.
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
