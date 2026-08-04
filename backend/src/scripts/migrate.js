const { Pool } = require("pg");
require("dotenv").config();

async function runMigration() {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("No DATABASE_URL found in environment");
    process.exit(1);
  }

  // Handle bare Render internal hostname if running externally
  if (/@dpg-[a-z0-9]+-[a-z0-9]+[:\/]/i.test(connectionString) && !connectionString.includes(".render.com")) {
    const region = process.env.RENDER_REGION || "oregon";
    connectionString = connectionString.replace(
      /@(dpg-[a-z0-9]+-[a-z0-9]+)([:\/])/i,
      `@$1.${region}-postgres.render.com$2`
    );
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("Connecting to PostgreSQL database...");
    await pool.query("SELECT NOW()");
    console.log("Connected successfully!");

    console.log("Creating 'users' table if not exists...");
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

    console.log("Creating 'courses' table if not exists...");
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

    console.log("✅ Database migration completed successfully!");
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
