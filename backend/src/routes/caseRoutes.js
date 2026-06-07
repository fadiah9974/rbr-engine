const router = require("express").Router();

const controller = require("../controllers/caseController");

const auth = require("../middleware/authMiddleware");

const role = require("../middleware/roleMiddleware");

router.post("/", auth, role("SUPER_ADMIN", "ADMIN", "PENGGUNA"), controller.createCase);

router.get("/", auth, role("SUPER_ADMIN", "ADMIN", "PENGGUNA"), controller.getCases);

router.get("/:id", auth, role("SUPER_ADMIN", "ADMIN", "PENGGUNA"), controller.getCaseById);

router.put("/:id", auth, role("SUPER_ADMIN", "ADMIN"), controller.updateCase);

router.delete("/:id", auth, role("SUPER_ADMIN", "ADMIN"), controller.deleteCase);

module.exports = router;