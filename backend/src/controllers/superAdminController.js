const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const {
  getUserOrganizationId,
  isSuperAdmin,
  organizationExists,
  parseOptionalOrganizationId,
} = require("../utils/organizationScope");

const parseId = (id) => {
  const parsedId = Number(id);
  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const userSelect = {
  id_user: true,
  username: true,
  nama_lengkap: true,
  email: true,
  role: true,
  status: true,
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
};

const getAuthenticatedUserId = (user) => {
  const idUser = Number(user?.id_user || user?.id);
  return Number.isInteger(idUser) && idUser > 0 ? idUser : null;
};

const getRequiredString = (value) =>
  typeof value === "string" && value.trim() ? value.trim() : "";

const findDuplicateUser = async ({ email, username, excludeId }) => {
  return prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username },
      ],
      ...(excludeId
        ? {
            NOT: {
              id_user: excludeId,
            },
          }
        : {}),
    },
  });
};

const buildCreateUser = async (req, res, role) => {
  const username = getRequiredString(req.body.username);
  const password = getRequiredString(req.body.password);
  const namaLengkap = getRequiredString(req.body.nama_lengkap);
  const email = getRequiredString(req.body.email);
  const requestedOrganizationId = parseOptionalOrganizationId(req.body.id_organisasi);
  const adminOrganizationId = getUserOrganizationId(req.user);
  const idOrganisasi = isSuperAdmin(req.user)
    ? requestedOrganizationId
    : adminOrganizationId;

  if (!username || !password || !namaLengkap || !email) {
    return res.status(400).json({
      message: "Nama, username, email, dan password wajib diisi",
    });
  }

  if (role !== "SUPER_ADMIN" && !idOrganisasi) {
    return res.status(400).json({
      message: "Organisasi wajib dipilih",
    });
  }

  if (role !== "SUPER_ADMIN") {
    const validOrganization = await organizationExists(prisma, idOrganisasi);

    if (!validOrganization) {
      return res.status(400).json({
        message: "Organisasi tidak valid",
      });
    }
  }

  const duplicateUser = await findDuplicateUser({ email, username });

  if (duplicateUser) {
    return res.status(400).json({
      message: "Username atau email sudah digunakan",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      nama_lengkap: namaLengkap,
      email,
      role,
      id_organisasi: role === "SUPER_ADMIN" ? null : idOrganisasi,
    },
    select: userSelect,
  });
};

exports.getAllUsers = async (req, res) => {
  try {
    const where = isSuperAdmin(req.user)
      ? {}
      : {
          id_organisasi: req.user.id_organisasi,
          role: "PENGGUNA",
        };

    if (!isSuperAdmin(req.user) && !req.user.id_organisasi) {
      return res.status(400).json({
        message: "User belum terhubung dengan organisasi",
      });
    }

    const users = await prisma.user.findMany({
      where,
      select: userSelect,
      orderBy: {
        id_user: "desc",
      },
    });

    return res.json(users);
  } catch (error) {
    console.error("GET /api/superadmin/users error:", error);

    return res.status(500).json({
      message: "Gagal mengambil data users",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const idUser = parseId(req.params.id);

    if (!idUser) {
      return res.status(400).json({
        message: "ID user tidak valid",
      });
    }

    const where = isSuperAdmin(req.user)
      ? {
          id_user: idUser,
        }
      : {
          id_user: idUser,
          id_organisasi: req.user.id_organisasi,
          role: "PENGGUNA",
        };

    const user = await prisma.user.findFirst({
      where,
      select: userSelect,
    });

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    return res.json(user);
  } catch (error) {
    console.error("GET /api/superadmin/users/:id error:", error);

    return res.status(500).json({
      message: "Gagal mengambil detail user",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const idUser = Number(req.params.id);

    if (!Number.isInteger(idUser) || idUser <= 0) {
      return res.status(400).json({
        message: "ID user tidak valid",
      });
    }

    if (idUser === getAuthenticatedUserId(req.user)) {
      return res.status(400).json({
        message: "Tidak bisa menghapus akun sendiri",
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: {
        id_user: idUser,
      },
    });

    if (!targetUser) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    if (req.user.role === "SUPER_ADMIN") {
      await prisma.user.delete({
        where: {
          id_user: idUser,
        },
      });

      return res.json({
        message: "User berhasil dihapus",
      });
    }

    if (req.user.role === "ADMIN") {
      const isSameOrganization =
        targetUser.id_organisasi === req.user.id_organisasi;

      const isRegularUser = targetUser.role === "PENGGUNA";

      if (!isSameOrganization || !isRegularUser) {
        return res.status(403).json({
          message:
            "Akses ditolak. ADMIN hanya boleh menghapus user PENGGUNA dalam organisasi sendiri.",
        });
      }

      await prisma.user.delete({
        where: {
          id_user: idUser,
        },
      });

      return res.json({
        message: "User berhasil dihapus",
      });
    }

    return res.status(403).json({
      message: "Akses ditolak",
    });
  } catch (error) {
    console.error("DELETE /api/superadmin/users/:id error:", error);

    return res.status(500).json({
      message: "Gagal menghapus user",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.createRegularUser = async (req, res) => {
  try {
    const user = await buildCreateUser(req, res, "PENGGUNA");

    if (!user) return;

    return res.status(201).json({
      message: "User berhasil dibuat",
      user,
    });
  } catch (error) {
    console.error("POST /api/superadmin/users/regular error:", error);

    return res.status(500).json({
      message: "Gagal membuat user",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.createAdminUser = async (req, res) => {
  try {
    const user = await buildCreateUser(req, res, "ADMIN");

    if (!user) return;

    return res.status(201).json({
      message: "Admin berhasil dibuat",
      user,
    });
  } catch (error) {
    console.error("POST /api/superadmin/users/admin error:", error);

    return res.status(500).json({
      message: "Gagal membuat admin",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.createSuperAdminUser = async (req, res) => {
  try {
    const user = await buildCreateUser(req, res, "SUPER_ADMIN");

    if (!user) return;

    return res.status(201).json({
      message: "Super Admin berhasil dibuat",
      user,
    });
  } catch (error) {
    console.error("POST /api/superadmin/users/super-admin error:", error);

    return res.status(500).json({
      message: "Gagal membuat super admin",
      error: error.message,
      code: error.code || null,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const idUser = parseId(req.params.id);

    if (!idUser) {
      return res.status(400).json({
        message: "ID user tidak valid",
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: {
        id_user: idUser,
      },
    });

    if (!targetUser) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    if (!isSuperAdmin(req.user)) {
      const adminOrganizationId = getUserOrganizationId(req.user);
      const isSameOrganization = targetUser.id_organisasi === adminOrganizationId;
      const isRegularUser = targetUser.role === "PENGGUNA";

      if (!adminOrganizationId || !isSameOrganization || !isRegularUser) {
        return res.status(403).json({
          message: "Akses ditolak",
        });
      }
    }

    const username = getRequiredString(req.body.username);
    const namaLengkap = getRequiredString(req.body.nama_lengkap);
    const email = getRequiredString(req.body.email);
    const password = getRequiredString(req.body.password);
    const requestedRole = getRequiredString(req.body.role);
    const nextRole = isSuperAdmin(req.user) && requestedRole
      ? requestedRole
      : targetUser.role;
    const requestedOrganizationId = parseOptionalOrganizationId(req.body.id_organisasi);
    const nextOrganizationId = nextRole === "SUPER_ADMIN"
      ? null
      : isSuperAdmin(req.user)
        ? requestedOrganizationId
        : targetUser.id_organisasi;

    if (!username || !namaLengkap || !email) {
      return res.status(400).json({
        message: "Nama, username, dan email wajib diisi",
      });
    }

    if (!["SUPER_ADMIN", "ADMIN", "PENGGUNA"].includes(nextRole)) {
      return res.status(400).json({
        message: "Role tidak valid",
      });
    }

    if (nextRole !== "SUPER_ADMIN" && !nextOrganizationId) {
      return res.status(400).json({
        message: "Organisasi wajib dipilih",
      });
    }

    if (nextRole !== "SUPER_ADMIN") {
      const validOrganization = await organizationExists(prisma, nextOrganizationId);

      if (!validOrganization) {
        return res.status(400).json({
          message: "Organisasi tidak valid",
        });
      }
    }

    const duplicateUser = await findDuplicateUser({
      email,
      username,
      excludeId: idUser,
    });

    if (duplicateUser) {
      return res.status(400).json({
        message: "Username atau email sudah digunakan",
      });
    }

    const data = {
      username,
      nama_lengkap: namaLengkap,
      email,
      role: nextRole,
      id_organisasi: nextOrganizationId,
    };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id_user: idUser,
      },
      data,
      select: userSelect,
    });

    return res.json({
      message: "User berhasil diperbarui",
      user: updatedUser,
    });
  } catch (error) {
    console.error("PUT /api/superadmin/users/:id error:", error);

    return res.status(500).json({
      message: "Gagal memperbarui user",
      error: error.message,
      code: error.code || null,
    });
  }
};
