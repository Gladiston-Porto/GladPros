const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    console.log('Creating TentativaLogin table if not exists...');
    const sql = `
CREATE TABLE IF NOT EXISTS TentativaLogin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuarioId INT NULL,
  email VARCHAR(191) NOT NULL,
  ip VARCHAR(45) NOT NULL,
  userAgent TEXT NULL,
  sucesso BOOLEAN NOT NULL DEFAULT FALSE,
  motivoFalha ENUM('SENHA_INCORRETA','USUARIO_INEXISTENTE','CONTA_INATIVA','CONTA_BLOQUEADA','MFA_INCORRETO') NULL,
  criadaEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuarioId) REFERENCES Usuario(id) ON DELETE SET NULL,
  INDEX idx_email_data (email, criadaEm),
  INDEX idx_ip_data (ip, criadaEm),
  INDEX idx_usuario_sucesso (usuarioId, sucesso, criadaEm)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await prisma.$executeRawUnsafe(sql);
    console.log('TentativaLogin table ensured.');
  } catch (err) {
    console.error('Error creating TentativaLogin:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
