const prisma = require("../config/prisma");
const {
  getScopedDataWhere,
  getScopedWhere,
  isSuperAdmin,
  requireOrganizationScope,
} = require("../utils/organizationScope");

const ruleOperators = new Set([
  "equal",
  "less_than",
  "greater_than",
  "less_than_equal",
  "greater_than_equal",
]);

const parseId = (id) => {
  const parsedId = Number(id);
  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

function normalizeDetails(details) {
  if (typeof details === "string") {
    try {
      return JSON.parse(details);
    } catch {
      return [];
    }
  }

  return Array.isArray(details) ? details : [];
}

async function validateRulePayload(req, res) {
  const idKategori = Number(req.body.id_kategori);
  const details = normalizeDetails(req.body.details);
  const organizationWhere = getScopedDataWhere(req);

  if (!organizationWhere) {
    res.status(400).json({
      message: "User belum terhubung dengan organisasi",
    });
    return null;
  }

  if (!Number.isInteger(idKategori) || idKategori <= 0) {
    res.status(400).json({
      message: "Kategori wajib dipilih",
    });
    return null;
  }

  if (details.length === 0) {
    res.status(400).json({
      message: "Minimal satu detail rule wajib diisi",
    });
    return null;
  }

  const category = await prisma.kategori.findFirst({
    where: {
      id_kategori: idKategori,
      ...organizationWhere,
    },
  });

  if (!category) {
    res.status(400).json({
      message: "Kategori tidak valid",
    });
    return null;
  }

  const variableIds = details
    .map((detail) => Number(detail.id_variabel))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (variableIds.length !== details.length) {
    res.status(400).json({
      message: "Variabel rule tidak valid",
    });
    return null;
  }

  const variables = await prisma.variabel.findMany({
    where: {
      id_variabel: {
        in: variableIds,
      },
      ...organizationWhere,
    },
  });

  const variableMap = new Map(
    variables.map((variable) => [variable.id_variabel, variable])
  );

  const cleanDetails = [];

  for (const detail of details) {
    const idVariabel = Number(detail.id_variabel);
    const operator = String(detail.operator || "equal");
    const nilai = String(detail.nilai ?? "").trim();
    const variable = variableMap.get(idVariabel);

    if (!variable) {
      res.status(400).json({
        message: "Variabel rule tidak valid",
      });
      return null;
    }

    if (!nilai) {
      res.status(400).json({
        message: "Nilai rule wajib diisi",
      });
      return null;
    }

    if (!ruleOperators.has(operator)) {
      res.status(400).json({
        message: "Operator rule tidak valid",
      });
      return null;
    }

    if (variable.tipe_variabel === "boolean" && !["ya", "tidak"].includes(nilai)) {
      res.status(400).json({
        message: "Nilai untuk variabel Ya/Tidak harus ya atau tidak",
      });
      return null;
    }

    if (variable.tipe_variabel === "boolean" && operator !== "equal") {
      res.status(400).json({
        message: "Variabel Ya/Tidak hanya boleh memakai operator sama dengan",
      });
      return null;
    }

    if (variable.tipe_variabel === "number" && Number.isNaN(Number(nilai))) {
      res.status(400).json({
        message: "Nilai untuk variabel score harus berupa angka",
      });
      return null;
    }

    cleanDetails.push({
      id_variabel: idVariabel,
      operator,
      nilai,
    });
  }

  return {
    id_kategori: idKategori,
    id_organisasi: category.id_organisasi,
    rekomendasi: req.body.rekomendasi || null,
    details: cleanDetails,
  };
}

const ruleInclude = {
  kategori: true,
  details: {
    include: {
      variabel: true,
    },
  },
};

exports.createRule = async (req, res) => {
  try {
    const data = await validateRulePayload(req, res);

    if (!data) return;

    const idOrganisasi = isSuperAdmin(req.user)
      ? data.id_organisasi
      : requireOrganizationScope(req, res);

    if (!isSuperAdmin(req.user) && !idOrganisasi) return;

    const rule = await prisma.rule.create({
      data: {
        id_kategori: data.id_kategori,
        id_organisasi: idOrganisasi,
        rekomendasi: data.rekomendasi,
        details: {
          create: data.details,
        },
      },
      include: ruleInclude,
    });

    return res.status(201).json({
      message: "Rule berhasil dibuat",
      data: rule,
    });
  } catch (error) {
    console.error("POST /api/rules error:", error);

    return res.status(500).json({
      message: "Gagal membuat rule",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.getRules = async (req, res) => {
  try {
    const where = getScopedWhere(req);

    if (!where) {
      return res.status(400).json({
        message: "User belum terhubung dengan organisasi",
      });
    }

    const rules = await prisma.rule.findMany({
      where,
      include: ruleInclude,
      orderBy: {
        id_rule: "desc",
      },
    });

    return res.json(rules);
  } catch (error) {
    console.error("GET /api/rules error:", error);

    return res.status(500).json({
      message: "Gagal mengambil data rule",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.getRuleById = async (req, res) => {
  try {
    const idRule = parseId(req.params.id);

    if (!idRule) {
      return res.status(400).json({
        message: "ID rule tidak valid",
      });
    }

    const where = getScopedWhere(req);

    if (!where) {
      return res.status(400).json({
        message: "User belum terhubung dengan organisasi",
      });
    }

    const rule = await prisma.rule.findFirst({
      where: {
        id_rule: idRule,
        ...where,
      },
      include: ruleInclude,
    });

    if (!rule) {
      return res.status(404).json({
        message: "Rule tidak ditemukan",
      });
    }

    return res.json(rule);
  } catch (error) {
    console.error("GET /api/rules/:id error:", error);

    return res.status(500).json({
      message: "Gagal mengambil detail rule",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.updateRule = async (req, res) => {
  try {
    const idRule = parseId(req.params.id);

    if (!idRule) {
      return res.status(400).json({
        message: "ID rule tidak valid",
      });
    }

    const data = await validateRulePayload(req, res);

    if (!data) return;

    const where = getScopedWhere(req);

    if (!where) {
      return res.status(400).json({
        message: "User belum terhubung dengan organisasi",
      });
    }

    const idOrganisasi = isSuperAdmin(req.user)
      ? data.id_organisasi
      : requireOrganizationScope(req, res);

    if (!isSuperAdmin(req.user) && !idOrganisasi) return;

    const existingRule = await prisma.rule.findFirst({
      where: {
        id_rule: idRule,
        ...where,
      },
    });

    if (!existingRule) {
      return res.status(404).json({
        message: "Rule tidak ditemukan",
      });
    }

    const rule = await prisma.rule.update({
      where: {
        id_rule: idRule,
      },
      data: {
        id_kategori: data.id_kategori,
        id_organisasi: idOrganisasi,
        rekomendasi: data.rekomendasi,
        details: {
          deleteMany: {},
          create: data.details,
        },
      },
      include: ruleInclude,
    });

    return res.json({
      message: "Rule berhasil diperbarui",
      data: rule,
    });
  } catch (error) {
    console.error("PUT /api/rules/:id error:", error);

    return res.status(500).json({
      message: "Gagal memperbarui rule",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.deleteRule = async (req, res) => {
  try {
    const idRule = parseId(req.params.id);

    if (!idRule) {
      return res.status(400).json({
        message: "ID rule tidak valid",
      });
    }

    const where = getScopedWhere(req);

    if (!where) {
      return res.status(400).json({
        message: "User belum terhubung dengan organisasi",
      });
    }

    const existingRule = await prisma.rule.findFirst({
      where: {
        id_rule: idRule,
        ...where,
      },
    });

    if (!existingRule) {
      return res.status(404).json({
        message: "Rule tidak ditemukan",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.case.updateMany({
        where: {
          id_rule: idRule,
        },
        data: {
          id_rule: null,
        },
      });

      await tx.caseResult.updateMany({
        where: {
          id_rule: idRule,
        },
        data: {
          id_rule: null,
        },
      });

      await tx.ruleDetail.deleteMany({
        where: {
          id_rule: idRule,
        },
      });

      await tx.rule.delete({
        where: {
          id_rule: idRule,
        },
      });
    });

    return res.json({
      message: "Rule berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE /api/rules/:id error:", error);

    return res.status(500).json({
      message: "Gagal menghapus rule",
      error: error.message,
      code: error.code || null,
    });
  }
};
