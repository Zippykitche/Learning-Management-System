const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  port: 5432,
});

module.exports = pool;

const connectWithRetry = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected ✅");
  } catch (err) {
    console.log("Postgres not ready, retrying in 3s...");
    setTimeout(connectWithRetry, 3000);
  }
};

connectWithRetry();