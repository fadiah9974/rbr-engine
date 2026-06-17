"use client";

import { Activity, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";
import type { CasePayload } from "@/services/caseService";
import type { Variable } from "@/services/variableService";

function getAnswerValue(value: CasePayload, idVariabel: number) {
  return value.answers.find((answer) => answer.id_variabel === idVariabel)?.nilai || "";
}

function getValueLabel(variable: Variable) {
  if (variable.tipe_variabel === "boolean") return "Jawaban";
  return "Score";
}

export function CaseForm({
  loading,
  onChange,
  onSubmit,
  value,
  variables,
}: {
  loading?: boolean;
  onChange: (value: CasePayload) => void;
  onSubmit: () => void;
  value: CasePayload;
  variables: Variable[];
}) {
  function updateAnswer(idVariabel: number, nilai: string) {
    const existingAnswer = value.answers.find((answer) => answer.id_variabel === idVariabel);
    const answers = existingAnswer
      ? value.answers.map((answer) =>
          answer.id_variabel === idVariabel ? { ...answer, nilai } : answer
        )
      : [...value.answers, { id_variabel: idVariabel, nilai }];

    onChange({ ...value, answers });
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-700">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-950">Input Asesmen</h3>
          <p className="text-sm text-slate-500">
            Lengkapi data asesi dan nilai variabel untuk menjalankan rule engine.
          </p>
        </div>
      </div>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Informasi Asesi</h3>
          <p className="mt-1 text-sm text-slate-500">
            Identitas dasar subjek yang sedang dikonsultasikan.
          </p>
        </div>
          <Field htmlFor="nama_asesi" label="Nama Asesi">
            <Input
              id="nama_asesi"
              value={value.nama_asesi}
              onChange={(event) => onChange({ ...value, nama_asesi: event.target.value })}
              placeholder="Contoh: Siswa SD 1"
              required
            />
          </Field>
      </section>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Nilai Variabel</h3>
          <p className="mt-1 text-sm text-slate-500">
            Jawaban ini akan dibandingkan dengan rule yang tersedia.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {variables.map((variable) => (
            <Field
              htmlFor={`case_variable_${variable.id_variabel}`}
              key={variable.id_variabel}
              label={`${variable.nama_variabel} - ${getValueLabel(variable)}`}
            >
              {variable.tipe_variabel === "boolean" ? (
                <Select
                  id={`case_variable_${variable.id_variabel}`}
                  value={getAnswerValue(value, variable.id_variabel)}
                  onChange={(event) => updateAnswer(variable.id_variabel, event.target.value)}
                >
                  <option value="">Pilih jawaban</option>
                  <option value="ya">Ya</option>
                  <option value="tidak">Tidak</option>
                </Select>
              ) : (
                <Input
                  id={`case_variable_${variable.id_variabel}`}
                  type="number"
                  value={getAnswerValue(value, variable.id_variabel)}
                  onChange={(event) => updateAnswer(variable.id_variabel, event.target.value)}
                  placeholder="Contoh: 85"
                />
              )}
            </Field>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <Button disabled={loading || variables.length === 0} isLoading={loading} type="submit">
          {!loading && <CheckCircle2 className="mr-2 h-4 w-4" />}
          {loading ? "Memproses..." : "Cek Kategori"}
        </Button>
      </div>
    </form>
  );
}
