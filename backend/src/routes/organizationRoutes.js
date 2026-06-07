const router = require("express").Router();

const controller = require("../controllers/organizationController");

const auth = require("../middleware/authMiddleware");

const role = require("../middleware/roleMiddleware");

router.get("/", auth, role("SUPER_ADMIN", "ADMIN"), controller.getOrganizations);

router.get("/:id", auth, role("SUPER_ADMIN", "ADMIN"), controller.getOrganizationById);

router.post("/", auth, role("SUPER_ADMIN"), controller.createOrganization);

router.put("/:id", auth, role("SUPER_ADMIN"), controller.updateOrganization);

router.delete("/:id", auth, role("SUPER_ADMIN"), controller.deleteOrganization);

module.exports = router;