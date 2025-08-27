-- Adicionar colunas de segurança na tabela Usuario
ALTER TABLE Usuario ADD COLUMN tentativasLogin INT DEFAULT 0;
ALTER TABLE Usuario ADD COLUMN bloqueadoEm DATETIME NULL;
ALTER TABLE Usuario ADD COLUMN senhaAlteradaEm DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE Usuario ADD COLUMN proximaTrocaSenha DATETIME NULL;

-- Tabela para histórico de senhas
CREATE TABLE IF NOT EXISTS HistoricoSenha (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuarioId INT NOT NULL,
  senhaHash VARCHAR(255) NOT NULL,
  criadoEm DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuarioId) REFERENCES Usuario(id) ON DELETE CASCADE,
  INDEX idx_usuario_data (usuarioId, criadoEm)
);

-- Tabela para sessões ativas
CREATE TABLE IF NOT EXISTS SessaoAtiva (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuarioId INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  ip VARCHAR(45),
  userAgent TEXT,
  cidade VARCHAR(100),
  pais VARCHAR(50),
  ultimaAtividade DATETIME DEFAULT CURRENT_TIMESTAMP,
  criadoEm DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuarioId) REFERENCES Usuario(id) ON DELETE CASCADE,
  INDEX idx_usuario (usuarioId),
  INDEX idx_token (token),
  INDEX idx_atividade (ultimaAtividade)
);

-- Tabela para tentativas de login
CREATE TABLE IF NOT EXISTS TentativaLogin (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  ip VARCHAR(45),
  userAgent TEXT,
  sucesso BOOLEAN DEFAULT FALSE,
  motivoFalha VARCHAR(100),
  criadoEm DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_data (email, criadoEm),
  INDEX idx_ip_data (ip, criadoEm)
);
