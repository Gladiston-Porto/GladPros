# GitHub Status Checker

Scripts para verificar o status dos branches e GitHub Actions do repositório GladPros.

## 📋 Funcionalidades

- ✅ **Status dos Branches**: Verifica branches principais (main, master, develop, staging)
- 🏃 **GitHub Actions**: Lista workflows e seus status recentes
- 📊 **Status Checks**: Resumo dos checks de commit para o branch principal
- 🚀 **Runs Recentes**: Histórico das 10 execuções mais recentes
- 💾 **Artefatos**: Lista artefatos disponíveis com tamanho e data

## 🚀 Como Usar

### Pré-requisitos

Você precisa de um token do GitHub com permissões `repo:status`. Crie um token em:
https://github.com/settings/tokens

### Opção 1: Script Bash (Linux/Mac)

```bash
# Definir token de acesso
export GITHUB_TOKEN="ghp_seu_token_aqui"

# Executar script
bash scripts/check-github-status.sh

# Ou usando npm script
npm run github:status
```

### Opção 2: Script PowerShell (Windows)

```powershell
# Definir token de acesso
$env:GITHUB_TOKEN="ghp_seu_token_aqui"

# Executar script
.\scripts\check-github-status.ps1
```

### Opção 3: Script Node.js (Cross-platform)

```bash
# Definir token de acesso
export GITHUB_TOKEN="ghp_seu_token_aqui"

# Executar script
node scripts/check-github-status.js
```

## 📊 Exemplo de Output

```
🔍 Verificando status dos branches e CI/CD do repositório Gladiston-Porto/GladPros...

📋 Status dos Branches:
==================================
  main - 🔒 Protected - Commit: abc1234 - 28/08/2024 10:30:45
  develop - 🔓 Open - Commit: def5678 - 27/08/2024 15:20:30

🏃 GitHub Actions Workflows:
==================================
  CI - Status: active
    └─ success - Branch: main - 28/08/2024 10:35:20
    └─ success - Branch: develop - 27/08/2024 15:25:10

  Build - Status: active
    └─ success - Branch: main - 28/08/2024 10:33:15

📊 Resumo de Status Checks:
==================================
  Branch main: success (3 checks)
    └─ ci/github-actions: success - Build and test completed successfully
    └─ continuous-integration: success - All checks passed

🚀 Runs Recentes (últimas 10):
==================================
  success - CI (main) - 28/08/2024 10:35:20
  success - Build (main) - 28/08/2024 10:33:15
  success - CI (develop) - 27/08/2024 15:25:10

💾 Artefatos Disponíveis:
==================================
  📦 build-artifacts - 15MB - 28/08/2024 10:35:20 (Ativo)
  📦 test-coverage - 2MB - 28/08/2024 10:35:20 (Ativo)

✅ Verificação concluída!

💡 Dicas:
  • Para mais detalhes, acesse: https://github.com/Gladiston-Porto/GladPros/actions
  • Para reexecutar workflows falhos, use a interface web do GitHub
  • Verifique logs específicos clicando nos runs individuais
```

## 🔧 Personalização

Os scripts podem ser personalizados editando as variáveis no início dos arquivos:

- `OWNER`: Nome do proprietário do repositório
- `REPO`: Nome do repositório

## 🆘 Troubleshooting

### Erro de Autenticação
```
ERROR: defina GITHUB_TOKEN ou PERSONAL_TOKEN environment variable
```

**Solução**: Certifique-se de que definiu o token corretamente:
```bash
export GITHUB_TOKEN="ghp_seu_token_aqui"
```

### Erro de Permissão
```
❌ Erro na API: 403 Forbidden
```

**Solução**: Verifique se seu token tem as permissões necessárias:
- `repo:status` (obrigatório)
- `actions:read` (recomendado)

### Script não Encontrado
```
bash: scripts/check-github-status.sh: Permission denied
```

**Solução**: Torne o script executável:
```bash
chmod +x scripts/check-github-status.sh
```

## 📝 Logs e Debugging

Para debug, você pode verificar:

1. **Rate Limits**: Os scripts respeitam os limits da API do GitHub
2. **Timeouts**: Requisições têm timeout de 10 segundos
3. **Erros de Rede**: Verifique sua conexão com a internet

## 🔗 Links Úteis

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [GitHub Actions Status API](https://docs.github.com/en/rest/actions)
- [Personal Access Tokens](https://github.com/settings/tokens)