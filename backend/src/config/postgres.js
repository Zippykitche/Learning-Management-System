const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production" || !!process.env.DATABASE_URL;

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PG_SSL === "false" ? false : { rejectUnauthorized: false },
    }
  : {
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DB,
      password: process.env.PG_PASSWORD,
      port: process.env.PG_PORT || 5432,
      ssl: process.env.PG_SSL === "true" ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err);
});

module.exports = pool;

const connectWithRetry = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected ✅");
  } catch (err) {
    console.error("Postgres connection error:", err.message);
    console.log("Postgres not ready, retrying in 5s...");
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();