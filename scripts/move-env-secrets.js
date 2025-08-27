const fs = require('fs');
const path = require('path');
const envPath = path.join(process.cwd(), '.env');
const localPath = path.join(process.cwd(), '.env.local');

function parseEnv(p) {
  if (!fs.existsSync(p)) return {};
  const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
  const kv = {};
  for (const l of lines) {
    const m = l.match(/^\s*([^=\s#]+)=(.*)$/);
    if (m) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      kv[m[1]] = v;
    }
  }
  return kv;
}

function appendLines(p, lines) {
  fs.appendFileSync(p, '\n' + lines.join('\n') + '\n');
}

(async ()=>{
  const env = parseEnv(envPath);
  const local = parseEnv(localPath);
  const keys = ['DATABASE_URL','SHADOW_DATABASE_URL','NEXTAUTH_SECRET','SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS','SMTP_FROM','SMTP_SECURE','CLIENT_DOC_ENCRYPTION_KEY_BASE64'];
  const toAppend = [];
  for (const k of keys) {
    if (env[k] && !local[k]) {
      toAppend.push(`${k}="${env[k]}"`);
    }
  }
  if (toAppend.length>0) {
    appendLines(localPath, ['# Copied from .env (cleanup)'].concat(toAppend));
    console.log('Appended to .env.local:', toAppend.join(', '));
  } else {
    console.log('No keys to append');
  }
})()
