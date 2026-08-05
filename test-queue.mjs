async function test() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: 'admin' }) 
  });
  if (!loginRes.ok) {
    const text = await loginRes.text();
    console.log("Login failed:", text);
    const loginRes2 = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@barberx.com', password: 'admin' }) 
    });
    const auth2 = await loginRes2.json();
    if(auth2.token) {
        console.log("Token2:", auth2.token);
        const qRes = await fetch('http://localhost:3000/api/queue', {
          headers: { 'Authorization': 'Bearer ' + auth2.token }
        });
        const text2 = await qRes.text();
        console.log("Queue response:", qRes.status, text2);
    }
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
