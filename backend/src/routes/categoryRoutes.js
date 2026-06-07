const router = require("express").Router();

const controller = require("../controllers/categoryController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Ambil semua kategori
router.get(
  "/",
  auth,
  role("SUPER_ADMIN", "ADMIN"),
  controller.getCategories
);

// Ambil detail kategori berdasarkan ID
router.get(
  "/:id",
  auth,
  role("SUPER_ADMIN", "ADMIN"),
  controller.getCategoryById
);

// Tambah kategori
router.post(
  "/",
  auth,
  role("ADMIN"),
  controller.createCategory
);

// Update kategori
router.put(
  "/:id",
  auth,
  role("ADMIN"),
  controller.updateCategory
);

// Hapus kategori
router.delete(
  "/:id",
  auth,
  role("ADMIN"),
  controller.deleteCategory
);

module.exports = router;
