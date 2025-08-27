-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `nivel` VARCHAR(191) NOT NULL,
    `endereco1` VARCHAR(191) NOT NULL,
    `endereco2` VARCHAR(191) NOT NULL,
    `cidade` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(32) NULL,
    `zipcode` VARCHAR(16) NULL,
    `status` ENUM('ATIVO', 'INATIVO') NOT NULL DEFAULT 'ATIVO',
    `avatarUrl` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('PF', 'PJ') NOT NULL,
    `nomeCompleto` VARCHAR(191) NULL,
    `razaoSocial` VARCHAR(191) NULL,
    `nomeFantasia` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(32) NOT NULL,
    `nomeChave` VARCHAR(191) NOT NULL,
    `endereco1` VARCHAR(191) NULL,
    `endereco2` VARCHAR(191) NULL,
    `cidade` VARCHAR(96) NULL,
    `estado` VARCHAR(32) NULL,
    `zipcode` VARCHAR(16) NULL,
    `status` ENUM('ATIVO', 'INATIVO') NOT NULL DEFAULT 'ATIVO',
    `documentoEnc` VARCHAR(191) NULL,
    `docLast4` VARCHAR(4) NULL,
    `docHash` CHAR(64) NULL,
    `observacoes` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cliente_email_key`(`email`),
    UNIQUE INDEX `Cliente_docHash_key`(`docHash`),
    INDEX `Cliente_status_tipo_idx`(`status`, `tipo`),
    INDEX `Cliente_cidade_idx`(`cidade`),
    INDEX `Cliente_estado_idx`(`estado`),
    UNIQUE INDEX `Cliente_nomeChave_telefone_key`(`nomeChave`, `telefone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Auditoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tabela` VARCHAR(64) NOT NULL,
    `registroId` INTEGER NOT NULL,
    `acao` ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT') NOT NULL,
    `usuarioId` INTEGER NULL,
    `ip` VARCHAR(45) NULL,
    `payload` JSON NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Auditoria_tabela_registroId_idx`(`tabela`, `registroId`),
    INDEX `Auditoria_tabela_registroId_criadoEm_idx`(`tabela`, `registroId`, `criadoEm`),
    INDEX `Auditoria_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Auditoria` ADD CONSTRAINT `Auditoria_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
