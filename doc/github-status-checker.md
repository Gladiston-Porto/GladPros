# GitHub Status Checker

Scripts para verificar o status dos branches e CI/CD do GitHub Actions.

## Scripts Disponíveis

### 1. Node.js Script Principal
```bash
node scripts/check-github-status.js
```

### 2. Shell Script (Linux/macOS)
```bash
bash scripts/check-github-status.sh
```

### 3. PowerShell Script (Windows)
```powershell
powershell scripts/check-github-status.ps1
```

### 4. NPM Script
```bash
npm run github:status
```

## Configuração

Você precisa de um token do GitHub com permissões de leitura do repositório:

### Opção 1: Variável de ambiente GITHUB_TOKEN
```bash
export GITHUB_TOKEN=ghp_your_token_here
npm run github:status
```

### Opção 2: Variável de ambiente PERSONAL_TOKEN
```bash
export PERSONAL_TOKEN=ghp_your_token_here
npm run github:status
```

### Opção 3: Inline (temporário)
```bash
GITHUB_TOKEN=ghp_your_token_here npm run github:status
```

## Como Gerar um Token GitHub

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Selecione as permissões necessárias:
   - `repo` (acesso total ao repositório) OU
   - `public_repo` (apenas repositórios públicos) + `repo:status` (status checks)
4. Copie o token gerado

## Funcionalidades

O script verifica e exibe:

### 📦 Informações do Repositório
- Nome completo do repositório
- Branch padrão
- Se é privado ou público
- Data da última atualização

### 🌿 Status dos Branches
- Lista todos os branches
- Indica quais branches estão protegidos 🔒
- Mostra o SHA do último commit
- Data do último commit
- Para branches protegidos, mostra:
  - Regras de proteção ativas
  - Status checks obrigatórios
  - Requisitos de revisão

### ⚙️ Workflows Disponíveis
- Lista todos os workflows do GitHub Actions
- Estado de cada workflow (ativo/inativo)
- Caminho do arquivo de workflow
- Data da última atualização

### 🚀 Execuções Recentes
- Últimas 10 execuções de workflows
- Status atual com emojis:
  - ✅ Success
  - ❌ Failure  
  - 🟡 In Progress
  - 🔵 Queued/Requested
  - 🟠 Waiting
  - ⏸️ Cancelled
  - ⏭️ Skipped
  - ⏰ Timed out
- Branch executado
- SHA do commit
- Data de execução
- Link direto para visualizar no GitHub

## Exemplo de Saída

```
🔍 Verificando status do GitHub - Branches e CI/CD

📦 Informações do Repositório:
   Nome: Gladiston-Porto/GladPros
   Branch padrão: main
   Privado: Não
   Última atualização: 28/08/2025 01:45

🌿 Status dos Branches:
   🔒 main (a1b2c3d4) - 28/08/2025 01:30
      └── Regras de proteção: Revisões obrigatórias: Sim
      └── Checks obrigatórios: ci, build
   🔓 feature/new-login (e5f6g7h8) - 27/08/2025 15:22

⚙️ Workflows Disponíveis:
   🟢 CI (ci.yml)
      └── Estado: active, Atualizado: 25/08/2025 10:15
   🟢 Build and Test (build.yml)
      └── Estado: active, Atualizado: 20/08/2025 14:30

🚀 Execuções Recentes dos Workflows:
   ✅ CI - main (a1b2c3d4)
      └── Status: completed / success
      └── Executado: 28/08/2025 01:30
      └── URL: https://github.com/Gladiston-Porto/GladPros/actions/runs/123456

   🟡 Build and Test - feature/new-login (e5f6g7h8)
      └── Status: in_progress
      └── Executado: 28/08/2025 01:15
      └── URL: https://github.com/Gladiston-Porto/GladPros/actions/runs/123457

✅ Verificação concluída com sucesso!
```

## Tratamento de Erros

O script inclui tratamento robusto de erros para:
- Token ausente ou inválido
- Problemas de rede
- API indisponível
- Repositório não encontrado
- Permissões insuficientes

## Integração com CI/CD

Este script pode ser integrado aos workflows do GitHub Actions para monitoramento automático:

```yaml
- name: Check GitHub Status
  run: npm run github:status
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```