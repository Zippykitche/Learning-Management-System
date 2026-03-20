const router = require("express").Router();
const controller = require("./users.controller");
const auth = require("../auth/authMiddleware");
const role = require("./roleMiddleware");

router.get("/me", auth, controller.getMe);
router.get("/", auth, role("admin"), controller.getAllUsers);

module.exports = router;