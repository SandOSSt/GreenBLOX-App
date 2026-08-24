import pg from "pg";
const pool = new pg.Pool({ connectionString: "postgresql://postgres:postgres@127.0.0.1:5432/app_db" });
const res = await pool.query(
  "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position"
);
console.log(JSON.stringify(res.rows, null, 2));
const req = await pool.query(
  "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'friend_requests' ORDER BY ordinal_position"
);
console.log("friend_requests:", JSON.stringify(req.rows, null, 2));
process.exit(0);
