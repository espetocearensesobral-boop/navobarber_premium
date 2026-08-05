import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './src/db/schema.ts';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
  const sql = postgres(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });
  try {
    const queue = await db.query.waitingQueue.findMany();
    console.log("Success:", queue);
  } catch(e) {
    console.error("Error:", e);
  }
  process.exit(0);
}
test();
