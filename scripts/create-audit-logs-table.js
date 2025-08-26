const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    console.log('Creating audit_logs table if not exists...');
    const sql = `
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  user_email VARCHAR(191) NULL,
  action VARCHAR(64) NOT NULL,
  resource VARCHAR(128) NULL,
  resource_id VARCHAR(64) NULL,
  details JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  status ENUM('SUCCESS','FAILURE','WARNING') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_action_created (action, created_at),
  INDEX idx_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await prisma.$executeRawUnsafe(sql);
    console.log('audit_logs table ensured.');
  } catch (err) {
    console.error('Error creating audit_logs table:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
