const router = require("express").Router();

const controller = require("../controllers/ruleController");

const auth = require("../middleware/authMiddleware");

const role = require("../middleware/roleMiddleware");

router.post("/", auth, role("ADMIN"), controller.createRule);

router.get("/", auth, role("SUPER_ADMIN", "ADMIN"), controller.getRules);

router.get("/:id", auth, role("SUPER_ADMIN", "ADMIN"), controller.getRuleById);

router.put("/:id", auth, role("ADMIN"), controller.updateRule);

router.delete("/:id", auth, role("ADMIN"), controller.deleteRule);

module.exports = router;
