const fetch = require('node-fetch');
async function test() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'tauanpires7@gmail.com', password: 'admin' }) // assuming default admin
  });
  if (!loginRes.ok) {
    const text = await loginRes.text();
    console.log("Login failed:", text);
    // try different password or phone
    return;
  }
  const auth = await loginRes.json();
  console.log("Token:", auth.token);
  
  const qRes = await fetch('http://localhost:3000/api/queue', {
    headers: { 'Authorization': 'Bearer ' + auth.token }
  });
  const text = await qRes.text();
  console.log("Queue response:", qRes.status, text);
}
test();
