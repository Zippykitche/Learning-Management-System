const pool = require("../../config/postgres");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { logAction } = require("../../utils/auditLogger");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING *",
      [name, email, hashed, "learner"]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: err.message || "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    const user = result.rows[0];

    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).json({ message: "Invalid password" });

    const secret = process.env.JWT_SECRET || "lms_fallback_jwt_secret";
    const token = jwt.sign(
      { id: user.id, role: user.role },
      secret
    );

    await logAction(user.id, "LOGIN", { email }).catch(err => {
      console.error("Audit log failed:", err.message);
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: err.message || "Login failed" });
  }
};