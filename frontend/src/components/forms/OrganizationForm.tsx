"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import type { OrganizationPayload } from "@/services/organizationService";

export function OrganizationForm({
  onChange,
  onSubmit,
  value,
}: {
  onChange: (value: OrganizationPayload) => void;
  onSubmit: () => void;
  value: OrganizationPayload;
}) {
  return (
    <form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
      <Field htmlFor="instansi" label="Instansi">
        <Input id="instansi" value={value.instansi} onChange={(event) => onChange({ ...value, instansi: event.target.value })} required />
      </Field>
      <Field htmlFor="tipe" label="Tipe">
        <Input id="tipe" value={value.tipe} onChange={(event) => onChange({ ...value, tipe: event.target.value })} placeholder="Contoh: Sekolah, Klinik, Komunitas" required />
      </Field>
      <Field htmlFor="alamat" label="Alamat">
        <Textarea id="alamat" value={value.alamat} onChange={(event) => onChange({ ...value, alamat: event.target.value })} required />
      </Field>
      <Button type="submit">Simpan</Button>
    </form>
  );
}
