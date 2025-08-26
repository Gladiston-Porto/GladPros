-- Tables required by the login/auth module

-- TentativaLogin: tracks login attempts for block logic
CREATE TABLE IF NOT EXISTS `TentativaLogin` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuarioId` INT NULL,
  `email` VARCHAR(191) NOT NULL,
  `sucesso` BOOLEAN NOT NULL DEFAULT FALSE,
  `ip` VARCHAR(45) NULL,
  `userAgent` VARCHAR(255) NULL,
  `criadaEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `TentativaLogin_usuarioId_idx` (`usuarioId`),
  CONSTRAINT `TentativaLogin_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CodigoMFA: stores hashed MFA codes
CREATE TABLE IF NOT EXISTS `CodigoMFA` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuarioId` INT NOT NULL,
  `codigo` CHAR(64) NOT NULL,
  `tipoAcao` ENUM('LOGIN','RESET','PRIMEIRO_ACESSO','DESBLOQUEIO') NOT NULL DEFAULT 'LOGIN',
  `expiresAt` DATETIME(3) NOT NULL,
  `usado` BOOLEAN NOT NULL DEFAULT FALSE,
  `ip` VARCHAR(45) NULL,
  `userAgent` VARCHAR(255) NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `CodigoMFA_usuarioId_idx` (`usuarioId`),
  INDEX `CodigoMFA_usuarioId_tipoAcao_idx` (`usuarioId`, `tipoAcao`),
  CONSTRAINT `CodigoMFA_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- HistoricoSenha: password history (hash only)
CREATE TABLE IF NOT EXISTS `HistoricoSenha` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuarioId` INT NOT NULL,
  `senhaHash` VARCHAR(191) NOT NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `HistoricoSenha_usuarioId_idx` (`usuarioId`),
  CONSTRAINT `HistoricoSenha_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Optional: lightweight audit table if missing (console fallback already present)
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL,
  `user_email` VARCHAR(191) NULL,
  `action` VARCHAR(64) NOT NULL,
  `resource` VARCHAR(64) NULL,
  `resource_id` VARCHAR(64) NULL,
  `details` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `status` ENUM('SUCCESS','FAILURE','WARNING') NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `audit_logs_user_idx` (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add missing columns on Usuario if not present
ALTER TABLE `Usuario`
  ADD COLUMN IF NOT EXISTS `nomeCompleto` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `telefone` VARCHAR(32) NULL,
  ADD COLUMN IF NOT EXISTS `dataNascimento` DATE NULL,
  ADD COLUMN IF NOT EXISTS `senhaProvisoria` BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS `primeiroAcesso` BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS `bloqueado` BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS `bloqueadoEm` DATETIME(3) NULL,
  ADD COLUMN IF NOT EXISTS `pinSeguranca` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `perguntaSecreta` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `respostaSecreta` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `anotacoes` LONGTEXT NULL,
  ADD COLUMN IF NOT EXISTS `ultimoLoginEm` DATETIME(3) NULL;
