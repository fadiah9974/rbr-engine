const prisma = require("../config/prisma");
const {
  getScopedDataWhere,
  getScopedWhere,
  isSuperAdmin,
  requireOrganizationScope,
} = require("../utils/organizationScope");

const VALID_VARIABLE_TYPES = ["boolean", "number"];

const parseId = (id) => {
  const parsedId = Number(id);
  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const normalizeText = (value) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

function isRuleDetailValidForType(detail, tipeVariabel) {
  const nilai = String(detail.nilai ?? "").trim().toLowerCase();

  if (tipeVariabel === "boolean") {
    return detail.operator === "equal" && ["ya", "tidak"].includes(nilai);
  }

  if (tipeVariabel === "number") {
    return !Number.isNaN(Number(nilai));
  }

  return false;
}

const getFinalOrganizationId = (req, res) => {
  if (isSuperAdmin(req.user)) {
    if (
      req.body.id_organisasi !== undefined &&
      req.body.id_organisasi !== null &&
      req.body.id_organisasi !== ""
    ) {
      const idOrganisasi = Number(req.body.id_organisasi);

      if (!Number.isInteger(idOrganisasi) || idOrganisasi <= 0) {
        res.status(400).json({
          message: "ID organisasi tidak valid",
        });
        return undefined;
      }

      return idOrganisasi;
    }

    return null;
  }

  const idOrganisasi = requireOrganizationScope(req, res);

  if (!idOrganisasi) {
    return undefined;
  }

  return idOrganisasi;
};

exports.createVariable = async (req, res) => {
  try {
    const namaVariabel = normalizeText(req.body.nama_variabel);
    const tipeVariabel = req.body.tipe_variabel;
    const deskripsi = normalizeText(req.body.deskripsi);

    if (!namaVariabel) {
      return res.status(400).json({
        message: "Nama variabel wajib diisi",
      });
    }

    if (!VALID_VARIABLE_TYPES.includes(tipeVariabel)) {
      return res.status(400).json({
        message: "Tipe variabel tidak valid. Gunakan boolean atau number.",
      });
    }

    const idOrganisasi = getFinalOrganizationId(req, res);

    if (idOrganisasi === undefined) {
      return;
    }

    if (idOrganisasi !== null) {
      const organisasi = await prisma.organisasi.findUnique({
        where: {
          id_organisasi: idOrganisasi,
        },
      });

      if (!organisasi) {
        return res.status(404).json({
          message: "Organisasi tidak ditemukan",
        });
      }
    }

    const existingVariable = await prisma.variabel.findFirst({
      where: {
        nama_variabel: namaVariabel,
        id_organisasi: idOrganisasi,
      },
    });

    if (existingVariable) {
      return res.status(409).json({
        message: "Variabel dengan nama tersebut sudah ada",
      });
    }

    const variable = await prisma.variabel.create({
      data: {
        nama_variabel: namaVariabel,
        tipe_variabel: tipeVariabel,
        deskripsi: deskripsi || null,
        id_organisasi: idOrganisasi,
      },
      select: {
        id_variabel: true,
        nama_variabel: true,
        tipe_variabel: true,
        deskripsi: true,
        id_organisasi: true,
        created_at: true,
        updated_at: true,
        organisasi: {
          select: {
            id_organisasi: true,
            instansi: true,
            tipe: true,
            alamat: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Variabel berhasil dibuat",
      data: variable,
    });
  } catch (error) {
    console.error("POST /api/variables error:", error);

    return res.status(500).json({
      message: "Gagal membuat variabel",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.getVariables = async (req, res) => {
  try {
    const where = getScopedDataWhere(req);

    if (!where) {
      return res.status(400).json({
        message: "User belum terhubung dengan organisasi",
      });
    }

    const variables = await prisma.variabel.findMany({
      where,
      select: {
        id_variabel: true,
        nama_variabel: true,
        tipe_variabel: true,
        deskripsi: true,
        id_organisasi: true,
        created_at: true,
        updated_at: true,
        organisasi: {
          select: {
            id_organisasi: true,
            instansi: true,
            tipe: true,
            alamat: true,
          },
        },
      },
      orderBy: {
        id_variabel: "asc",
      },
    });

    return res.json(variables);
  } catch (error) {
    console.error("GET /api/variables error:", error);

    return res.status(500).json({
      message: "Gagal mengambil data variabel",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.getVariableById = async (req, res) => {
  try {
    const idVariabel = parseId(req.params.id);

    if (!idVariabel) {
      return res.status(400).json({
        message: "ID variabel tidak valid",
      });
    }

    const where = getScopedWhere(req);

    if (!where) {
      return res.status(400).json({
        message: "User belum terhubung dengan organisasi",
      });
    }

    const variable = await prisma.variabel.findFirst({
      where: {
        id_variabel: idVariabel,
        ...where,
      },
      select: {
        id_variabel: true,
        nama_variabel: true,
        tipe_variabel: true,
        deskripsi: true,
        id_organisasi: true,
        created_at: true,
        updated_at: true,
        organisasi: {
          select: {
            id_organisasi: true,
            instansi: true,
            tipe: true,
            alamat: true,
          },
        },
      },
    });

    if (!variable) {
      return res.status(404).json({
        message: "Variabel tidak ditemukan",
      });
    }

    return res.json(variable);
  } catch (error) {
    console.error("GET /api/variables/:id error:", error);

    return res.status(500).json({
      message: "Gagal mengambil detail variabel",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.updateVariable = async (req, res) => {
  try {
    const idVariabel = parseId(req.params.id);
    const namaVariabel = normalizeText(req.body.nama_variabel);
    const tipeVariabel = req.body.tipe_variabel;
    const deskripsi = normalizeText(req.body.deskripsi);

    if (!idVariabel) {
      return res.status(400).json({
        message: "ID variabel tidak valid",
      });
    }

    if (!namaVariabel) {
      return res.status(400).json({
        message: "Nama variabel wajib diisi",
      });
    }

    if (!VALID_VARIABLE_TYPES.includes(tipeVariabel)) {
      return res.status(400).json({
        message: "Tipe variabel tidak valid. Gunakan boolean atau number.",
      });
    }

    const where = getScopedWhere(req);

    if (!where) {
      return res.status(400).json({
        message: "User belum terhubung dengan organisasi",
      });
    }

    const existingVariable = await prisma.variabel.findFirst({
      where: {
        id_variabel: idVariabel,
        ...where,
      },
    });

    if (!existingVariable) {
      return res.status(404).json({
        message: "Variabel tidak ditemukan",
      });
    }

    const duplicateVariable = await prisma.variabel.findFirst({
      where: {
        nama_variabel: namaVariabel,
        id_organisasi: existingVariable.id_organisasi,
        NOT: {
          id_variabel: idVariabel,
        },
      },
    });

    if (duplicateVariable) {
      return res.status(409).json({
        message: "Variabel dengan nama tersebut sudah ada",
      });
    }

    if (existingVariable.tipe_variabel !== tipeVariabel) {
      const ruleDetails = await prisma.ruleDetail.findMany({
        where: {
          id_variabel: idVariabel,
        },
      });
      const hasInvalidRuleDetail = ruleDetails.some(
        (detail) => !isRuleDetailValidForType(detail, tipeVariabel)
      );

      if (hasInvalidRuleDetail) {
        return res.status(400).json({
          message:
            tipeVariabel === "number"
              ? "Variabel tidak bisa diubah menjadi Score karena masih ada rule bernilai Ya/Tidak. Edit atau hapus rule tersebut dulu."
              : "Variabel tidak bisa diubah menjadi Ya/Tidak karena masih ada rule bernilai score. Edit atau hapus rule tersebut dulu.",
        });
      }
    }

    const updatedVariable = await prisma.variabel.update({
      where: {
        id_variabel: idVariabel,
      },
      data: {
        nama_variabel: namaVariabel,
        tipe_variabel: tipeVariabel,
        deskripsi: deskripsi || null,
      },
      select: {
        id_variabel: true,
        nama_variabel: true,
        tipe_variabel: true,
        deskripsi: true,
        id_organisasi: true,
        created_at: true,
        updated_at: true,
        organisasi: {
          select: {
            id_organisasi: true,
            instansi: true,
            tipe: true,
            alamat: true,
          },
        },
      },
    });

    return res.json({
      message: "Variabel berhasil diperbarui",
      data: updatedVariable,
    });
  } catch (error) {
    console.error("PUT /api/variables/:id error:", error);

    return res.status(500).json({
      message: "Gagal memperbarui variabel",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.deleteVariable = async (req, res) => {
  try {
    const idVariabel = parseId(req.params.id);

    if (!idVariabel) {
      return res.status(400).json({
        message: "ID variabel tidak valid",
      });
    }

    const where = getScopedWhere(req);

    if (!where) {
      return res.status(400).json({
        message: "User belum terhubung dengan organisasi",
      });
    }

    const existingVariable = await prisma.variabel.findFirst({
      where: {
        id_variabel: idVariabel,
        ...where,
      },
    });

    if (!existingVariable) {
      return res.status(404).json({
        message: "Variabel tidak ditemukan",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.ruleDetail.deleteMany({
        where: {
          id_variabel: idVariabel,
        },
      });

      await tx.caseAnswer.deleteMany({
        where: {
          id_variabel: idVariabel,
        },
      });

      await tx.variabel.delete({
        where: {
          id_variabel: idVariabel,
        },
      });
    });

    return res.json({
      message: "Variabel berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE /api/variables/:id error:", error);

    return res.status(500).json({
      message: "Gagal menghapus variabel",
      error: error.message,
      code: error.code || null,
    });
  }
};
