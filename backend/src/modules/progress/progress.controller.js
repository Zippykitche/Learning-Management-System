const Progress = require("./progress.model");
const Lesson = require("../lessons/lesson.model");
const { logAction } = require("../../utils/auditLogger");

// ---------------- GET PROGRESS ----------------
exports.getProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = Number(req.params.courseId);
    const progress = await Progress.findOne({ userId, courseId });
    const totalLessons = await Lesson.countDocuments({ courseId });
    const completed = progress ? progress.completedLessons.length : 0;
    const completedLessons = progress ? progress.completedLessons : [];

    res.json({
      courseId,
      completed,
      total: totalLessons,
      completedLessons,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch progress" });
  }
};

// ---------------- TOGGLE LESSON ----------------
exports.toggleLesson = async (req, res) => {
  try {
    const courseId = Number(req.body.courseId);
    const lessonId = req.body.lessonId;
    const userId = req.user.id;

    let progress = await Progress.findOne({ userId, courseId });

    if (!progress) {
      progress = await Progress.create({
        userId,
        courseId,
        completedLessons: [lessonId],
      });

      await logAction(userId, "COMPLETE_LESSON", {
        courseId,
        lessonId,
      });

      return res.json({ progress, status: "completed" });
    }

    const alreadyCompleted = progress.completedLessons
      .map(String)
      .includes(String(lessonId));

    if (alreadyCompleted) {
      // 🔴 UNMARK
      progress.completedLessons = progress.completedLessons.filter(
        (id) => String(id) !== String(lessonId)
      );

      await progress.save();

      await logAction(userId, "UNMARK_LESSON", {
        courseId,
        lessonId,
      });

      return res.json({ progress, status: "unmarked" });

    } else {
      // 🟢 MARK
      progress.completedLessons.push(lessonId);

      await progress.save();

      await logAction(userId, "COMPLETE_LESSON", {
        courseId,
        lessonId,
      });

      return res.json({ progress, status: "completed" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update progress" });
  }
};