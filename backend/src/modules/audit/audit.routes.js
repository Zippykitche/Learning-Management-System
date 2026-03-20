const router = require("express").Router();
const controller = require("./audit.controller");
const auth = require("../auth/authMiddleware");
const role = require("../users/roleMiddleware");

router.get("/", auth, role("admin"), controller.getAllLogs);

module.exports = router;