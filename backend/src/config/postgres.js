const { Pool } = require("pg");
const bcrypt = require("bcrypt");

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

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "zipporah@gmail.com";
    const adminPass = process.env.ADMIN_PASSWORD || "123456";
    const adminName = process.env.ADMIN_NAME || "Zipporah";

    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [adminEmail]);
    if (userCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPass, 10);
      await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
        [adminName, adminEmail, hashedPassword, "admin"]
      );
      console.log(`Admin user (${adminEmail}) seeded successfully ✅`);
    } else {
      const user = userCheck.rows[0];
      if (user.role !== "admin") {
        await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [user.id]);
        console.log(`Updated user (${adminEmail}) to admin role ✅`);
      }
    }
  } catch (err) {
    console.error("Error seeding admin user:", err.message);
  }
};

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
    await seedAdmin();
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