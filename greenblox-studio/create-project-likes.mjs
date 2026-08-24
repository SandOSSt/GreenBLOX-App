import pg from "pg";
const pool = new pg.Pool({ connectionString: "postgresql://postgres:postgres@127.0.0.1:5432/app_db" });

await pool.query(`
  CREATE TABLE IF NOT EXISTS project_likes (
    id serial PRIMARY KEY,
    user_id integer NOT NULL,
    project_id integer NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
  )
`);
// Один пользователь может лайкнуть проект только один раз.
await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS idx_project_likes_user_project ON project_likes(user_id, project_id)");
await pool.query("CREATE INDEX IF NOT EXISTS idx_project_likes_project ON project_likes(project_id)");

const res = await pool.query(
  "SELECT table_name FROM information_schema.tables WHERE table_name = 'project_likes'"
);
console.log("project_likes table:", JSON.stringify(res.rows));
await pool.end();
