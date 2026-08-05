import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

async function test() {
  const token = jwt.sign({ id: 'test-admin', role: 'admin', phone: '11999999999' }, process.env.JWT_SECRET || 'fallback-secret-for-dev', { expiresIn: '1d' });
  const res = await fetch('http://localhost:3000/api/queue', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Body:", text);
  process.exit(0);
}
test();
