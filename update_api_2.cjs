const fs = require('fs');
let code = fs.readFileSync('api/index.ts', 'utf8');

const oldUserApts = `    // Se for usuário autenticado (não convidado)
    if (!isGuest && userId) {
      const userPhone = req.user?.phone || '';
      const filtered = dbApts.filter(a => 
        a.clientId === userId || (userPhone && matchPhoneNumbers(a.clientPhone, userPhone))
      );
      return res.json(filtered);
    }`;

const newUserApts = `    // Se for usuário autenticado (não convidado)
    if (!isGuest && userId) {
      let userPhone = req.user?.phone || '';
      if (!userPhone) {
        const dbUser = await db.query.profiles.findFirst({ where: eq(schema.profiles.id, userId) });
        if (dbUser) userPhone = dbUser.phone || '';
      }
      const filtered = dbApts.filter(a => 
        a.clientId === userId || (userPhone && matchPhoneNumbers(a.clientPhone, userPhone))
      );
      return res.json(filtered);
    }`;

if (code.includes(oldUserApts)) {
  code = code.replace(oldUserApts, newUserApts);
  console.log('Patched authenticated user appointments lookup');
  fs.writeFileSync('api/index.ts', code);
} else {
  console.log('Could not find oldUserApts');
}
