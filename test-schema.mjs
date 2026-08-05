import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const sql = postgres(process.env.DATABASE_URL);
  const res = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
  console.log(res);
  try {
      const qres = await sql`SELECT * FROM waiting_queue LIMIT 1`;
      console.log(qres);
  } catch (err) {
      console.error(err);
  }
  process.exit(0);
}
test();
