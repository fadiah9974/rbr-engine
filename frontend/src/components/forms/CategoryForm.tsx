"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import type { CategoryPayload } from "@/services/categoryService";

export function CategoryForm({
  onChange,
  onSubmit,
  value,
}: {
  onChange: (value: CategoryPayload) => void;
  onSubmit: () => void;
  value: CategoryPayload;
}) {
  return (
    <form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
      <Field htmlFor="nama_kategori" label="Nama Kategori">
        <Input id="nama_kategori" value={value.nama_kategori} onChange={(event) => onChange({ ...value, nama_kategori: event.target.value })} required />
      </Field>
      <Button type="submit">Simpan</Button>
    </form>
  );
}
