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