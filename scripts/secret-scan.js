// Minimal local secret scan: searches for high-entropy-like strings and common secret keywords
// Usage: npm run secret:scan
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const IGNORES = new Set([
  'node_modules', '.next', '.git', '.vscode', 'dist', 'build', 'out',
]);

const KEYWORDS = [
  'secret', 'password', 'passwd', 'apikey', 'api_key', 'jwt', 'token', 'private_key',
  'DATABASE_URL', 'NEXTAUTH_SECRET', 'JWT_SECRET', 'SMTP_', 'SHADOW_DATABASE_URL'
];

const FILE_IGNORE_RE = /\.(lock|svg|png|jpg|jpeg|gif|ico|webp|woff2?|ttf|eot|mp4|mp3|pdf|bin)$/i;

function* walk(dir) {
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of list) {
    if (IGNORES.has(it.name)) continue;
    const full = path.join(dir, it.name);
    if (it.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function scanFile(fp) {
  if (FILE_IGNORE_RE.test(fp)) return [];
  const rel = path.relative(ROOT, fp);
  const content = fs.readFileSync(fp, 'utf8');
  const hits = [];
  // keyword hits
  for (const kw of KEYWORDS) {
    if (content.toLowerCase().includes(kw.toLowerCase())) hits.push(`keyword:${kw}`);
  }
  // simple base64-like detector
  const b64 = /[A-Za-z0-9+\/=]{32,}/g;
  if (b64.test(content)) hits.push('b64-like');
  return hits.length ? [{ file: rel, hits }] : [];
}

const results = [];
for (const f of walk(ROOT)) {
  try {
    results.push(...scanFile(f));
  } catch {}
}

if (!results.length) {
  console.log('No obvious secrets found.');
  process.exit(0);
}

console.log('Potential secrets found:');
for (const r of results) console.log('-', r.file, r.hits.join(','));
process.exitCode = 1;
