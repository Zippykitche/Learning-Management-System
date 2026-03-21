const router = require("express").Router();
const controller = require("./lessons.controller");
const auth = require("../auth/authMiddleware");
const role = require("../users/roleMiddleware");

router.post("/", auth, role("admin"), controller.createLesson);
router.put("/:id", auth, role("admin"), controller.updateLesson);
router.delete("/:id", auth, role("admin"), controller.deleteLesson);
router.get("/:id", controller.getLessonById);
router.get("/courses/:courseId/lessons", controller.getLessons);

module.exports = router;