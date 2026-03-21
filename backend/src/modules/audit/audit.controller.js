const Audit = require("./audit.model");
const pool = require("../../config/postgres");

exports.getAllLogs = async (req, res) => {
  try {
    const logs = await Audit.find().sort({ timestamp: -1 });

    // Get all unique userIds
    const userIds = [...new Set(logs.map(log => log.userId))];

    // Fetch users from PostgreSQL
    const usersResult = await pool.query(
      `SELECT id, name, email FROM users WHERE id = ANY($1)  AND role = 'learner'`,
      [userIds]
    );

    const usersMap = {};
    usersResult.rows.forEach(user => {
      usersMap[user.id] = user;
    });

    // Merge logs + user info
    const enrichedLogs = logs.map(log => ({
      ...log._doc,
      user: usersMap[log.userId] || null,
    })).filter(log => log.user !== null);

    res.json(enrichedLogs);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
};