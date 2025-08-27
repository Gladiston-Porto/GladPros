// Rekey Cliente.documentoEnc from fallback keys to the current primary key.
// Usage: NODE_OPTIONS=--max-old-space-size=2048 node scripts/rekey-documents.js [--dry-run]
try { require('dotenv').config({ path: '.env.local' }); } catch {}
try { require('dotenv').config(); } catch {}
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function getKeys() {
  const primaryB64 = process.env.CLIENT_DOC_ENCRYPTION_KEY_BASE64;
  if (!primaryB64) throw new Error('Missing CLIENT_DOC_ENCRYPTION_KEY_BASE64');
  const primary = Buffer.from(primaryB64, 'base64');
  if (primary.length !== 32) throw new Error('Primary key must be 32 bytes');
  const fallbacksEnv = process.env.CLIENT_DOC_ENCRYPTION_KEY_FALLBACKS || '';
  const fallbacks = fallbacksEnv.split(',').map(s=>s.trim()).filter(Boolean).map(s=>Buffer.from(s,'base64')).filter(b=>b.length===32);
  return { primary, fallbacks };
}

function decryptWithKey(payloadB64, key) {
  const buf = Buffer.from(payloadB64, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString('utf8');
}

function tryDecrypt(payloadB64, keys) {
  for (const k of keys) {
    try { return { plaintext: decryptWithKey(payloadB64, k), key: k }; } catch {}
  }
  throw new Error('DECRYPT_FAILED');
}

function encryptWithKey(plaintext, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

function hashDoc(doc) {
  const norm = (doc || '').replace(/[^0-9A-Za-z]/g, '').toUpperCase();
  return crypto.createHash('sha256').update(norm).digest('hex');
}

async function main() {
  const dry = process.argv.includes('--dry-run');
  const { primary, fallbacks } = getKeys();

  let scanned = 0, rekeyed = 0, skipped = 0, failed = 0, alreadyPrimary = 0;
  const batchSize = 200;
  let cursor = 0;
  for(;;) {
    const rows = await prisma.cliente.findMany({
      select: { id: true, documentoEnc: true, docHash: true },
      where: { documentoEnc: { not: null } },
      orderBy: { id: 'asc' },
      take: batchSize,
      skip: cursor,
    });
    if (!rows.length) break;
    for (const r of rows) {
      scanned++;
      const payload = r.documentoEnc;
      if (!payload) { skipped++; continue; }
      // Try decrypt with primary first; if it works, assume already current
      try {
        decryptWithKey(payload, primary);
        alreadyPrimary++;
        continue;
      } catch {}
      // Try decrypt with fallbacks
      let plain;
      try {
        plain = tryDecrypt(payload, fallbacks).plaintext;
      } catch {
        failed++;
        continue;
      }
      const newPayload = encryptWithKey(plain, primary);
      const newHash = hashDoc(plain);
      if (!dry) {
        await prisma.cliente.update({ where: { id: r.id }, data: { documentoEnc: newPayload, docHash: newHash } });
      }
      rekeyed++;
    }
    cursor += rows.length;
    if (rows.length < batchSize) break;
  }
  console.log(JSON.stringify({ scanned, rekeyed, skipped, failed, alreadyPrimary, dry }, null, 2));
}

main().then(()=>process.exit(0)).catch((e)=>{ console.error(e); process.exit(1); });
