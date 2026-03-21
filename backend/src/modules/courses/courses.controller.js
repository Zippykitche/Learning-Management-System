const pool = require("../../config/postgres");
const { logAction } = require("../../utils/auditLogger");
const Lesson = require("../lessons/lesson.model");

// ---------------- CREATE ----------------
exports.createCourse = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, description, category } = req.body;
    
    if (!title || !description || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await pool.query(
      "INSERT INTO courses (title, description, category, created_by) VALUES ($1,$2,$3,$4) RETURNING *",
      [title, description, category, req.user.id]
    );

    await logAction(req.user.id, "CREATE_COURSE", {
      courseId: result.rows[0].id,
    });

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating course" });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM courses ORDER BY id DESC"
    );

    const courses = result.rows;

    const coursesWithCounts = await Promise.all(
      courses.map(async (course) => {
        const count = await Lesson.countDocuments({
          courseId: course.id,
        });

        return {
          ...course,
          lessonCount: count,
        };
      })
    );

    if (req.user) {
      await logAction(req.user.id, "VIEW_COURSES");
    }

    res.json(coursesWithCounts);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching courses" });
  }
};
// ---------------- GET ONE ----------------
exports.getCourse = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const result = await pool.query(
      "SELECT * FROM courses WHERE id=$1",
      [req.params.id]
    );

    const course = result.rows[0];

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

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


// ---------------- UPDATE ----------------
exports.updateCourse = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, description, category } = req.body;

    const result = await pool.query(
      `UPDATE courses 
       SET title=$1, description=$2, category=$3 
       WHERE id=$4 
       RETURNING *`,
      [title, description, category, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    await logAction(req.user.id, "UPDATE_COURSE", {
      courseId: req.params.id,
    });

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating course" });
  }
};


// ---------------- DELETE ----------------
exports.deleteCourse = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await pool.query(
      "DELETE FROM courses WHERE id=$1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    await logAction(req.user.id, "DELETE_COURSE", {
      courseId: req.params.id,
    });

    res.json({ message: "Course deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting course" });
  }
};