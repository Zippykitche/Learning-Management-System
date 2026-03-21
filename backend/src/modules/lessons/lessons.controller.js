const Lesson = require("./lesson.model");
const { logAction } = require("../../utils/auditLogger");

exports.createLesson = async (req, res) => {
  const lesson = await Lesson.create(req.body);
  res.json(lesson);
};

exports.getLessons = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);

    if (isNaN(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const lessons = await Lesson.find({
      courseId: courseId,
    });

    if (req.user) {
      await logAction(req.user.id, "VIEW_LESSONS", {
        courseId: courseId,
      });
    }

    res.json(lessons);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch lessons" });
  }
};

//get lesson by id
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: "Error fetching lesson" });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;

    const updated = await Lesson.findByIdAndUpdate(
      lessonId,
      {
        title: req.body.title,
        type: req.body.type,
        content: req.body.content,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    await logAction(req.user.id, "UPDATE_LESSON", {
      lessonId,
    });

    res.json(updated);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update lesson" });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;

    const deleted = await Lesson.findByIdAndDelete(lessonId);

    if (!deleted) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    await logAction(req.user.id, "DELETE_LESSON", {
      lessonId,
    });

    res.json({ message: "Lesson deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete lesson" });
  }
};