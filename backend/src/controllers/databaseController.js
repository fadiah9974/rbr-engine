const bcrypt = require("bcryptjs");

const prisma = require("../config/prisma");

const tableConfigs = {
  users: {
    label: "Users",
    delegate: "user",
    idField: "id_user",
    orderBy: { id_user: "desc" },
    hiddenFields: ["password"],
    fields: [
      { name: "username", type: "string", required: true },
      { name: "password", type: "password", requiredOnCreate: true, hiddenInTable: true },
      { name: "nama_lengkap", type: "string", required: true },
      { name: "role", type: "enum", options: ["SUPER_ADMIN", "ADMIN", "PENGGUNA"], required: true },
      { name: "email", type: "string", required: true },
      { name: "status", type: "boolean" },
      { name: "id_organisasi", type: "number", nullable: true },
    ],
  },
  organizations: {
    label: "Organisasi",
    delegate: "organisasi",
    idField: "id_organisasi",
    orderBy: { id_organisasi: "desc" },
    fields: [
      { name: "instansi", type: "string", required: true },
      { name: "tipe", type: "string", required: true },
      { name: "alamat", type: "text", required: true },
    ],
  },
  variables: {
    label: "Variabel",
    delegate: "variabel",
    idField: "id_variabel",
    orderBy: { id_variabel: "desc" },
    fields: [
      { name: "nama_variabel", type: "string", required: true },
      { name: "tipe_variabel", type: "enum", options: ["boolean", "number"], required: true },
      { name: "deskripsi", type: "text", nullable: true },
      { name: "id_organisasi", type: "number", nullable: true },
    ],
  },
  categories: {
    label: "Kategori",
    delegate: "kategori",
    idField: "id_kategori",
    orderBy: { id_kategori: "desc" },
    fields: [
      { name: "nama_kategori", type: "string", required: true },
      { name: "id_organisasi", type: "number", nullable: true },
    ],
  },
  rules: {
    label: "Rules",
    delegate: "rule",
    idField: "id_rule",
    orderBy: { id_rule: "desc" },
    fields: [
      { name: "id_kategori", type: "number", required: true },
      { name: "id_organisasi", type: "number", nullable: true },
      { name: "rekomendasi", type: "text", nullable: true },
    ],
  },
  ruleDetails: {
    label: "Rule Details",
    delegate: "ruleDetail",
    idField: "id_rule_detail",
    orderBy: { id_rule_detail: "desc" },
    fields: [
      { name: "id_rule", type: "number", required: true },
      { name: "id_variabel", type: "number", required: true },
      {
        name: "operator",
        type: "enum",
        options: ["equal", "less_than", "greater_than", "less_than_equal", "greater_than_equal"],
        required: true,
      },
      { name: "nilai", type: "string", required: true },
    ],
  },
  cases: {
    label: "Cases",
    delegate: "case",
    idField: "id_case",
    orderBy: { id_case: "desc" },
    fields: [
      { name: "id_user", type: "number", required: true },
      { name: "id_organisasi", type: "number", nullable: true },
      { name: "id_rule", type: "number", nullable: true },
      { name: "id_kategori", type: "number", nullable: true },
      { name: "nama_asesi", type: "string", required: true },
      { name: "rekomendasi", type: "text", nullable: true },
    ],
  },
  caseAnswers: {
    label: "Case Answers",
    delegate: "caseAnswer",
    idField: "id_case_answer",
    orderBy: { id_case_answer: "desc" },
    fields: [
      { name: "id_case", type: "number", required: true },
      { name: "id_variabel", type: "number", required: true },
      { name: "nilai", type: "string", required: true },
    ],
  },
  caseResults: {
    label: "Case Results",
    delegate: "caseResult",
    idField: "id_case_result",
    orderBy: { id_case_result: "desc" },
    fields: [
      { name: "id_case", type: "number", required: true },
      { name: "id_rule", type: "number", nullable: true },
      { name: "id_kategori", type: "number", nullable: true },
      { name: "rekomendasi", type: "text", nullable: true },
    ],
  },
};

function getConfig(table) {
  return tableConfigs[table];
}

function parseValue(field, value) {
  if (value === "" || value === undefined) {
    return field.nullable ? null : undefined;
  }

  if (field.type === "number") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  if (field.type === "boolean") {
    return value === true || value === "true";
  }

  return value;
}

function normalizeData(config, body, mode) {
  const data = {};

  config.fields.forEach((field) => {
    if (!(field.name in body)) return;
    if (mode === "update" && field.type === "password" && !body[field.name]) return;

    const value = parseValue(field, body[field.name]);

    if (value !== undefined) {
      data[field.name] = value;
    }
  });

  return data;
}

function sanitizeRow(config, row) {
  const hiddenFields = config.hiddenFields || [];

  return Object.fromEntries(
    Object.entries(row).filter(([key]) => !hiddenFields.includes(key))
  );
}

async function prepareData(config, body, mode) {
  const data = normalizeData(config, body, mode);

  if ("password" in data) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  return data;
}

exports.getTables = (req, res) => {
  res.json(
    Object.entries(tableConfigs).map(([key, config]) => ({
      key,
      label: config.label,
      idField: config.idField,
      fields: config.fields.map(({ hiddenInTable, ...field }) => ({
        ...field,
        hiddenInTable: Boolean(hiddenInTable),
      })),
    }))
  );
};

exports.getRows = async (req, res) => {
  const config = getConfig(req.params.table);

  if (!config) {
    return res.status(404).json({ message: "Table not found" });
  }

  try {
    const rows = await prisma[config.delegate].findMany({
      orderBy: config.orderBy,
      take: 100,
    });

    res.json(rows.map((row) => sanitizeRow(config, row)));
  } catch (error) {
    res.status(500).json({ message: "Failed to load table rows" });
  }
};

exports.createRow = async (req, res) => {
  const config = getConfig(req.params.table);

  if (!config) {
    return res.status(404).json({ message: "Table not found" });
  }

  try {
    const data = await prepareData(config, req.body, "create");
    const row = await prisma[config.delegate].create({ data });

    res.status(201).json(sanitizeRow(config, row));
  } catch (error) {
    res.status(400).json({
      message: error.message || "Failed to create row",
    });
  }
};

exports.updateRow = async (req, res) => {
  const config = getConfig(req.params.table);

  if (!config) {
    return res.status(404).json({ message: "Table not found" });
  }

  try {
    const data = await prepareData(config, req.body, "update");
    const row = await prisma[config.delegate].update({
      where: { [config.idField]: Number(req.params.id) },
      data,
    });

    res.json(sanitizeRow(config, row));
  } catch (error) {
    res.status(400).json({
      message: error.message || "Failed to update row",
    });
  }
};

exports.deleteRow = async (req, res) => {
  const config = getConfig(req.params.table);

  if (!config) {
    return res.status(404).json({ message: "Table not found" });
  }

  try {
    await prisma[config.delegate].delete({
      where: { [config.idField]: Number(req.params.id) },
    });

    res.json({ message: "Row deleted successfully" });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Failed to delete row",
    });
  }
};
