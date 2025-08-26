-- Migration to add Propostas module
-- CreateTable
CREATE TABLE `Proposta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numeroProposta` VARCHAR(20) NOT NULL,
    `clienteId` INTEGER NOT NULL,
    `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tipoServico` VARCHAR(191) NOT NULL,
    `permite` ENUM('SIM', 'NAO') NOT NULL,
    `quaisPermites` TEXT NULL,
    `condicoesPagamento` JSON NULL,
    `valorEstimado` DECIMAL(12, 2) NULL,
    `moeda` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `status` ENUM('RASCUNHO', 'ENVIADA', 'ASSINADA', 'APROVADA', 'CANCELADA') NOT NULL DEFAULT 'RASCUNHO',
    `enviadaParaOCliente` DATETIME(3) NULL,
    `assinaturaCliente` VARCHAR(255) NULL,
    `assinaturaResponsavel` VARCHAR(255) NULL,
    `assinadaEm` DATETIME(3) NULL,
    `tempoParaAceite` INTEGER NULL,
    `projetoId` INTEGER NULL,
    `historicoAlteracoes` JSON NULL,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` INTEGER NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Proposta_numeroProposta_key`(`numeroProposta`),
    UNIQUE INDEX `Proposta_projetoId_key`(`projetoId`),
    INDEX `Proposta_clienteId_idx`(`clienteId`),
    INDEX `Proposta_status_idx`(`status`),
    INDEX `Proposta_dataCriacao_id_idx`(`dataCriacao`, `id`),
    INDEX `Proposta_status_dataCriacao_id_idx`(`status`, `dataCriacao`, `id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PropostaEtapa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `propostaId` INTEGER NOT NULL,
    `servico` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `status` ENUM('PLANEJADA', 'EM_ANDAMENTO', 'CONCLUIDA') NOT NULL DEFAULT 'PLANEJADA',
    `ordem` INTEGER NOT NULL DEFAULT 0,

    INDEX `PropostaEtapa_propostaId_idx`(`propostaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PropostaMaterial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `propostaId` INTEGER NOT NULL,
    `codigo` VARCHAR(50) NULL,
    `nome` VARCHAR(191) NOT NULL,
    `quantidade` DECIMAL(12, 3) NOT NULL DEFAULT 0.000,
    `unidade` VARCHAR(20) NULL,
    `status` ENUM('PLANEJADO', 'SUBSTITUIDO', 'REMOVIDO') NOT NULL DEFAULT 'PLANEJADO',
    `observacao` TEXT NULL,
    `precoUnitario` DECIMAL(12, 2) NULL,
    `moeda` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `totalItem` DECIMAL(12, 2) NULL,

    INDEX `PropostaMaterial_propostaId_idx`(`propostaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnexoProposta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `propostaId` INTEGER NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `filepath` VARCHAR(500) NOT NULL,
    `mime` VARCHAR(100) NOT NULL,
    `uploadedBy` INTEGER NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AnexoProposta_propostaId_idx`(`propostaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PropostaLog` (
    `id` VARCHAR(191) NOT NULL,
    `propostaId` INTEGER NOT NULL,
    `actorId` INTEGER NULL,
    `action` ENUM('CREATED', 'UPDATED', 'SENT', 'SIGNED', 'APPROVED', 'CANCELLED', 'ATTACH_ADDED', 'ATTACH_REMOVED') NOT NULL,
    `oldJson` JSON NULL,
    `newJson` JSON NULL,
    `ip` VARCHAR(45) NULL,
    `userAgent` TEXT NULL,
    `correlationId` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PropostaLog_propostaId_idx`(`propostaId`),
    INDEX `PropostaLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Projeto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `propostaId` INTEGER NULL,
    `origem` ENUM('SEM_PROPOSTA', 'DE_PROPOSTA') NOT NULL DEFAULT 'SEM_PROPOSTA',
    `nome` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL DEFAULT 'INICIADO',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Projeto_propostaId_key`(`propostaId`),
    INDEX `Projeto_clienteId_idx`(`clienteId`),
    INDEX `Projeto_origem_idx`(`origem`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Proposta` ADD CONSTRAINT `Proposta_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Proposta` ADD CONSTRAINT `Proposta_projetoId_fkey` FOREIGN KEY (`projetoId`) REFERENCES `Projeto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PropostaEtapa` ADD CONSTRAINT `PropostaEtapa_propostaId_fkey` FOREIGN KEY (`propostaId`) REFERENCES `Proposta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PropostaMaterial` ADD CONSTRAINT `PropostaMaterial_propostaId_fkey` FOREIGN KEY (`propostaId`) REFERENCES `Proposta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnexoProposta` ADD CONSTRAINT `AnexoProposta_propostaId_fkey` FOREIGN KEY (`propostaId`) REFERENCES `Proposta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PropostaLog` ADD CONSTRAINT `PropostaLog_propostaId_fkey` FOREIGN KEY (`propostaId`) REFERENCES `Proposta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Projeto` ADD CONSTRAINT `Projeto_propostaId_fkey` FOREIGN KEY (`propostaId`) REFERENCES `Proposta`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
