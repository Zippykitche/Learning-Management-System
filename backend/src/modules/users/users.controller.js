const pool = require("../../config/postgres");

// ---------------- GET CURRENT USER ----------------
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id=$1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("GET ME ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- UPDATE PROFILE ----------------
exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    // 🔒 basic validation
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // 🔒 check if email already exists (optional but recommended)
    const emailCheck = await pool.query(
      "SELECT id FROM users WHERE email=$1 AND id != $2",
      [email, userId]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // ✅ update user
    const result = await pool.query(
      `UPDATE users 
       SET name=$1, email=$2 
       WHERE id=$3 
       RETURNING id, name, email, role`,
      [name, email, userId]
    );

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error("UPDATE USER ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- GET ALL USERS (ADMIN) ----------------
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role FROM users"
    );

    res.json(result.rows);

  } catch (error) {
    console.error("GET ALL USERS ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};