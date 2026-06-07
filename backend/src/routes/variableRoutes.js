const router = require("express").Router();

const controller = require("../controllers/variableController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get(
  "/",
  auth,
  role("SUPER_ADMIN", "ADMIN", "PENGGUNA"),
  controller.getVariables
);

router.get(
  "/:id",
  auth,
  role("SUPER_ADMIN", "ADMIN"),
  controller.getVariableById
);

router.post(
  "/",
  auth,
  role("ADMIN"),
  controller.createVariable
);

router.put(
  "/:id",
  auth,
  role("ADMIN"),
  controller.updateVariable
);

router.delete(
  "/:id",
  auth,
  role("ADMIN"),
  controller.deleteVariable
);

module.exports = router;
