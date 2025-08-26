const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    console.log('Criando tabela audit_logs...');
    
    await prisma.$executeRawUnsafe(`
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  user_email VARCHAR(191) NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NULL,
  resource_id VARCHAR(100) NULL,
  details JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  status ENUM('SUCCESS', 'FAILURE', 'WARNING') NOT NULL DEFAULT 'SUCCESS',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Usuario(id) ON DELETE SET NULL,
  INDEX idx_user_action (user_id, action, created_at),
  INDEX idx_email_action (user_email, action, created_at),
  INDEX idx_action_date (action, created_at),
  INDEX idx_ip_date (ip_address, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('Tabela audit_logs criada com sucesso.');
  } catch (err) {
    console.error('Erro ao criar audit_logs:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
