import pg from "pg";
const pool = new pg.Pool({ connectionString: "postgresql://postgres:postgres@127.0.0.1:5432/app_db" });

await pool.query(`
  CREATE TABLE IF NOT EXISTS user_profiles (
    user_id integer PRIMARY KEY,
    handle text NOT NULL DEFAULT '',
    bio text NOT NULL DEFAULT '',
    cover_style text NOT NULL DEFAULT 'emerald',
    status_quote text NOT NULL DEFAULT '',
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )
`);
await pool.query(`
  CREATE TABLE IF NOT EXISTS user_game_stats (
    id serial PRIMARY KEY,
    user_id integer NOT NULL,
    game_id text NOT NULL,
    count integer NOT NULL DEFAULT 0,
    last_played_at integer NOT NULL DEFAULT 0,
    total_coins integer NOT NULL DEFAULT 0,
    total_deaths integer NOT NULL DEFAULT 0,
    total_time_sec integer NOT NULL DEFAULT 0,
    best_stage integer NOT NULL DEFAULT 0,
    wins integer NOT NULL DEFAULT 0,
    updated_at timestamp NOT NULL DEFAULT now()
  )
`);
await pool.query("CREATE INDEX IF NOT EXISTS idx_game_stats_user ON user_game_stats(user_id)");

const res = await pool.query(
  "SELECT table_name FROM information_schema.tables WHERE table_name IN ('user_profiles','user_game_stats') ORDER BY table_name"
);
console.log("tables:", JSON.stringify(res.rows));
await pool.end();
