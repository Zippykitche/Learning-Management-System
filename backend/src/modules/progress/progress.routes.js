const router = require("express").Router();
const controller = require("./progress.controller");
const auth = require("../auth/authMiddleware");

router.post("/toggle", auth, controller.toggleLesson);
router.get("/:courseId", auth, controller.getProgress);

module.exports = router;