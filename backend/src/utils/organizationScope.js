function isSuperAdmin(user) {
  return user?.role === "SUPER_ADMIN";
}

function getUserOrganizationId(user) {
  const idOrganisasi = Number(user?.id_organisasi);

  return Number.isInteger(idOrganisasi) && idOrganisasi > 0 ? idOrganisasi : null;
}

function requireOrganizationScope(req, res) {
  const idOrganisasi = getUserOrganizationId(req.user);

  if (!idOrganisasi) {
    res.status(400).json({
      message: "User belum terhubung dengan organisasi",
    });
    return null;
  }

  return idOrganisasi;
}

function getScopedWhere(req, field = "id_organisasi") {
  if (isSuperAdmin(req.user)) return {};

  const idOrganisasi = getUserOrganizationId(req.user);

  if (!idOrganisasi) return null;

  return {
    [field]: idOrganisasi,
  };
}

function getScopedDataWhere(req, field = "id_organisasi") {
  if (isSuperAdmin(req.user)) return {};

  const idOrganisasi = getUserOrganizationId(req.user);

  if (!idOrganisasi) return null;

  return {
    OR: [
      { [field]: idOrganisasi },
      { [field]: null },
    ],
  };
}

function parseOptionalOrganizationId(value) {
  const idOrganisasi = Number(value);

  return Number.isInteger(idOrganisasi) && idOrganisasi > 0 ? idOrganisasi : null;
}

async function organizationExists(prisma, idOrganisasi) {
  if (!idOrganisasi) return false;

  const organization = await prisma.organisasi.findUnique({
    where: {
      id_organisasi: idOrganisasi,
    },
  });

  return Boolean(organization);
}

module.exports = {
  getScopedDataWhere,
  getScopedWhere,
  getUserOrganizationId,
  isSuperAdmin,
  organizationExists,
  parseOptionalOrganizationId,
  requireOrganizationScope,
};
