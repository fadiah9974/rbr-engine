"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { ruleOperatorLabels, ruleOperatorOptions } from "@/lib/ruleOperator";
import type { Category } from "@/services/categoryService";
import type { RuleOperator, RulePayload } from "@/services/ruleService";
import type { Variable } from "@/services/variableService";

function isBooleanVariable(variable?: Variable) {
  return variable?.tipe_variabel === "boolean";
}

function getValueType(variable?: Variable) {
  if (!variable) return "Pilih variabel";
  if (variable.tipe_variabel === "boolean") return "Pilih Ya/Tidak";
  return "Isi angka score";
}

function getNumberValue(value: string) {
  return value && !Number.isNaN(Number(value)) ? value : "";
}

export function RuleForm({
  categories,
  onChange,
  onSubmit,
  value,
  variables,
}: {
  categories: Category[];
  onChange: (value: RulePayload) => void;
  onSubmit: () => void;
  value: RulePayload;
  variables: Variable[];
}) {
  function updateDetail(index: number, idVariabel: number, nilai = "") {
    const selectedVariable = variables.find((variable) => variable.id_variabel === idVariabel);
    const operator: RuleOperator =
      selectedVariable?.tipe_variabel === "boolean" ? "equal" : "greater_than_equal";
    const nextDetails = value.details.map((detail, detailIndex) =>
      detailIndex === index ? { id_variabel: idVariabel, operator, nilai } : detail
    );

    onChange({ ...value, details: nextDetails });
  }

  function updateDetailOperator(index: number, operator: RuleOperator) {
    const nextDetails = value.details.map((detail, detailIndex) =>
      detailIndex === index ? { ...detail, operator } : detail
    );

    onChange({ ...value, details: nextDetails });
  }

  function updateDetailValue(index: number, nilai: string) {
    const nextDetails = value.details.map((detail, detailIndex) =>
      detailIndex === index ? { ...detail, nilai } : detail
    );

    onChange({ ...value, details: nextDetails });
  }

  function addDetail() {
    onChange({
      ...value,
      details: [...value.details, { id_variabel: 0, operator: "greater_than_equal", nilai: "" }],
    });
  }

  function removeDetail(index: number) {
    const nextDetails = value.details.filter((_, detailIndex) => detailIndex !== index);
    onChange({
      ...value,
      details:
        nextDetails.length > 0
          ? nextDetails
          : [{ id_variabel: 0, operator: "greater_than_equal", nilai: "" }],
    });
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <section className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Kategori Rule</h3>
          <p className="mt-1 text-sm text-slate-500">
            Pilih kategori hasil yang akan keluar saat semua kondisi terpenuhi.
          </p>
        </div>
          <Field htmlFor="id_kategori" label="Kategori">
            <Select
              id="id_kategori"
              value={value.id_kategori || ""}
              onChange={(event) => onChange({ ...value, id_kategori: Number(event.target.value) })}
              required
            >
              <option value="">Pilih kategori</option>
              {categories.map((category) => (
                <option key={category.id_kategori} value={category.id_kategori}>
                  {category.nama_kategori}
                </option>
              ))}
            </Select>
          </Field>
      </section>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Detail Rule</h3>
            <p className="mt-1 text-sm text-slate-500">
              Semua baris kondisi akan diproses sebagai logika AND.
            </p>
          </div>
            <Button type="button" variant="secondary" size="sm" onClick={addDetail}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Baris
            </Button>
        </div>
        <div className="grid gap-3">
          {value.details.map((detail, index) => {
            const selectedVariable = variables.find(
              (variable) => variable.id_variabel === Number(detail.id_variabel)
            );

            return (
              <div
                className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 md:grid-cols-[1fr_220px_1fr_auto]"
                key={`${index}-${detail.id_variabel}`}
              >
                <Field htmlFor={`id_variabel_${index}`} label="Variabel">
                  <Select
                    id={`id_variabel_${index}`}
                    value={detail.id_variabel || ""}
                    onChange={(event) => updateDetail(index, Number(event.target.value))}
                    required
                  >
                    <option value="">Pilih variabel</option>
                    {variables.map((variable) => (
                      <option key={variable.id_variabel} value={variable.id_variabel}>
                        {variable.nama_variabel}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field htmlFor={`operator_${index}`} label="Operator">
                  {isBooleanVariable(selectedVariable) ? (
                    <Select id={`operator_${index}`} value="equal" disabled>
                      <option value="equal">Sama dengan</option>
                    </Select>
                  ) : (
                    <Select
                      id={`operator_${index}`}
                      value={detail.operator}
                      onChange={(event) =>
                        updateDetailOperator(index, event.target.value as RuleOperator)
                      }
                      required
                    >
                      {ruleOperatorOptions.map((operator) => (
                        <option key={operator} value={operator}>
                          {ruleOperatorLabels[operator]}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>

                <Field htmlFor={`nilai_${index}`} label={getValueType(selectedVariable)}>
                  {isBooleanVariable(selectedVariable) ? (
                    <Select
                      id={`nilai_${index}`}
                      value={detail.nilai}
                      onChange={(event) => updateDetailValue(index, event.target.value)}
                      required
                    >
                      <option value="">Pilih jawaban</option>
                      <option value="ya">Ya</option>
                      <option value="tidak">Tidak</option>
                    </Select>
                  ) : (
                    <div className="grid gap-1">
                      <Input
                        id={`nilai_${index}`}
                        type="number"
                        value={getNumberValue(detail.nilai)}
                        onChange={(event) => updateDetailValue(index, event.target.value)}
                        placeholder="Contoh: 60"
                        required
                      />
                      {detail.nilai && Number.isNaN(Number(detail.nilai)) && (
                        <span className="text-xs text-red-600">
                          Nilai score harus angka.
                        </span>
                      )}
                    </div>
                  )}
                </Field>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeDetail(index)}
                    title="Hapus kondisi"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Rekomendasi</h3>
          <p className="mt-1 text-sm text-slate-500">
            Teks yang ditampilkan saat rule cocok.
          </p>
        </div>
          <Field htmlFor="rekomendasi" label="Rekomendasi">
            <Textarea
              id="rekomendasi"
              value={value.rekomendasi}
              onChange={(event) => onChange({ ...value, rekomendasi: event.target.value })}
              placeholder="Isi rekomendasi yang keluar jika rule cocok"
            />
          </Field>
      </section>

      <div className="flex justify-end">
        <Button type="submit">Simpan</Button>
      </div>
    </form>
  );
}
