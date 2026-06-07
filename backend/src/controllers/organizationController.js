const prisma = require("../config/prisma");
const { isSuperAdmin } = require("../utils/organizationScope");

const parseId = (id) => {
  const parsedId = Number(id);
  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const normalizeText = (value) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

exports.getOrganizations = async (req, res) => {
  try {
    const where = isSuperAdmin(req.user)
      ? {}
      : {
          id_organisasi: req.user.id_organisasi,
        };

    if (!isSuperAdmin(req.user) && !req.user.id_organisasi) {
      return res.status(400).json({
        message: "User belum terhubung dengan organisasi",
      });
    }

    const organizations = await prisma.organisasi.findMany({
      where,
      select: {
        id_organisasi: true,
        instansi: true,
        tipe: true,
        alamat: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        id_organisasi: "asc",
      },
    });

    return res.json(organizations);
  } catch (error) {
    console.error("GET /api/organizations error:", error);

    return res.status(500).json({
      message: "Gagal mengambil data organisasi",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.getOrganizationById = async (req, res) => {
  try {
    const idOrganisasi = parseId(req.params.id);

    if (!idOrganisasi) {
      return res.status(400).json({
        message: "ID organisasi tidak valid",
      });
    }

    if (!isSuperAdmin(req.user) && req.user.id_organisasi !== idOrganisasi) {
      return res.status(403).json({
        message: "Akses ditolak",
      });
    }

    const organization = await prisma.organisasi.findUnique({
      where: {
        id_organisasi: idOrganisasi,
      },
      select: {
        id_organisasi: true,
        instansi: true,
        tipe: true,
        alamat: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!organization) {
      return res.status(404).json({
        message: "Organisasi tidak ditemukan",
      });
    }

    return res.json(organization);
  } catch (error) {
    console.error("GET /api/organizations/:id error:", error);

    return res.status(500).json({
      message: "Gagal mengambil detail organisasi",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.createOrganization = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({
        message: "Akses ditolak. Hanya SUPER_ADMIN yang boleh membuat organisasi.",
      });
    }

    const instansi = normalizeText(req.body.instansi);
    const tipe = normalizeText(req.body.tipe);
    const alamat = normalizeText(req.body.alamat);

    if (!instansi || !tipe || !alamat) {
      return res.status(400).json({
        message: "Instansi, tipe, dan alamat wajib diisi",
      });
    }

    const organization = await prisma.organisasi.create({
      data: {
        instansi,
        tipe,
        alamat,
      },
      select: {
        id_organisasi: true,
        instansi: true,
        tipe: true,
        alamat: true,
        created_at: true,
        updated_at: true,
      },
    });

    return res.status(201).json({
      message: "Organisasi berhasil dibuat",
      data: organization,
    });
  } catch (error) {
    console.error("POST /api/organizations error:", error);

    return res.status(500).json({
      message: "Gagal membuat organisasi",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.updateOrganization = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({
        message: "Akses ditolak. Hanya SUPER_ADMIN yang boleh mengubah organisasi.",
      });
    }

    const idOrganisasi = parseId(req.params.id);

    if (!idOrganisasi) {
      return res.status(400).json({
        message: "ID organisasi tidak valid",
      });
    }

    const instansi = normalizeText(req.body.instansi);
    const tipe = normalizeText(req.body.tipe);
    const alamat = normalizeText(req.body.alamat);

    if (!instansi || !tipe || !alamat) {
      return res.status(400).json({
        message: "Instansi, tipe, dan alamat wajib diisi",
      });
    }

    const existingOrganization = await prisma.organisasi.findUnique({
      where: {
        id_organisasi: idOrganisasi,
      },
    });

    if (!existingOrganization) {
      return res.status(404).json({
        message: "Organisasi tidak ditemukan",
      });
    }

    const organization = await prisma.organisasi.update({
      where: {
        id_organisasi: idOrganisasi,
      },
      data: {
        instansi,
        tipe,
        alamat,
      },
      select: {
        id_organisasi: true,
        instansi: true,
        tipe: true,
        alamat: true,
        created_at: true,
        updated_at: true,
      },
    });

    return res.json({
      message: "Organisasi berhasil diperbarui",
      data: organization,
    });
  } catch (error) {
    console.error("PUT /api/organizations/:id error:", error);

    return res.status(500).json({
      message: "Gagal memperbarui organisasi",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.deleteOrganization = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({
        message: "Akses ditolak. Hanya SUPER_ADMIN yang boleh menghapus organisasi.",
      });
    }

    const idOrganisasi = parseId(req.params.id);

    if (!idOrganisasi) {
      return res.status(400).json({
        message: "ID organisasi tidak valid",
      });
    }

    const organization = await prisma.organisasi.findUnique({
      where: {
        id_organisasi: idOrganisasi,
      },
      include: {
        users: true,
        variabels: true,
        kategoris: true,
        rules: true,
        cases: true,
      },
    });

    if (!organization) {
      return res.status(404).json({
        message: "Organisasi tidak ditemukan",
      });
    }

    const isUsed =
      organization.users.length > 0 ||
      organization.variabels.length > 0 ||
      organization.kategoris.length > 0 ||
      organization.rules.length > 0 ||
      organization.cases.length > 0;

    if (isUsed) {
      return res.status(400).json({
        message:
          "Organisasi tidak bisa dihapus karena masih memiliki user, variabel, kategori, rule, atau case.",
      });
    }

    await prisma.organisasi.delete({
      where: {
        id_organisasi: idOrganisasi,
      },
    });

    return res.json({
      message: "Organisasi berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE /api/organizations/:id error:", error);

    return res.status(500).json({
      message: "Gagal menghapus organisasi",
      error: error.message,
      code: error.code || null,
    });
  }
};