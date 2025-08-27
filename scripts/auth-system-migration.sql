-- Migração completa do sistema de autenticação avançado

-- Campos adicionais na tabela Usuario
ALTER TABLE Usuario ADD COLUMN IF NOT EXISTS senhaProvisoria VARCHAR(255) NULL COMMENT 'Hash da senha temporária enviada por email';
ALTER TABLE Usuario ADD COLUMN IF NOT EXISTS senhaProvExpira DATETIME NULL COMMENT 'Data/hora expiração senha provisória';
ALTER TABLE Usuario ADD COLUMN IF NOT EXISTS primeiroAcesso BOOLEAN DEFAULT TRUE COMMENT 'Indica se usuário ainda não fez primeiro acesso';
ALTER TABLE Usuario ADD COLUMN IF NOT EXISTS pinSeguranca VARCHAR(255) NULL COMMENT 'Hash do PIN de 4-6 dígitos para desbloqueio';
ALTER TABLE Usuario ADD COLUMN IF NOT EXISTS perguntaSecreta VARCHAR(500) NULL COMMENT 'Pergunta escolhida pelo usuário';
ALTER TABLE Usuario ADD COLUMN IF NOT EXISTS respostaSecreta VARCHAR(255) NULL COMMENT 'Hash da resposta à pergunta secreta';
ALTER TABLE Usuario ADD COLUMN IF NOT EXISTS bloqueadoAte DATETIME NULL COMMENT 'Data/hora até quando conta fica bloqueada';
ALTER TABLE Usuario ADD COLUMN IF NOT EXISTS ultimaTentativa DATETIME NULL COMMENT 'Timestamp da última tentativa de login';

-- Tabela para códigos MFA
CREATE TABLE IF NOT EXISTS CodigoMFA (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuarioId INT NOT NULL,
  codigo VARCHAR(10) NOT NULL COMMENT 'Hash do código MFA',
  tipoAcao ENUM('LOGIN', 'RESET', 'PRIMEIRO_ACESSO', 'DESBLOQUEIO') DEFAULT 'LOGIN',
  expiresAt DATETIME NOT NULL COMMENT 'Data/hora expiração do código',
  usado BOOLEAN DEFAULT FALSE COMMENT 'Se código já foi utilizado',
  criadoEm DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip VARCHAR(45) NULL COMMENT 'IP de onde foi solicitado',
  userAgent TEXT NULL COMMENT 'User Agent da solicitação',
  FOREIGN KEY (usuarioId) REFERENCES Usuario(id) ON DELETE CASCADE,
  INDEX idx_usuario_tipo (usuarioId, tipoAcao),
  INDEX idx_expiracao (expiresAt)
) COMMENT 'Códigos MFA temporários para autenticação';

-- Tabela para tentativas de login (além da auditoria geral)
CREATE TABLE IF NOT EXISTS TentativaLogin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuarioId INT NULL COMMENT 'ID do usuário (se identificado)',
  email VARCHAR(191) NOT NULL COMMENT 'Email da tentativa',
  ip VARCHAR(45) NOT NULL COMMENT 'IP da tentativa',
  userAgent TEXT NULL COMMENT 'User Agent da tentativa',
  sucesso BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Se tentativa foi bem sucedida',
  motivoFalha ENUM('SENHA_INCORRETA', 'USUARIO_INEXISTENTE', 'CONTA_INATIVA', 'CONTA_BLOQUEADA', 'MFA_INCORRETO') NULL,
  criadaEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuarioId) REFERENCES Usuario(id) ON DELETE SET NULL,
  INDEX idx_email_data (email, criadaEm),
  INDEX idx_ip_data (ip, criadaEm),
  INDEX idx_usuario_sucesso (usuarioId, sucesso, criadaEm)
) COMMENT 'Log detalhado de tentativas de login para análise de segurança';

-- Tabela para tokens de reset/ativação
CREATE TABLE IF NOT EXISTS TokenReset (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuarioId INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE COMMENT 'Token único para reset',
  tipo ENUM('RESET_SENHA', 'PRIMEIRO_ACESSO', 'ATIVACAO') NOT NULL,
  expiresAt DATETIME NOT NULL COMMENT 'Data/hora expiração do token',
  usado BOOLEAN DEFAULT FALSE COMMENT 'Se token já foi utilizado',
  criadoEm DATETIME DEFAULT CURRENT_TIMESTAMP,
  usadoEm DATETIME NULL COMMENT 'Quando token foi usado',
  ip VARCHAR(45) NULL COMMENT 'IP que solicitou',
  FOREIGN KEY (usuarioId) REFERENCES Usuario(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_expiracao (expiresAt),
  INDEX idx_usuario_tipo (usuarioId, tipo)
) COMMENT 'Tokens seguros para reset de senha e ativação';

-- Perguntas pré-definidas para segurança (opcional - pode ser dinâmico)
CREATE TABLE IF NOT EXISTS PerguntasSeguranca (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pergunta VARCHAR(500) NOT NULL COMMENT 'Pergunta de segurança padrão',
  ativa BOOLEAN DEFAULT TRUE COMMENT 'Se pergunta está disponível para seleção',
  ordemExibicao INT DEFAULT 0 COMMENT 'Ordem de exibição na interface',
  criadaEm DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT 'Perguntas de segurança pré-definidas (opcional)';

-- Inserir algumas perguntas padrão
INSERT IGNORE INTO PerguntasSeguranca (pergunta, ordemExibicao) VALUES
('Qual era o nome do seu primeiro animal de estimação?', 1),
('Em que cidade você nasceu?', 2),
('Qual era o nome da sua primeira escola?', 3),
('Qual é o nome de solteira da sua mãe?', 4),
('Qual foi o primeiro carro que você teve?', 5),
('Qual é o nome da rua onde você cresceu?', 6),
('Qual é o seu filme favorito?', 7),
('Qual é o nome do seu melhor amigo de infância?', 8);
