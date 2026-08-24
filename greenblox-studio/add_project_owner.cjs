// Migration: add owner_id to projects + index, and backfill owners by author name.
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
});

async function main() {
  // 1. Add owner_id column (nullable — official/seeded projects stay NULL).
  await pool.query(`
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_id integer
  `);

  // 2. Index for profile lookups (fast "maps of this user" queries).
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id)
  `);

  // 3. Backfill: link existing user-created projects to accounts by author name.
  //    Seed projects have author like "Engine Engineer"/"GreenBlox Official" and
  //    will remain NULL (owned by nobody = official catalog).
  await pool.query(`
    UPDATE projects p
    SET owner_id = u.id
    FROM users u
    WHERE p.owner_id IS NULL
      AND lower(p.author) = lower(u.name)
  `);

  // Report
  const { rows } = await pool.query(`
    SELECT count(*) AS total,
           count(owner_id) AS owned,
           count(*) FILTER (WHERE owner_id IS NULL) AS unowned
    FROM projects
  `);
  console.log("Migration OK:", rows[0]);
  process.exit(0);
}

main().catch((e) => {
  console.error("Migration error:", e.message);
  process.exit(1);
});
