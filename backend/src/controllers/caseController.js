const prisma = require("../config/prisma");
const {
  getScopedWhere,
  getUserOrganizationId,
  isSuperAdmin,
  requireOrganizationScope,
} = require("../utils/organizationScope");

function normalizeAnswers(answers) {
  if (typeof answers === "string") {
    try {
      return JSON.parse(answers);
    } catch {
      return [];
    }
  }

  return Array.isArray(answers) ? answers : [];
}

function compareValue(operator, ruleValue, answerValue, variableType) {
  if (variableType === "boolean") {
    return String(ruleValue).toLowerCase() === String(answerValue).toLowerCase();
  }

  const ruleNumber = Number(ruleValue);
  const answerNumber = Number(answerValue);

  if (Number.isNaN(ruleNumber) || Number.isNaN(answerNumber)) return false;

  switch (operator) {
    case "equal":
      return answerNumber === ruleNumber;
    case "less_than":
      return answerNumber < ruleNumber;
    case "greater_than":
      return answerNumber > ruleNumber;
    case "less_than_equal":
      return answerNumber <= ruleNumber;
    case "greater_than_equal":
      return answerNumber >= ruleNumber;
    default:
      return false;
  }
}

function ruleMatchesAnswers(rule, answerMap) {
  return rule.details.every((detail) => {
    const answer = answerMap.get(detail.id_variabel);

    if (!answer) return false;

    return compareValue(
      detail.operator,
      detail.nilai,
      answer.nilai,
      detail.variabel.tipe_variabel
    );
  });
}

function findMatchingRules(rules, answerMap) {
  return rules.filter((rule) => ruleMatchesAnswers(rule, answerMap));
}

async function validateCasePayload(req, res) {
  const namaAsesi = String(req.body.nama_asesi || "").trim();
  const idOrganisasi = isSuperAdmin(req.user)
    ? Number(req.body.id_organisasi)
    : requireOrganizationScope(req, res);
  const answers = normalizeAnswers(req.body.answers);

  if (!namaAsesi) {
    res.status(400).json({ message: "Nama asesi wajib diisi" });
    return null;
  }

  if (!idOrganisasi) {
    res.status(400).json({ message: "User belum terhubung dengan organisasi" });
    return null;
  }

  const organization = await prisma.organisasi.findUnique({
    where: {
      id_organisasi: idOrganisasi,
    },
  });

  if (!organization) {
    res.status(400).json({ message: "Organisasi tidak valid" });
    return null;
  }

  const variables = await prisma.variabel.findMany({
    where: isSuperAdmin(req.user)
      ? {}
      : getScopedWhere(req),
    orderBy: { id_variabel: "asc" },
  });

  if (variables.length === 0) {
    res.status(400).json({ message: "Belum ada variabel untuk dinilai" });
    return null;
  }

  const variableMap = new Map(
    variables.map((variable) => [variable.id_variabel, variable])
  );
  const answerMap = new Map();

  for (const answer of answers) {
    const idVariabel = Number(answer.id_variabel);
    const nilai = String(answer.nilai ?? "").trim().toLowerCase();
    const variable = variableMap.get(idVariabel);

    if (!variable) {
      res.status(400).json({ message: "Variabel case tidak valid" });
      return null;
    }

    if (!nilai) {
      res.status(400).json({ message: "Semua nilai variabel wajib diisi" });
      return null;
    }

    if (variable.tipe_variabel === "boolean" && !["ya", "tidak"].includes(nilai)) {
      res.status(400).json({
        message: "Nilai untuk variabel Ya/Tidak harus ya atau tidak",
      });
      return null;
    }

    if (variable.tipe_variabel === "number" && Number.isNaN(Number(nilai))) {
      res.status(400).json({
        message: "Nilai untuk variabel score harus berupa angka",
      });
      return null;
    }

    answerMap.set(idVariabel, {
      id_variabel: idVariabel,
      nilai,
    });
  }

  const missingVariable = variables.find(
    (variable) => !answerMap.has(variable.id_variabel)
  );

  if (missingVariable) {
    res.status(400).json({
      message: `Variabel ${missingVariable.nama_variabel} wajib diisi`,
    });
    return null;
  }

  return {
    nama_asesi: namaAsesi,
    id_organisasi: idOrganisasi,
    answers: Array.from(answerMap.values()),
    answerMap,
  };
}

const caseInclude = {
  user: {
    select: {
      id_user: true,
      nama_lengkap: true,
      email: true,
    },
  },
  organisasi: true,
  rule: true,
  kategori: true,
  results: {
    include: {
      kategori: true,
      rule: true,
    },
  },
  answers: {
    include: {
      variabel: true,
    },
  },
};

exports.createCase = async (req, res) => {
  const data = await validateCasePayload(req, res);
  if (!data) return;

  const rules = await prisma.rule.findMany({
    where: isSuperAdmin(req.user)
      ? {}
      : getScopedWhere(req),
    include: {
      kategori: true,
      details: {
        include: {
          variabel: true,
        },
      },
    },
    orderBy: {
      id_rule: "asc",
    },
  });
  const matchingRules = findMatchingRules(rules, data.answerMap);
  const firstMatchingRule = matchingRules[0];

  const caseItem = await prisma.case.create({
    data: {
      id_user: req.user.id,
      id_organisasi: data.id_organisasi,
      id_rule: firstMatchingRule?.id_rule || null,
      id_kategori: firstMatchingRule?.id_kategori || null,
      nama_asesi: data.nama_asesi,
      rekomendasi: firstMatchingRule?.rekomendasi || null,
      answers: {
        create: data.answers,
      },
      results: {
        create: matchingRules.map((rule) => ({
          id_rule: rule.id_rule,
          id_kategori: rule.id_kategori,
          rekomendasi: rule.rekomendasi || null,
        })),
      },
    },
    include: caseInclude,
  });

  res.json(caseItem);
};

exports.getCases = async (req, res) => {
  const scopedWhere = getScopedWhere(req);

  if (!scopedWhere) {
    return res.status(400).json({
      message: "User belum terhubung dengan organisasi",
    });
  }

  const where = {
    ...scopedWhere,
    ...(req.user.role === "PENGGUNA" ? { id_user: req.user.id } : {}),
  };

  const cases = await prisma.case.findMany({
    where,
    include: caseInclude,
    orderBy: {
      id_case: "desc",
    },
  });

  res.json(cases);
};

exports.getCaseById = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "ID case tidak valid" });
  }

  const existingCase = await prisma.case.findUnique({
    where: {
      id_case: id,
    },
    include: caseInclude,
  });

  if (!existingCase) {
    return res.status(404).json({ message: "Case tidak ditemukan" });
  }

  const userOrganizationId = getUserOrganizationId(req.user);

  if (
    !isSuperAdmin(req.user) &&
    existingCase.id_organisasi !== userOrganizationId
  ) {
    return res.status(403).json({ message: "Access denied" });
  }

  if (req.user.role === "PENGGUNA" && existingCase.id_user !== req.user.id) {
    return res.status(403).json({ message: "Access denied" });
  }

  return res.json(existingCase);
};

exports.updateCase = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "ID case tidak valid" });
  }

  const existingCase = await prisma.case.findUnique({
    where: {
      id_case: id,
    },
  });

  if (!existingCase) {
    return res.status(404).json({ message: "Case tidak ditemukan" });
  }

  const userOrganizationId = getUserOrganizationId(req.user);

  if (
    !isSuperAdmin(req.user) &&
    existingCase.id_organisasi !== userOrganizationId
  ) {
    return res.status(403).json({ message: "Access denied" });
  }

  const data = await validateCasePayload(req, res);
  if (!data) return;

  const rules = await prisma.rule.findMany({
    where: isSuperAdmin(req.user)
      ? {}
      : getScopedWhere(req),
    include: {
      kategori: true,
      details: {
        include: {
          variabel: true,
        },
      },
    },
    orderBy: {
      id_rule: "asc",
    },
  });
  const matchingRules = findMatchingRules(rules, data.answerMap);
  const firstMatchingRule = matchingRules[0];

  const caseItem = await prisma.$transaction(async (tx) => {
    await tx.caseAnswer.deleteMany({
      where: {
        id_case: id,
      },
    });
    await tx.caseResult.deleteMany({
      where: {
        id_case: id,
      },
    });

    return tx.case.update({
      where: {
        id_case: id,
      },
      data: {
        id_organisasi: data.id_organisasi,
        id_rule: firstMatchingRule?.id_rule || null,
        id_kategori: firstMatchingRule?.id_kategori || null,
        nama_asesi: data.nama_asesi,
        rekomendasi: firstMatchingRule?.rekomendasi || null,
        answers: {
          create: data.answers,
        },
        results: {
          create: matchingRules.map((rule) => ({
            id_rule: rule.id_rule,
            id_kategori: rule.id_kategori,
            rekomendasi: rule.rekomendasi || null,
          })),
        },
      },
      include: caseInclude,
    });
  });

  return res.json(caseItem);
};

exports.deleteCase = async (req, res) => {
  const id = Number(req.params.id);
  const existingCase = await prisma.case.findUnique({
    where: {
      id_case: id,
    },
  });

  if (!existingCase) {
    return res.status(404).json({ message: "Case tidak ditemukan" });
  }

  const userOrganizationId = getUserOrganizationId(req.user);

  if (
    !isSuperAdmin(req.user) &&
    existingCase.id_organisasi !== userOrganizationId
  ) {
    return res.status(403).json({ message: "Access denied" });
  }

  if (req.user.role === "PENGGUNA" && existingCase.id_user !== req.user.id) {
    return res.status(403).json({ message: "Access denied" });
  }

  await prisma.case.delete({
    where: {
      id_case: id,
    },
  });

  res.json({
    message: "Case deleted",
  });
};
