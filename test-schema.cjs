const { Pool } = require('pg');
require('dotenv').config();
async function test() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const res = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`);
  console.log(res.rows);
  const qres = await pool.query(`SELECT * FROM waiting_queue LIMIT 1`);
  console.log(qres.rows);
  pool.end();
}
test();
