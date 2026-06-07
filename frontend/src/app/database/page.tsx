"use client";

import { useEffect, useMemo, useState } from "react";
import { Database, Edit3, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Table, Td, Tr } from "@/components/ui/Table";
import { useAuth } from "@/hooks/useAuth";
import {
  createDatabaseRow,
  deleteDatabaseRow,
  getDatabaseRows,
  getDatabaseTables,
  updateDatabaseRow,
  type DatabaseField,
  type DatabaseRow,
  type DatabaseTable,
} from "@/services/databaseService";

type FormState = Record<string, string | boolean>;

function stringifyValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function getDefaultValue(field: DatabaseField) {
  if (field.name === "status") return true;
  if (field.type === "boolean") return false;
  if (field.type === "enum") return field.options?.[0] || "";
  return "";
}

function buildInitialForm(table: DatabaseTable, row?: DatabaseRow): FormState {
  return table.fields.reduce<FormState>((acc, field) => {
    if (row) {
      const value = row[field.name];
      acc[field.name] = field.type === "boolean" ? value === true : stringifyValue(value);
    } else {
      acc[field.name] = getDefaultValue(field);
    }

    return acc;
  }, {});
}

function formatCell(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function getVisibleColumns(table: DatabaseTable, rows: DatabaseRow[]) {
  const fieldNames = table.fields
    .filter((field) => !field.hiddenInTable)
    .map((field) => field.name);
  const timestampColumns = ["created_at", "updated_at"];
  const rowColumns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const fallbackColumns = [table.idField, ...fieldNames];

  if (rowColumns.length === 0) {
    return fallbackColumns;
  }

  return [table.idField, ...fieldNames, ...timestampColumns].filter(
    (column, index, columns) => rowColumns.includes(column) && columns.indexOf(column) === index
  );
}

function preparePayload(table: DatabaseTable, form: FormState) {
  return table.fields.reduce<Record<string, unknown>>((payload, field) => {
    const value = form[field.name];

    if (field.type === "password" && value === "") return payload;
    payload[field.name] = value;

    return payload;
  }, {});
}

export default function DatabasePage() {
  const { token, user } = useAuth();
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [selectedTableKey, setSelectedTableKey] = useState("");
  const [rows, setRows] = useState<DatabaseRow[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<FormState>({});
  const [editingRow, setEditingRow] = useState<DatabaseRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedTable = tables.find((table) => table.key === selectedTableKey);
  const columns = selectedTable ? getVisibleColumns(selectedTable, rows) : [];
  const filteredRows = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) return rows;

    return rows.filter((row) =>
      Object.values(row).some((value) => stringifyValue(value).toLowerCase().includes(keyword))
    );
  }, [query, rows]);

  const loadTables = async () => {
    if (!token) return;

    setIsLoading(true);
    setError("");

    try {
      const tableItems = await getDatabaseTables(token);
      setTables(tableItems);
      setSelectedTableKey((current) => current || tableItems[0]?.key || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat daftar tabel");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRows = async () => {
    if (!token || !selectedTableKey) return;

    setIsLoading(true);
    setError("");

    try {
      const rowItems = await getDatabaseRows(selectedTableKey, token);
      setRows(rowItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data tabel");
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, [token]);

  useEffect(() => {
    loadRows();
  }, [selectedTableKey, token]);

  const openCreateModal = () => {
    if (!selectedTable) return;
    setEditingRow(null);
    setForm(buildInitialForm(selectedTable));
    setIsModalOpen(true);
  };

  const openEditModal = (row: DatabaseRow) => {
    if (!selectedTable) return;
    setEditingRow(row);
    setForm(buildInitialForm(selectedTable, row));
    setIsModalOpen(true);
  };

  const saveRow = async () => {
    if (!token || !selectedTable) return;

    setIsSaving(true);
    setError("");

    try {
      const payload = preparePayload(selectedTable, form);

      if (editingRow) {
        await updateDatabaseRow(
          selectedTable.key,
          String(editingRow[selectedTable.idField] ?? ""),
          payload,
          token
        );
      } else {
        await createDatabaseRow(selectedTable.key, payload, token);
      }

      setIsModalOpen(false);
      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data");
    } finally {
      setIsSaving(false);
    }
  };

  const removeRow = async (row: DatabaseRow) => {
    if (!token || !selectedTable) return;

    const id = row[selectedTable.idField];
    const confirmed = window.confirm(`Hapus data ${selectedTable.label} dengan ID ${id}?`);

    if (!confirmed) return;

    try {
      await deleteDatabaseRow(selectedTable.key, String(id ?? ""), token);
      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus data");
    }
  };

  if (user && user.role !== "SUPER_ADMIN") {
    return (
      <AppShell>
        <Card>
          <CardHeader title="Database Manager" description="Halaman ini khusus super admin." />
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Database Manager
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Kelola data inti sistem dari satu halaman super admin.
              </p>
            </div>
          </div>
          <Button type="button" variant="secondary" onClick={loadRows}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <Card>
            <CardHeader title="Tabel" description={`${tables.length} tabel tersedia`} />
            <CardContent className="grid gap-2">
              {tables.map((table) => (
                <button
                  className={`rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
                    selectedTableKey === table.key
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  key={table.key}
                  onClick={() => {
                    setSelectedTableKey(table.key);
                    setQuery("");
                  }}
                  type="button"
                >
                  {table.label}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title={selectedTable?.label || "Data"}
              description={`${filteredRows.length} dari ${rows.length} row ditampilkan`}
              action={
                <Button type="button" onClick={openCreateModal} disabled={!selectedTable}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah
                </Button>
              }
              className="items-center gap-4"
            />
            <CardContent className="grid gap-4">
              <div className="relative max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="[&_input]:pl-9"
                  placeholder="Cari data..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>

              <Table headers={[...columns, "Aksi"]}>
                {isLoading ? (
                  <Tr>
                    <Td className="text-slate-500" colSpan={columns.length + 1}>
                      Memuat data...
                    </Td>
                  </Tr>
                ) : filteredRows.length === 0 ? (
                  <Tr>
                    <Td className="text-slate-500" colSpan={columns.length + 1}>
                      Tidak ada data.
                    </Td>
                  </Tr>
                ) : (
                  filteredRows.map((row) => (
                    <Tr key={String(row[selectedTable?.idField || "id"])}>
                      {columns.map((column) => (
                        <Td className="max-w-[260px] truncate" key={column} title={formatCell(row[column])}>
                          {formatCell(row[column])}
                        </Td>
                      ))}
                      <Td>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => openEditModal(row)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => removeRow(row)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedTable && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`${editingRow ? "Edit" : "Tambah"} ${selectedTable.label}`}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button type="button" isLoading={isSaving} onClick={saveRow}>
                Simpan
              </Button>
            </>
          }
        >
          <div className="grid gap-4">
            {selectedTable.fields.map((field) => {
              const value = form[field.name];
              const required = field.required || (!editingRow && field.requiredOnCreate);

              if (field.type === "enum") {
                return (
                  <Select
                    key={field.name}
                    label={field.name}
                    required={required}
                    value={String(value ?? "")}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, [field.name]: event.target.value }))
                    }
                  >
                    {field.nullable && <option value="">NULL</option>}
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                );
              }

              if (field.type === "boolean") {
                return (
                  <label className="flex items-center gap-3 text-sm font-semibold text-slate-700" key={field.name}>
                    <input
                      checked={Boolean(value)}
                      className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      type="checkbox"
                      onChange={(event) =>
                        setForm((current) => ({ ...current, [field.name]: event.target.checked }))
                      }
                    />
                    {field.name}
                  </label>
                );
              }

              if (field.type === "text") {
                return (
                  <Textarea
                    key={field.name}
                    label={field.name}
                    required={required}
                    value={String(value ?? "")}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, [field.name]: event.target.value }))
                    }
                  />
                );
              }

              return (
                <Input
                  key={field.name}
                  label={field.name}
                  required={required}
                  type={field.type === "password" ? "password" : field.type === "number" ? "number" : "text"}
                  value={String(value ?? "")}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                />
              );
            })}
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
