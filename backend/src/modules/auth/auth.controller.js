const pool = require("../../config/postgres");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { logAction } = require("../../utils/auditLogger");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const result = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING *",
    [name, email, hashed, "learner"]
  );

  res.json(result.rows[0]);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  const user = result.rows[0];

  if (!user) return res.status(400).send("User not found");

  const match = await bcrypt.compare(password, user.password);

  if (!match) return res.status(400).send("Invalid password");

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET
  );

   await logAction(user.id, "LOGIN", {email,});

  res.json({ token });
};