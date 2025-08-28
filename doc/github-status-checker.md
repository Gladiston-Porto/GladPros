# GitHub Status Checker

Scripts para verificar o status dos branches e workflows do GitHub Actions do repositório GladPros.

## Scripts Disponíveis

### 1. Bash Script (`scripts/check-github-status.sh`)
- **Plataforma:** Linux/macOS
- **Dependências:** curl, jq
- **Uso:**
  ```bash
  GITHUB_TOKEN=ghp_xxx bash scripts/check-github-status.sh
  ```

### 2. Node.js Script (`scripts/check-github-status.js`)
- **Plataforma:** Todas (Node.js)
- **Dependências:** Node.js (sem dependências externas)
- **Uso:**
  ```bash
  GITHUB_TOKEN=ghp_xxx node scripts/check-github-status.js
  ```

### 3. PowerShell Script (`scripts/check-github-status.ps1`)
- **Plataforma:** Windows (PowerShell)
- **Dependências:** PowerShell 5.1+
- **Uso:**
  ```powershell
  $env:GITHUB_TOKEN='ghp_xxx'
  powershell scripts/check-github-status.ps1
  ```

## Scripts NPM

```bash
# Usar o script bash
GITHUB_TOKEN=ghp_xxx npm run github:status

# Usar o script Node.js (recomendado para compatibilidade)
GITHUB_TOKEN=ghp_xxx npm run github:status:node
```

## Autenticação

### GitHub Token
Você precisa de um token do GitHub com as seguintes permissões:
- `repo` (para acessar informações do repositório)
- `actions:read` (para acessar workflows e runs)

### Como obter um token:
1. Vá para https://github.com/settings/tokens
2. Clique em "Generate new token"
3. Selecione as permissões necessárias
4. Copie o token gerado

### Variáveis de ambiente aceitas:
- `GITHUB_TOKEN` (prioritário)
- `PERSONAL_TOKEN` (fallback)

## Funcionalidades

### 📋 Status dos Branches
- Lista todos os branches do repositório
- Mostra o commit mais recente de cada branch
- Inclui data do último commit

### 🚀 Status dos Workflows
- Lista todos os workflows configurados
- Mostra o estado de cada workflow
- Lista as 5 execuções mais recentes de cada workflow
- Inclui links para as execuções

### 📈 Resumo das Execuções
- Mostra as 10 execuções mais recentes de todos os workflows
- Inclui ícones visuais para status:
  - ✅ Sucesso
  - ❌ Falha
  - ⚪ Cancelado
  - 🔄 Em progresso
  - ⏳ Pendente

## Exemplos de Saída

```
🔍 Verificando status dos branches e CI/CD do GitHub...
Repository: Gladiston-Porto/GladPros

📋 BRANCHES STATUS
==================
📌 main - Commit: a1b2c3d - 2024-08-28T01:30:00Z
📌 develop - Commit: e4f5g6h - 2024-08-27T15:45:00Z

🚀 CI/CD WORKFLOWS STATUS
========================

📊 Workflow: CI (ID: 123456) - Estado: active
   🔸 main - success - 2024-08-28T01:30:00Z - https://github.com/...
   🔸 develop - failure - 2024-08-27T15:45:00Z - https://github.com/...

📈 WORKFLOW RUNS SUMMARY (últimos 10)
===================================
✅ CI - main - success - 2024-08-28
❌ Build - develop - failure - 2024-08-27
🔄 CI - feature/xyz - in_progress - 2024-08-27

🏁 Verificação concluída!
```

## Tratamento de Erros

- **Token ausente:** Script para com erro 1
- **API indisponível:** Continua com warnings
- **Rate limit:** Mostra erro detalhado
- **Resposta malformada:** Fallback para resposta raw

## Integração com CI/CD

Estes scripts podem ser usados em workflows para:
- Verificar status antes de deploys
- Monitorar saúde dos workflows
- Gerar relatórios automáticos
- Alertas quando builds falham

## Limitações

- **Rate limiting:** GitHub API tem limite de requisições
- **Permissions:** Requer token com permissões adequadas
- **Network:** Precisa de acesso à internet
- **Dependencies:** Script bash requer jq instalado