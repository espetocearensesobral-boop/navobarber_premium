const fs = require('fs');

let code = fs.readFileSync('api/index.ts', 'utf8');

const oldRequireAuth = `const requireAuth = (req: any, res: any, next: any) => {
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

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};`;

const newRequireAuth = `const requireAuth = async (req: any, res: any, next: any) => {
  let token = null;
  
  // Apenas 2 fontes seguras (removido query param)
  if (req.cookies?.token) {
    token = req.cookies.token;
  }
  else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Sessão expirada. Faça login novamente.' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ 
      error: 'Sessão expirada. Faça login novamente.' 
    });
  }
};`;

const oldSetAuthCookie = `const setAuthCookie = (res: any, token: string) => {
  const cookieOptions: any = {
    httpOnly: true,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'none',
    secure: true,
  };
  
  res.cookie('token', token, cookieOptions);
  res.setHeader('X-Auth-Token', token);
};`;

const newSetAuthCookie = `const setAuthCookie = (res: any, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};`;

if(code.includes(oldRequireAuth)){
  code = code.replace(oldRequireAuth, newRequireAuth);
  console.log('patched requireAuth');
} else {
  console.log('could not find oldRequireAuth');
}

if(code.includes(oldSetAuthCookie)){
  code = code.replace(oldSetAuthCookie, newSetAuthCookie);
  console.log('patched setAuthCookie');
} else {
  console.log('could not find oldSetAuthCookie');
}

fs.writeFileSync('api/index.ts', code);
