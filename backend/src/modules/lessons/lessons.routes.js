const router = require("express").Router();
const controller = require("./lessons.controller");
const auth = require("../auth/authMiddleware");
const role = require("../users/roleMiddleware");

router.post("/", auth, role("admin"), controller.createLesson);
router.get("/:courseId", controller.getLessons);

module.exports = router;