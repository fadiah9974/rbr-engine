const router = require("express").Router();

const controller = require("../controllers/superAdminController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get(
  "/users",
  auth,
  role("SUPER_ADMIN", "ADMIN"),
  controller.getAllUsers
);

router.get(
  "/users/:id",
  auth,
  role("SUPER_ADMIN", "ADMIN"),
  controller.getUserById
);

router.post(
  "/users/regular",
  auth,
  role("SUPER_ADMIN", "ADMIN"),
  controller.createRegularUser
);

router.post(
  "/users/admin",
  auth,
  role("SUPER_ADMIN"),
  controller.createAdminUser
);

router.post(
  "/users/super-admin",
  auth,
  role("SUPER_ADMIN"),
  controller.createSuperAdminUser
);

router.put(
  "/users/:id",
  auth,
  role("SUPER_ADMIN", "ADMIN"),
  controller.updateUser
);

router.delete(
  "/users/:id",
  auth,
  role("SUPER_ADMIN", "ADMIN"),
  controller.deleteUser
);

module.exports = router;