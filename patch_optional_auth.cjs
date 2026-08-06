const fs = require('fs');
let code = fs.readFileSync('api/index.ts', 'utf8');

const oldOptional = `const optionalAuth = (req: any, res: any, next: any) => {
  let token = req.cookies?.token;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token && req.query.auth_token) {
    token = req.query.auth_token;
  }

  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      req.user = { id: 'usr_guest', role: 'guest' };
    }
  } else {
    req.user = { id: 'usr_guest', role: 'guest' };
  }
  next();
};`;

const newOptional = `const optionalAuth = (req: any, res: any, next: any) => {
  let token = null;
  if (req.cookies?.token) {
    token = req.cookies.token;
  }
  else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      req.user = { id: 'usr_guest', role: 'guest' };
    }
  } else {
    req.user = { id: 'usr_guest', role: 'guest' };
  }
  next();
};`;

if (code.includes(oldOptional)) {
  code = code.replace(oldOptional, newOptional);
  fs.writeFileSync('api/index.ts', code);
  console.log('patched optionalAuth');
} else {
  console.log('could not find oldOptional');
}
