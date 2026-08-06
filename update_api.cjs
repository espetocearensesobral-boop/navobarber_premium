const fs = require('fs');
let code = fs.readFileSync('api/index.ts', 'utf8');

// Patch 1: GET /api/appointments
const oldGetApts = `    // Se a requisição passou telefone para busca
    if (searchPhone) {
      if (isAdmin) {
        const filtered = dbApts.filter(a => matchPhoneNumbers(a.clientPhone, searchPhone));
        return res.json(filtered);
      } else if (!isGuest && userId) {
        const userPhone = req.user?.phone || '';
        if (userPhone && matchPhoneNumbers(userPhone, searchPhone)) {
          const filtered = dbApts.filter(a => matchPhoneNumbers(a.clientPhone, userPhone));
          return res.json(filtered);
        }
      }
      return res.json([]);
    }`;

const newGetApts = `    // Se a requisição passou telefone para busca (ex: consulta do cliente por telefone)
    if (searchPhone) {
      const filtered = dbApts.filter(a => matchPhoneNumbers(a.clientPhone, searchPhone));
      return res.json(filtered);
    }`;

if (code.includes(oldGetApts)) {
  code = code.replace(oldGetApts, newGetApts);
  console.log('Patched GET /api/appointments searchPhone');
} else {
  console.log('Could not find oldGetApts');
}

// Patch 2: jwt sign in login
const oldJwtSign = `const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },`;
const newJwtSign = `const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, phone: user.phone },`;

if (code.includes(oldJwtSign)) {
  code = code.replace(oldJwtSign, newJwtSign);
  console.log('Patched jwt sign in login');
}

// Patch 3: cancel match
const oldCancelCheck = `      if (!isOwner && !isPhoneMatch && !isLookupMatch) {
        return res.status(403).json({ error: 'Acesso negado: Você só pode cancelar o próprio agendamento' });
      }`;

const newCancelCheck = `      const isPhoneReqMatch = reqPhone && dbApt.clientPhone && matchPhoneNumbers(reqPhone, dbApt.clientPhone);
      if (!isOwner && !isPhoneMatch && !isPhoneReqMatch) {
        return res.status(403).json({ error: 'Acesso negado: Você só pode cancelar o próprio agendamento' });
      }`;

if (code.includes(oldCancelCheck)) {
  code = code.replace(oldCancelCheck, newCancelCheck);
  console.log('Patched cancel check');
}

// Patch 4: update match
const oldUpdateCheck = `      if (!isOwner && !isPhoneMatch && !isLookupMatch) {
        return res.status(403).json({ error: 'Acesso negado: Você só pode editar o próprio agendamento' });
      }`;

const newUpdateCheck = `      const isPhoneReqMatch = reqPhone && dbApt.clientPhone && matchPhoneNumbers(reqPhone, dbApt.clientPhone);
      if (!isOwner && !isPhoneMatch && !isPhoneReqMatch) {
        return res.status(403).json({ error: 'Acesso negado: Você só pode editar o próprio agendamento' });
      }`;

if (code.includes(oldUpdateCheck)) {
  code = code.replace(oldUpdateCheck, newUpdateCheck);
  console.log('Patched update check');
}

fs.writeFileSync('api/index.ts', code);
