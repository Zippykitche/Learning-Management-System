const Lesson = require("./lesson.model");
const { logAction } = require("../../utils/auditLogger");

exports.createLesson = async (req, res) => {
  const lesson = await Lesson.create(req.body);
  res.json(lesson);
};

exports.getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({
      courseId: req.params.courseId,
    });

    // Only log if user is authenticated
    if (req.user) {
      await logAction(req.user.id, "VIEW_LESSONS", {
        courseId: req.params.courseId,
      });
    }

    res.json(lessons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch lessons" });
  }
};