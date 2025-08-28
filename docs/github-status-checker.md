# GitHub Status Checker

Este script verifica o status dos branches e workflows do GitHub Actions para o repositório GladPros.

## Uso

### Via npm script (recomendado)
```bash
npm run github:status
```

### Modo resumo (rápido)
```bash
npm run github:status:summary
```

### Executação direta
```bash
node scripts/check-github-status.js
node scripts/check-github-status.js --summary
```

### Com token do GitHub (para informações completas)
```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxx npm run github:status
```

## Funcionalidades

### 🌿 Verificação de Branches
- Lista branches remotos com commits recentes
- Mostra mensagens de commit para branches principais
- Verifica proteções de branch (quando GitHub API disponível)
- Fallback para informações locais do git quando API não disponível

### ⚙️ Status dos Workflows
- Lista todos os workflows do GitHub Actions
- Mostra status das execuções recentes (quando API disponível)
- Taxa de sucesso dos workflows
- Links para execuções com falha
- Análise local dos arquivos de workflow quando API não disponível

### ℹ️ Informações do Repositório
- Metadados do repositório (stars, forks, visibilidade)
- Branch padrão e informações gerais
- Informações locais do git (branch atual, commits, status)

## Configuração

### Variáveis de Ambiente

- `GITHUB_TOKEN` - Token de acesso pessoal do GitHub (opcional para repositórios públicos)
- `GITHUB_OWNER` - Proprietário do repositório (default: auto-detect)
- `GITHUB_REPO` - Nome do repositório (default: auto-detect)

### Geração de Token GitHub

1. Vá para GitHub Settings → Developer settings → Personal access tokens
2. Clique em "Generate new token (classic)"
3. Selecione as permissões:
   - `repo` - Para repositórios privados
   - `public_repo` - Para repositórios públicos
   - `workflow` - Para informações de workflows
4. Copie o token gerado

## Exemplos de Output

### Com GitHub API
```
🚀 GITHUB STATUS CHECKER
Checking Gladiston-Porto/GladPros
════════════════════════════════════════════════════════════

ℹ️ REPOSITORY INFO
──────────────────────────────────────────────────
📁 Repository: Gladiston-Porto/GladPros
🌟 Stars: 5 | 🍴 Forks: 2
📝 Description: Sistema de gestão profissional
🔓 Visibility: Private
📅 Updated: 2 horas atrás

🌿 BRANCHES STATUS
──────────────────────────────────────────────────
main 🛡️ - a1b2c3d (1 hora atrás)
  📝 chore: update dependencies and fix linting issues
develop - e4f5g6h (2 dias atrás)
feature/auth-improvements - i7j8k9l (1 semana atrás)

🛡️ Branch Protection (main):
  • Required status checks: CI, Build and Test
  • Required PR reviews: 1

⚙️ WORKFLOWS STATUS
──────────────────────────────────────────────────

📄 CI
  ✅ completed (main) - 1 hora atrás [2m 34s]
  ✅ completed (develop) - 2 dias atrás [2m 18s]
  ❌ completed (feature/auth) - 1 semana atrás [1m 45s]
    🔗 https://github.com/Gladiston-Porto/GladPros/actions/runs/123456
  📊 Success rate: 67% (2/3)

📄 Build and Test
  ✅ completed (main) - 1 hora atrás [4m 12s]
  📊 Success rate: 100% (1/1)
```

### Modo Fallback (sem API)
```
🚀 GITHUB STATUS CHECKER
Checking Gladiston-Porto/GladPros
════════════════════════════════════════════════════════════
⚠️ GITHUB_TOKEN não configurado - rate limits podem aplicar

ℹ️ REPOSITORY INFO
──────────────────────────────────────────────────
ℹ️ Using local repository information...
📁 Repository: Gladiston-Porto/GladPros
🔗 Remote: https://github.com/Gladiston-Porto/GladPros
🌿 Current branch: main
📝 Last commit: a1b2c3d - chore: update dependencies (1 hour ago by João Silva)
📊 Total commits: 156
✅ Working directory is clean

🌿 BRANCHES STATUS
──────────────────────────────────────────────────
ℹ️ Falling back to local git information...
main - a1b2c3d (1 hour ago)
  📝 chore: update dependencies and fix linting issues
develop - e4f5g6h (2 days ago)

ℹ️ Local git information used (GitHub API not accessible)

⚙️ WORKFLOWS STATUS
──────────────────────────────────────────────────
ℹ️ Falling back to local workflow information...

📄 CI
  📄 File: ci.yml
  🎯 Triggers: push, pull_request
  💼 Jobs: build
  🔐 Secrets: JWT_SECRET, CLIENT_DOC_ENCRYPTION_KEY_BASE64

📄 Build and Test
  📄 File: build.yml
  🎯 Triggers: push, pull_request
  💼 Jobs: build
  🔐 Secrets: JWT_SECRET, DATABASE_URL

ℹ️ Local workflow files analyzed (GitHub Actions API not accessible)
```

## Resolução de Problemas

### "Failed to parse response: Unexpected token 'B'"
- O GitHub API está sendo bloqueado pela rede
- Use o modo fallback (funciona automaticamente)
- Configure `GITHUB_TOKEN` se necessário

### "No remote branches found"
- Execute `git fetch` para atualizar referências remotas
- Verifique se está em um repositório git válido

### "Nenhum diretório de workflows encontrado"
- O repositório não possui workflows do GitHub Actions
- Verifique se existe o diretório `.github/workflows/`

## Integração com CI/CD

Este script pode ser usado em pipelines de CI/CD para:
- Verificar status antes de deploys
- Validar configurações de branch protection
- Monitorar saúde dos workflows
- Gerar relatórios de status automatizados

### Exemplo de uso em GitHub Actions
```yaml
name: Repository Health Check
on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - name: Check repository status
        run: npm run github:status:summary
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Modo Resumo para CI/CD
O modo resumo (`--summary`) é ideal para pipelines de CI/CD:
```bash
npm run github:status:summary
```

Output do modo resumo:
```
🚀 GITHUB STATUS CHECKER
📋 SUMMARY MODE
──────────────────────────────────────────────────
📁 Gladiston-Porto/GladPros
🌿 Branch: main
📝 Changes: working directory clean
⚙️ Workflows: 4 configured

🏥 HEALTH CHECK:
✅ Local git repository: OK
✅ Package.json: gladpros-nextjs
✅ CI/CD: Configured
──────────────────────────────────────────────────
✨ Status check completed!
```