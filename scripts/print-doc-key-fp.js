// Prints fingerprints of document encryption keys (primary and fallbacks)
const crypto = require('crypto');
try { require('dotenv').config({ path: '.env.local' }); } catch {}
try { require('dotenv').config(); } catch {}

function fp(buf) { return crypto.createHash('sha256').update(buf).digest('hex').slice(0,16); }

const primaryB64 = process.env.CLIENT_DOC_ENCRYPTION_KEY_BASE64;
if (!primaryB64) { console.error('Missing CLIENT_DOC_ENCRYPTION_KEY_BASE64'); process.exit(1); }
const primary = Buffer.from(primaryB64, 'base64');
if (primary.length !== 32) { console.error('Primary key must be 32 bytes'); process.exit(1); }

const fallbacksEnv = process.env.CLIENT_DOC_ENCRYPTION_KEY_FALLBACKS || '';
const fallbacks = fallbacksEnv.split(',').map(s=>s.trim()).filter(Boolean).map(s=>Buffer.from(s,'base64')).filter(b=>b.length===32);

console.log('Primary key FP:', fp(primary));
if (fallbacks.length) {
  console.log('Fallback key FPs:', fallbacks.map(fp).join(','));
} else {
  console.log('Fallback key FPs: (none)');
}