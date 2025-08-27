const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    console.log('Ensuring CodigoMFA and HistoricoSenha tables...');

    await prisma.$executeRawUnsafe(`
CREATE TABLE IF NOT EXISTS CodigoMFA (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuarioId INT NOT NULL,
  codigo VARCHAR(64) NOT NULL,
  tipoAcao ENUM('LOGIN','RESET','PRIMEIRO_ACESSO','DESBLOQUEIO') DEFAULT 'LOGIN',
  expiresAt DATETIME NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  criadoEm DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip VARCHAR(45) NULL,
  userAgent TEXT NULL,
  FOREIGN KEY (usuarioId) REFERENCES Usuario(id) ON DELETE CASCADE,
  INDEX idx_usuario_tipo (usuarioId, tipoAcao),
  INDEX idx_expiracao (expiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await prisma.$executeRawUnsafe(`
CREATE TABLE IF NOT EXISTS HistoricoSenha (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuarioId INT NOT NULL,
  senhaHash VARCHAR(255) NOT NULL,
  criadoEm DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuarioId) REFERENCES Usuario(id) ON DELETE CASCADE,
  INDEX idx_usuario (usuarioId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('Auth tables ensured.');
  } catch (err) {
    console.error('Error ensuring auth tables:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
