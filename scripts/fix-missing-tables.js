// Creates required tables if they are missing (idempotent where possible)
try { require('dotenv').config({ path: '.env.local' }); } catch {}
try { require('dotenv').config(); } catch {}
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSessaoAtiva() {
  // Create table if not exists
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS SessaoAtiva (
      id INT NOT NULL AUTO_INCREMENT,
      usuarioId INT NOT NULL,
      token VARCHAR(64) NOT NULL,
      ip VARCHAR(45) NULL,
      userAgent VARCHAR(255) NULL,
      cidade VARCHAR(64) NULL,
      pais VARCHAR(32) NULL,
      ultimaAtividade DATETIME NOT NULL DEFAULT NOW(),
      criadoEm DATETIME NOT NULL DEFAULT NOW(),
      PRIMARY KEY (id),
      UNIQUE KEY uq_SessaoAtiva_token (token),
      KEY idx_SessaoAtiva_usuarioId (usuarioId),
      KEY idx_SessaoAtiva_ultimaAtividade (ultimaAtividade),
      CONSTRAINT fk_SessaoAtiva_usuarioId FOREIGN KEY (usuarioId) REFERENCES Usuario(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  // Indexes might already exist; ignore errors
  try { await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX uq_SessaoAtiva_token ON SessaoAtiva (token)`); } catch {}
  try { await prisma.$executeRawUnsafe(`CREATE INDEX idx_SessaoAtiva_usuarioId ON SessaoAtiva (usuarioId)`); } catch {}
  try { await prisma.$executeRawUnsafe(`CREATE INDEX idx_SessaoAtiva_ultimaAtividade ON SessaoAtiva (ultimaAtividade)`); } catch {}
}

async function main() {
  await createSessaoAtiva();
  console.log('OK: SessaoAtiva table exists.');
}

main().then(()=>process.exit(0)).catch((e)=>{ console.error(e); process.exit(1); });
