-- CreateEnum
ALTER TABLE `Proposta` ADD COLUMN `tipoAssinatura` ENUM('CANVAS', 'CHECKBOX', 'NOME_CHECKBOX') NULL DEFAULT 'CANVAS';
ALTER TABLE `Proposta` ADD COLUMN `gatilhoFaturamento` ENUM('NA_APROVACAO', 'POR_MARCOS', 'NA_ENTREGA', 'CUSTOMIZADO') NULL DEFAULT 'NA_APROVACAO';
ALTER TABLE `Proposta` ADD COLUMN `formaPagamentoPreferida` ENUM('PIX', 'CARTAO', 'BOLETO', 'TRANSFERENCIA', 'DINHEIRO', 'CHEQUE') NULL;

-- AlterTable
ALTER TABLE `AnexoProposta` ADD COLUMN `descricao` TEXT NULL,
    ADD COLUMN `privado` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Proposta` ADD COLUMN `aprovacaoInternaFinanceira` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `aprovacaoInternaTecnica` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `aprovadaEm` DATETIME(3) NULL,
    ADD COLUMN `assinaturaImagem` TEXT NULL,
    ADD COLUMN `assinaturaIp` VARCHAR(45) NULL,
    ADD COLUMN `assinaturaUserAgent` TEXT NULL,
    ADD COLUMN `atualizadoPor` INTEGER NULL,
    ADD COLUMN `condicoesGerais` TEXT NULL,
    ADD COLUMN `contatoEmail` VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN `contatoNome` VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN `contatoTelefone` VARCHAR(50) NULL,
    ADD COLUMN `criadoPor` INTEGER NULL,
    ADD COLUMN `dataConversao` DATETIME(3) NULL,
    ADD COLUMN `descricaoEscopo` TEXT NOT NULL DEFAULT '',
    ADD COLUMN `descontosCondicionais` TEXT NULL,
    ADD COLUMN `descontosOfertados` DECIMAL(5, 2) NULL,
    ADD COLUMN `exclusoes` TEXT NULL,
    ADD COLUMN `garantia` TEXT NULL,
    ADD COLUMN `inspecoesNecessarias` TEXT NULL,
    ADD COLUMN `instrucoesPagamento` TEXT NULL,
    ADD COLUMN `internalEstimate` JSON NULL,
    ADD COLUMN `janelaExecucaoPreferencial` TEXT NULL,
    ADD COLUMN `localExecucaoEndereco` TEXT NOT NULL DEFAULT '',
    ADD COLUMN `marcosPagamento` JSON NULL,
    ADD COLUMN `motivo_cancelamento` TEXT NULL,
    ADD COLUMN `multaAtraso` VARCHAR(100) NULL,
    ADD COLUMN `normasReferencias` TEXT NULL,
    ADD COLUMN `observacoesInternas` TEXT NULL,
    ADD COLUMN `observacoesParaCliente` TEXT NULL,
    ADD COLUMN `opcoesAlternativas` JSON NULL,
    ADD COLUMN `percentualSinal` DECIMAL(5, 2) NULL,
    ADD COLUMN `prazoExecucaoEstimadoDias` INTEGER NULL,
    ADD COLUMN `precoPropostaCliente` DECIMAL(12, 2) NULL,
    ADD COLUMN `responsavelConversao` INTEGER NULL,
    ADD COLUMN `restricoesDeAcesso` TEXT NULL,
    ADD COLUMN `riscosIdentificados` TEXT NULL,
    ADD COLUMN `titulo` VARCHAR(500) NOT NULL DEFAULT '',
    ADD COLUMN `tokenExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `tokenPublico` VARCHAR(100) NULL,
    ADD COLUMN `validadeProposta` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `PropostaEtapa` ADD COLUMN `custoMaoObraEstimado` DECIMAL(12, 2) NULL,
    ADD COLUMN `dependencias` TEXT NULL,
    ADD COLUMN `duracaoEstimadaHoras` DECIMAL(8, 2) NULL,
    ADD COLUMN `quantidade` DECIMAL(10, 2) NULL,
    ADD COLUMN `unidade` VARCHAR(20) NULL;

-- AlterTable
ALTER TABLE `PropostaMaterial` ADD COLUMN `fornecedorPreferencial` VARCHAR(255) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Proposta_tokenPublico_key` ON `Proposta`(`tokenPublico`);
