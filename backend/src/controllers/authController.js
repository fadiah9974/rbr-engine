const prisma = require("../config/prisma");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const {
  organizationExists,
  parseOptionalOrganizationId,
} = require("../utils/organizationScope");

exports.register = async (req, res) => {
  try {
    const {
      username,
      password,
      nama_lengkap,
      email,
      id_organisasi,
    } = req.body;
    const idOrganisasi = parseOptionalOrganizationId(id_organisasi);

    if (!idOrganisasi) {
      return res.status(400).json({
        message: "Organisasi wajib dipilih",
      });
    }

    const validOrganization = await organizationExists(prisma, idOrganisasi);

    if (!validOrganization) {
      return res.status(400).json({
        message: "Organisasi tidak valid",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User sudah ada",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        nama_lengkap,
        role: "PENGGUNA",
        email,
        id_organisasi: idOrganisasi,
      },
      include: {
        organisasi: true,
      },
    });

    res.status(201).json({
      message: "Register berhasil",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getRegisterOrganizations = async (req, res) => {
  try {
    const organizations = await prisma.organisasi.findMany({
      orderBy: {
        instansi: "asc",
      },
    });

    res.json(organizations);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        organisasi: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Password salah",
      });
    }

    const token = jwt.sign(
      {
        id: user.id_user,
        role: user.role,
        id_organisasi: user.id_organisasi,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login berhasil",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
