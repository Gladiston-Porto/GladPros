const { PrismaClient } = require('@prisma/client');
const { SignJWT } = require('jose');
const fs = require('fs');
const path = require('path');

function loadEnvKey(name) {
  if (process.env[name]) return process.env[name];
  const tryFiles = ['.env.local', '.env'];
  for (const f of tryFiles) {
    const p = path.join(process.cwd(), f);
    if (fs.existsSync(p)) {
      const txt = fs.readFileSync(p, 'utf8');
      const m = txt.match(new RegExp(`^${name}=(.*)$`, 'm'));
      if (m) {
        let val = m[1].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        return val;
      }
    }
  }
  return undefined;
}

async function makeToken(sub, tokenVersion) {
  const secretRaw = loadEnvKey('JWT_SECRET');
  if (!secretRaw || secretRaw.length < 32) throw new Error('Missing or weak JWT_SECRET');
  const secret = new TextEncoder().encode(secretRaw);
  return await new SignJWT({ role: 'ADMIN', status: 'ATIVO', tokenVersion })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(sub))
    .setIssuer('gladpros')
    .setAudience('gladpros-app')
    .setExpirationTime('1h')
    .sign(secret);
}

(async () => {
  const prisma = new PrismaClient();
  try {
    // pick first user
    const users = await prisma.$queryRawUnsafe('SELECT id, email, tokenVersion FROM Usuario ORDER BY id LIMIT 1');
    if (!users || users.length === 0) {
      console.log('No users found in Usuario table. Aborting smoke test.');
      process.exit(0);
    }
    const user = users[0];
    console.log('User:', user);
    const before = user.tokenVersion ?? 0;

    // Try to fetch a server-signed token from the debug endpoint (preferred)
    let jwt = null;
    try {
      const r = await fetch(`http://localhost:3000/api/_debug/make-token?userId=${user.id}`);
      if (r.ok) {
        const j = await r.json();
        if (j?.token) jwt = j.token;
      }
    } catch (e) {
      // ignore — fallback to local signing
    }
    if (!jwt) {
      // create JWT locally as fallback
      jwt = await makeToken(user.id, before);
    }

    // call logout endpoint
    const headers = {};
    // prefer Authorization header to avoid cookie parsing issues
    headers['Authorization'] = `Bearer ${jwt}`;
    const res = await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers
    });
  let body = null;
  try { body = await res.json(); } catch {}
  console.log('Logout status:', res.status, 'body:', body);

    // re-read tokenVersion
  const afterRows = await prisma.$queryRaw`SELECT tokenVersion FROM Usuario WHERE id = ${user.id} LIMIT 1`;
  const after = afterRows?.[0]?.tokenVersion ?? null;
    console.log('tokenVersion before:', before, 'after:', after, 'delta:', (after ?? 0) - before);
  } catch (e) {
    console.error('Smoke test error:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
