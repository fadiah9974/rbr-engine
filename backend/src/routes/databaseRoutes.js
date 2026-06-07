const router = require("express").Router();

const controller = require("../controllers/databaseController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.use(auth, role("SUPER_ADMIN"));

router.get("/tables", controller.getTables);
router.get("/:table", controller.getRows);
router.post("/:table", controller.createRow);
router.put("/:table/:id", controller.updateRow);
router.delete("/:table/:id", controller.deleteRow);

module.exports = router;
