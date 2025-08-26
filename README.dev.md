Dev environment guide

- Copy `.env.example` to `.env.local` and fill secrets. Do NOT commit `.env.local`.
- Required secrets: `JWT_SECRET` (>=32 chars base64 or long random string), `CLIENT_DOC_ENCRYPTION_KEY_BASE64` (32 bytes base64), `DATABASE_URL`, `SMTP_*`.
- To generate a JWT_SECRET locally: `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`
- To generate a 32-byte base64 key for document encryption: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- Seed admin: use `node scripts/seed-smoke-user.js` or follow the seed script instructions.

Security notes
- Ensure `.env.local` is gitignored. Rotate secrets if they were committed or leaked.

## Nota sobre limpeza de .env
Durante a limpeza de segurança, as variáveis sensíveis foram movidas para `.env.local` (backup criado em `.env.local.bak2`).
O arquivo `.env` foi substituído por placeholders para evitar exposição acidental de segredos. Se precisar restaurar os valores originais, há backups:

- `.env.bak2` contém o `.env` original
- `.env.local.bak2` contém o `.env.local` original

Por favor, verifique `.env.local` e atualize os valores necessários antes de iniciar o servidor.
