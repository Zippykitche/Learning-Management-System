const router = require("express").Router();
const controller = require("./courses.controller");
const auth = require("../auth/authMiddleware");
const role = require("../users/roleMiddleware");

router.post("/", auth, role("admin"), controller.createCourse);
router.get("/", controller.getCourses);
router.get("/:id", controller.getCourse);

module.exports = router;