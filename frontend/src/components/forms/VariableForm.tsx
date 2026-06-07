"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { variableTypeLabels, variableTypeOptions } from "@/lib/variableType";
import type { VariablePayload } from "@/services/variableService";

export function VariableForm({
  onChange,
  onSubmit,
  value,
}: {
  onChange: (value: VariablePayload) => void;
  onSubmit: () => void;
  value: VariablePayload;
}) {
  return (
    <form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
      <Field htmlFor="nama_variabel" label="Nama Variabel">
        <Input id="nama_variabel" value={value.nama_variabel} onChange={(event) => onChange({ ...value, nama_variabel: event.target.value })} required />
      </Field>
      <Field htmlFor="tipe_variabel" label="Tipe">
        <Select id="tipe_variabel" value={value.tipe_variabel} onChange={(event) => onChange({ ...value, tipe_variabel: event.target.value as VariablePayload["tipe_variabel"] })}>
          {variableTypeOptions.map((type) => (
            <option key={type} value={type}>{variableTypeLabels[type]}</option>
          ))}
        </Select>
      </Field>
      <Field htmlFor="deskripsi" label="Deskripsi">
        <Textarea id="deskripsi" value={value.deskripsi || ""} onChange={(event) => onChange({ ...value, deskripsi: event.target.value })} />
      </Field>
      <Button type="submit">Simpan</Button>
    </form>
  );
}
