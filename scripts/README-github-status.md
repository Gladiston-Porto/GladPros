# 🔍 GitHub Branches and CI/CD Status Checker

Script para verificar o status dos branches e workflows de CI/CD do repositório GladPros.

## 📋 Funcionalidades

- ✅ **Status dos Branches**: Lista todos os branches organizados por categoria
- ⚙️ **Workflows CI/CD**: Mostra status e histórico de execuções dos workflows
- 📋 **Pull Requests**: Lista PRs abertos e recentemente fechados
- 📝 **Commits Recentes**: Mostra os últimos commits no repositório
- 📊 **Resumo Executivo**: Análise consolidada do status geral

## 🚀 Como usar

### Pré-requisitos

1. **GitHub Token**: Você precisa de um GitHub Personal Access Token
   - Vá em GitHub → Settings → Developer settings → Personal access tokens
   - Crie um token com permissões de `repo` e `workflow`
   - **Nunca commite o token no código!**

### Execução

```bash
# Opção 1: Via npm script (recomendado)
export GITHUB_TOKEN=ghp_seu_token_aqui
npm run github:status

# Opção 2: Execução direta
GITHUB_TOKEN=ghp_seu_token_aqui node scripts/check-github-status.js
```

### Exemplo de Output

```
🔍 Verificando status do GitHub para GladPros...

════════════════════════════════════════════════════════════
 📋 STATUS DOS BRANCHES
════════════════════════════════════════════════════════════
Total de branches: 15

🌟 Branches Principais:
  🛡️ main (cecc9f8)

🚀 Feature Branches:
  📝 chore/refactor-structure (0451204)
  📝 ci/add-workflow-and-lint-fixes (3f49135)
  ... e mais 2 branches

🤖 Copilot Branches:
  🔧 copilot/fix-2d432e1f-99f4-4bb5-9be9-81795f741ede (e5cf7c8)
  ... e mais 8 branches

════════════════════════════════════════════════════════════
 ⚙️ WORKFLOWS DE CI/CD
════════════════════════════════════════════════════════════
Total de workflows: 5

🟢 CI
   📁 Arquivo: .github/workflows/ci.yml
   🆔 ID: 184326578
   📊 Estado: active
   📈 Últimas 5 execuções:
     ✅ #33 chore/refactor-structure - 2h atrás
     ❌ #32 chore/refactor-structure - 2h atrás
     ❌ #31 main - 2h atrás

🟢 Build and Test
   📁 Arquivo: .github/workflows/build.yml
   🆔 ID: 184639368
   📊 Estado: active
   📈 Últimas 5 execuções:
     ❌ #3 main - 2h atrás
     ❌ #2 chore/refactor-structure - 2h atrás
```

## 📊 Interpretação dos Resultados

### Status Icons

- ✅ `success` - Execução bem-sucedida
- ❌ `failure` - Execução com falha
- 🟡 `pending` - Em andamento
- 🔄 `in_progress` - Executando
- ⏳ `queued` - Na fila
- ⚫ `cancelled` - Cancelado

### Categorias de Branches

- **🌟 Branches Principais**: `main`, `master`, `develop`
- **🚀 Feature Branches**: `feature/`, `chore/`, `fix/`, `feat/`
- **🤖 Copilot Branches**: `copilot/`
- **📦 Outros**: Demais branches

### Protection Status

- 🛡️ Branch protegido
- 🔓 Branch não protegido

## 🔧 Configuração Avançada

### Variáveis de Ambiente

```bash
# Token do GitHub (obrigatório)
export GITHUB_TOKEN=ghp_seu_token_aqui

# Opcional: Configurar repositório diferente
export GITHUB_REPO_OWNER=outro-usuario
export GITHUB_REPO_NAME=outro-repo
```

### Integração com CI/CD

Você pode incluir este script em workflows para monitoramento:

```yaml
- name: Check GitHub Status
  run: npm run github:status
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## ⚠️ Troubleshooting

### Erro: "GITHUB_TOKEN não configurado"
- Verifique se a variável de ambiente está definida
- Teste: `echo $GITHUB_TOKEN`

### Erro: "GitHub API Error: 403 Forbidden"
- Token pode ter expirado
- Verifique se o token tem permissões adequadas (`repo`, `workflow`)

### Erro: "GitHub API Error: 404 Not Found"
- Verifique se o repositório existe e é acessível
- Token pode não ter acesso ao repositório privado

## 🔗 Links Úteis

- [GitHub Personal Access Tokens](https://github.com/settings/tokens)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 📝 Desenvolvimento

Para modificar ou estender o script:

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
node scripts/check-github-status.js
```

O script está localizado em `scripts/check-github-status.js` e é modular, permitindo importar funções específicas:

```javascript
const { checkBranches, checkWorkflows } = require('./scripts/check-github-status');

// Verificar apenas branches
await checkBranches();
```