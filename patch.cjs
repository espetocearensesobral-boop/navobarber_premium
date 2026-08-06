const fs = require('fs');
let code = fs.readFileSync('api/index.ts', 'utf8');

const target = `const requireAuth = (req: any, res: any, next: any) => {
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

const replacement = `const requireAuth = async (req: any, res: any, next: any) => {
  let token = null;
  let tokenSource = 'none';

  if (req.cookies?.token) {
    token = req.cookies.token;
    tokenSource = 'cookie';
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
    tokenSource = 'header';
  } else if (req.query?.auth_token) {
    token = req.query.auth_token;
    tokenSource = 'query';
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
    tokenSource = 'x-header';
  }

  if (!token) {
    console.warn(\`[AUTH] Nenhum token encontrado. Cookies: \${Object.keys(req.cookies || {}).join(', ')}\`);
    return res.status(401).json({ 
      error: 'Token não encontrado. Faça login novamente.',
      debug: process.env.NODE_ENV !== 'production' ? {
        cookies: Object.keys(req.cookies || {}),
        headers: Object.keys(req.headers).filter((h: string) => h.toLowerCase().includes('auth') || h.toLowerCase().includes('cookie')),
      } : undefined
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    
    if (isDbConnected && db) {
      try {
        const profile = await db.query.profiles.findFirst({
          where: eq(schema.profiles.id, (decoded as any).id)
        });
        if (profile) {
          req.user = { ...(decoded as any), phone: profile.phone, name: profile.name };
        }
      } catch (e) {}
    }
    
    next();
  } catch (err: any) {
    console.warn(\`[AUTH] Token inválido de \${tokenSource}:\`, err.message);
    return res.status(401).json({ 
      error: 'Token inválido ou expirado. Faça login novamente.' 
    });
  }
};`;

code = code.replace(target, replacement);
fs.writeFileSync('api/index.ts', code);
console.log('patched requireAuth');
