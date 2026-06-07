"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";
import type { RegisterPayload } from "@/services/authService";
import type { Organization } from "@/services/organizationService";

export function UserForm({
  hideRole = false,
  onChange,
  onSubmit,
  organizations = [],
  passwordRequired = true,
  submitLabel = "Simpan",
  value,
}: {
  hideRole?: boolean;
  onChange: (value: RegisterPayload) => void;
  onSubmit: () => void;
  organizations?: Organization[];
  passwordRequired?: boolean;
  submitLabel?: string;
  value: RegisterPayload;
}) {
  const needsOrganization = value.role !== "SUPER_ADMIN";

  return (
    <form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
      <Field htmlFor="nama_lengkap" label="Nama Lengkap">
        <Input id="nama_lengkap" value={value.nama_lengkap} onChange={(event) => onChange({ ...value, nama_lengkap: event.target.value })} required />
      </Field>
      <Field htmlFor="username" label="Username">
        <Input id="username" value={value.username} onChange={(event) => onChange({ ...value, username: event.target.value })} required />
      </Field>
      <Field htmlFor="email" label="Email">
        <Input id="email" type="email" value={value.email} onChange={(event) => onChange({ ...value, email: event.target.value })} required />
      </Field>
      <Field htmlFor="password" label="Password">
        <Input
          id="password"
          type="password"
          value={value.password}
          onChange={(event) => onChange({ ...value, password: event.target.value })}
          required={passwordRequired}
        />
      </Field>
      {!hideRole && (
        <Field htmlFor="role" label="Role">
          <Select
            id="role"
            value={value.role}
            onChange={(event) => {
              const role = event.target.value as RegisterPayload["role"];
              onChange({
                ...value,
                role,
                id_organisasi: role === "SUPER_ADMIN" ? null : value.id_organisasi,
              });
            }}
          >
            <option value="PENGGUNA">Pengguna</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </Select>
        </Field>
      )}
      {needsOrganization && (
        <Field htmlFor="id_organisasi" label="Organisasi">
          <Select
            id="id_organisasi"
            value={value.id_organisasi || ""}
            onChange={(event) =>
              onChange({ ...value, id_organisasi: Number(event.target.value) })
            }
            required
          >
            <option value="">Pilih organisasi</option>
            {organizations.map((organization) => (
              <option
                key={organization.id_organisasi}
                value={organization.id_organisasi}
              >
                {organization.instansi}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
