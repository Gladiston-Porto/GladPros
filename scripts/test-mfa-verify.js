// Gera um código MFA conhecido para um usuário e valida no endpoint /api/auth/mfa/verify
require('dotenv').config();
const crypto = require('crypto');
const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@gladpros.local';
  const code = process.env.TEST_MFA_CODE || '123456';
  const tipoAcao = 'LOGIN';

  try {
    const [user] = await prisma.$queryRaw`SELECT id FROM Usuario WHERE email = ${email} LIMIT 1`;
    if (!user) {
      console.error('Usuário não encontrado:', email);
      process.exit(1);
    }

    const usuarioId = user.id;

    // Limpa códigos anteriores
    await prisma.$executeRaw`DELETE FROM CodigoMFA WHERE usuarioId = ${usuarioId}`;

    const hash = crypto.createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.$executeRaw`
      INSERT INTO CodigoMFA (usuarioId, codigo, tipoAcao, expiresAt, usado, ip, userAgent)
      VALUES (${usuarioId}, ${hash}, ${tipoAcao}, ${expiresAt}, FALSE, '127.0.0.1', 'script-test')
    `;

    console.log('Código MFA gerado para', email, '=>', code);

    const res = await fetch('http://localhost:3000/api/auth/mfa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: usuarioId, code, tipoAcao })
    });

    console.log('Status:', res.status);
    const body = await res.json();
    console.log('Response:', body);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
