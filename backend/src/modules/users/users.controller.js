const pool = require("../../config/postgres");

// Get current logged-in user
exports.getMe = async (req, res) => {
  const userId = req.user.id;

  const result = await pool.query(
    "SELECT id, name, email, role FROM users WHERE id=$1",
    [userId]
  );

  res.json(result.rows[0]);
};

// (Admin) Get all users
exports.getAllUsers = async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, email, role FROM users"
  );

  res.json(result.rows);
};