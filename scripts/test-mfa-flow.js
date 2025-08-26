// Teste do fluxo MFA: login -> recebe mfaRequired -> verificar código exibido no console (dev)
require('dotenv').config();
const fetch = require('node-fetch');

(async () => {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@gladpros.local';
  const password = process.env.SEED_ADMIN_PASS || 'Admin@12345';

  console.log('1) Fazendo login para gerar MFA...');
  const login = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const loginJson = await login.json();
  console.log('Login status:', login.status, loginJson);

  if (!loginJson.mfaRequired) {
    console.log('Fluxo inesperado: MFA não requerido.');
    process.exit(0);
  }

  console.log('\n2) Agora pegue o código MFA do email (ou do log [DEV]) e valide:');
  console.log('   POST /api/auth/mfa/verify { userId, code, tipoAcao }');
})();
