const pool = require("../../config/postgres");
const { logAction } = require("../../utils/auditLogger");

exports.createCourse = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, description, category } = req.body;

    const result = await pool.query(
      "INSERT INTO courses (title, description, category, created_by) VALUES ($1,$2,$3,$4) RETURNING *",
      [title, description, category, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating course" });
  }
};


exports.getCourses = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM courses");

    // ✅ safe logging (no undefined email)
    if (req.user) {
      await logAction(req.user.id, "VIEW_COURSES");
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching courses" });
  }
};


exports.getCourse = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM courses WHERE id=$1",
      [req.params.id]
    );

    const course = result.rows[0];

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // ✅ clean metadata
    if (req.user) {
      await logAction(req.user.id, "VIEW_COURSE", {
        courseId: course.id,
      });
    }

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching course" });
  }
};