const { Pool } = require("pg");

let connectionString = process.env.DATABASE_URL;
let host = process.env.PG_HOST;

// Auto-expand bare internal Render Postgres hostnames (dpg-xxx-a) to external hostname if DNS resolution fails externally
if (connectionString && /@dpg-[a-z0-9]+-[a-z0-9]+[:\/]/i.test(connectionString) && !connectionString.includes(".render.com")) {
  const region = process.env.RENDER_REGION || "oregon";
  connectionString = connectionString.replace(
    /@(dpg-[a-z0-9]+-[a-z0-9]+)([:\/])/i,
    `@$1.${region}-postgres.render.com$2`
  );
  console.log("Transformed internal Render Postgres URL to external URL format for global DNS resolution.");
}

if (host && /^dpg-[a-z0-9]+-[a-z0-9]+$/i.test(host)) {
  const region = process.env.RENDER_REGION || "oregon";
  host = `${host}.${region}-postgres.render.com`;
  console.log(`Transformed internal Render Postgres host to ${host}`);
}

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: process.env.PG_SSL === "false" ? false : { rejectUnauthorized: false },
    }
  : {
      user: process.env.PG_USER,
      host: host || process.env.PG_HOST,
      database: process.env.PG_DB,
      password: process.env.PG_PASSWORD,
      port: process.env.PG_PORT || 5432,
      ssl: process.env.PG_SSL === "true" || process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err);
});

module.exports = pool;

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'learner',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        created_by INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database tables verified/created successfully ✅");
  } catch (err) {
    console.error("Error creating database tables:", err.message);
  }
};

const connectWithRetry = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected ✅");
    await initDb();
  } catch (err) {
    console.error("Postgres connection error:", err.message);
    console.log("Postgres not ready, retrying in 5s...");
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();