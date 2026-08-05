const fetch = require('node-fetch');
async function test() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@navobarber.com', password: 'admin' }) 
  });
  if (!loginRes.ok) {
    const text = await loginRes.text();
    console.log("Login failed:", text);
  } else {
    const auth = await loginRes.json();
    console.log("Token:", auth.token);
    
    const qRes = await fetch('http://localhost:3000/api/queue', {
      headers: { 'Authorization': 'Bearer ' + auth.token }
    });
    const text = await qRes.text();
    console.log("Queue response:", qRes.status, text);
  }
}
test();
