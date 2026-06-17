const prisma = require("../config/prisma");
const {
  getScopedDataWhere,
  getScopedWhere,
  isSuperAdmin,
  requireOrganizationScope,
} = require("../utils/organizationScope");

const parseId = (id) => {
  const parsedId = Number(id);
  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const normalizeText = (value) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

exports.createCategory = async (req, res) => {
  try {
    const namaKategori = normalizeText(req.body.nama_kategori);

    if (!namaKategori) {
      return res.status(400).json({
        message: "Nama kategori wajib diisi",
      });
    }

    const idOrganisasi = isSuperAdmin(req.user)
      ? req.body.id_organisasi
        ? Number(req.body.id_organisasi)
        : null
      : requireOrganizationScope(req, res);

    if (!isSuperAdmin(req.user) && !idOrganisasi) return;

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

    const existingCategory = await prisma.kategori.findFirst({
      where: {
        nama_kategori: namaKategori,
        id_organisasi: idOrganisasi,
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        message: "Kategori dengan nama tersebut sudah ada",
      });
    }

    const category = await prisma.kategori.create({
      data: {
        nama_kategori: namaKategori,
        id_organisasi: idOrganisasi,
      },
      select: {
        id_kategori: true,
        nama_kategori: true,
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
      message: "Kategori berhasil dibuat",
      data: category,
    });
  } catch (error) {
    console.error("POST /api/categories error:", error);

    return res.status(500).json({
      message: "Gagal membuat kategori",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const where = getScopedDataWhere(req);

    if (!where) {
      return res.status(400).json({
        message: "User belum terhubung dengan organisasi",
      });
    }

    const categories = await prisma.kategori.findMany({
      where,
      select: {
        id_kategori: true,
        nama_kategori: true,
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
        id_kategori: "asc",
      },
    });

    return res.json(categories);
  } catch (error) {
    console.error("GET /api/categories error:", error);

    return res.status(500).json({
      message: "Gagal mengambil data kategori",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const idKategori = parseId(req.params.id);

    if (!idKategori) {
      return res.status(400).json({
        message: "ID kategori tidak valid",
      });
    }

    const where = getScopedWhere(req);

    if (!where) {
      return res.status(400).json({
        message: "User belum terhubung dengan organisasi",
      });
    }

    const category = await prisma.kategori.findFirst({
      where: {
        id_kategori: idKategori,
        ...where,
      },
      select: {
        id_kategori: true,
        nama_kategori: true,
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

    if (!category) {
      return res.status(404).json({
        message: "Kategori tidak ditemukan",
      });
    }

    return res.json(category);
  } catch (error) {
    console.error("GET /api/categories/:id error:", error);

    return res.status(500).json({
      message: "Gagal mengambil detail kategori",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const idKategori = parseId(req.params.id);
    const namaKategori = normalizeText(req.body.nama_kategori);

    if (!idKategori) {
      return res.status(400).json({
        message: "ID kategori tidak valid",
      });
    }

    if (!namaKategori) {
      return res.status(400).json({
        message: "Nama kategori wajib diisi",
      });
    }

    const where = getScopedWhere(req);

    if (!where) {
      return res.status(400).json({
        message: "User belum terhubung dengan organisasi",
      });
    }

    const existingCategory = await prisma.kategori.findFirst({
      where: {
        id_kategori: idKategori,
        ...where,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({
        message: "Kategori tidak ditemukan",
      });
    }

    const duplicateCategory = await prisma.kategori.findFirst({
      where: {
        nama_kategori: namaKategori,
        id_organisasi: existingCategory.id_organisasi,
        NOT: {
          id_kategori: idKategori,
        },
      },
    });

    if (duplicateCategory) {
      return res.status(409).json({
        message: "Kategori dengan nama tersebut sudah ada",
      });
    }

    const updatedCategory = await prisma.kategori.update({
      where: {
        id_kategori: idKategori,
      },
      data: {
        nama_kategori: namaKategori,
      },
      select: {
        id_kategori: true,
        nama_kategori: true,
        id_organisasi: true,
        created_at: true,
        updated_at: true,
      },
    });

    return res.json({
      message: "Kategori berhasil diperbarui",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("PUT /api/categories/:id error:", error);

    return res.status(500).json({
      message: "Gagal memperbarui kategori",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const idKategori = parseId(req.params.id);

    if (!idKategori) {
      return res.status(400).json({
        message: "ID kategori tidak valid",
      });
    }

    const where = getScopedWhere(req);

    if (!where) {
      return res.status(400).json({
        message: "User belum terhubung dengan organisasi",
      });
    }

    const existingCategory = await prisma.kategori.findFirst({
      where: {
        id_kategori: idKategori,
        ...where,
      },
      include: {
        rules: {
          select: {
            id_rule: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return res.status(404).json({
        message: "Kategori tidak ditemukan",
      });
    }

    const ruleIds = existingCategory.rules.map((rule) => rule.id_rule);

    await prisma.$transaction(async (tx) => {
      await tx.case.updateMany({
        where: {
          id_kategori: idKategori,
        },
        data: {
          id_kategori: null,
        },
      });

      await tx.caseResult.updateMany({
        where: {
          id_kategori: idKategori,
        },
        data: {
          id_kategori: null,
        },
      });

      if (ruleIds.length > 0) {
        await tx.case.updateMany({
          where: {
            id_rule: {
              in: ruleIds,
            },
          },
          data: {
            id_rule: null,
          },
        });

        await tx.caseResult.updateMany({
          where: {
            id_rule: {
              in: ruleIds,
            },
          },
          data: {
            id_rule: null,
          },
        });

        await tx.ruleDetail.deleteMany({
          where: {
            id_rule: {
              in: ruleIds,
            },
          },
        });

        await tx.rule.deleteMany({
          where: {
            id_rule: {
              in: ruleIds,
            },
          },
        });
      }

      await tx.kategori.delete({
        where: {
          id_kategori: idKategori,
        },
      });
    });

    return res.json({
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE /api/categories/:id error:", error);

    return res.status(500).json({
      message: "Gagal menghapus kategori",
      error: error.message,
      code: error.code || null,
    });
  }
};
