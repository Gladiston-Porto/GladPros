# GitHub Status Checker

Scripts para verificar o status dos branches e CI/CD do repositório GladPros no GitHub.

## Descrição

Estes scripts verificam:
- 📋 **Branches**: Lista todos os branches do repositório
- 🔧 **Workflows**: Status dos workflows do GitHub Actions
- ✓ **Check Runs**: Resultados dos checks automatizados
- 🔍 **Status Checks**: Status de verificações externas
- ⚙️ **Resumo**: Visão geral de todos os workflows e suas execuções recentes

## Pré-requisitos

### Token do GitHub
Você precisa de um token do GitHub com as seguintes permissões:
- `repo` (para acessar informações do repositório)
- `actions:read` (para ler workflows do GitHub Actions)

Para criar um token:
1. Vá para GitHub → Settings → Developer settings → Personal access tokens
2. Clique em "Generate new token (classic)"
3. Selecione as permissões necessárias
4. Copie o token gerado

### Dependências
- **Node.js**: Para `check-github-status.js`
- **PowerShell**: Para `check-github-status.ps1` 
- **Bash + jq + curl**: Para `check-github-status.sh`

## Uso

### Opção 1: Script Node.js (Recomendado)
```bash
# Definir token
export GITHUB_TOKEN=ghp_seu_token_aqui

# Executar via npm script
npm run github:status

# Ou executar diretamente
node scripts/check-github-status.js
```

### Opção 2: Script Bash (Linux/macOS)
```bash
# Instalar dependências (se necessário)
# Ubuntu/Debian: sudo apt-get install jq curl
# macOS: brew install jq

# Executar
GITHUB_TOKEN=ghp_seu_token_aqui bash scripts/check-github-status.sh
```

### Opção 3: Script PowerShell (Windows)
```powershell
# Definir token
$env:GITHUB_TOKEN='ghp_seu_token_aqui'

# Executar
.\scripts\check-github-status.ps1
```

## Saída Exemplo

```
🔍 Verificando status do GitHub para Gladiston-Porto/GladPros

📋 BRANCHES:

📌 main (abc1234)
   🔧 Workflows Recentes:
      ✅ COMPLETED CI - 2h atrás
      ✅ COMPLETED Build - 2h atrás
   ✓ Check Runs:
      ✅ SUCCESS ESLint
      ✅ SUCCESS TypeScript

📌 develop (def5678)
   🔧 Workflows Recentes:
      🔄 IN PROGRESS CI - 5m atrás
   📝 Nenhum check run encontrado

🏗️ RESUMO DOS WORKFLOWS:

⚙️ CI
   Estado: Ativo
   Execuções Recentes:
      ✅ SUCCESS main - 2h atrás
      🔄 IN PROGRESS develop - 5m atrás

⚙️ Build
   Estado: Ativo
   Execuções Recentes:
      ✅ SUCCESS main - 2h atrás

✅ Verificação concluída com sucesso!
```

## Status e Ícones

| Status | Ícone | Significado |
|--------|-------|-------------|
| SUCCESS/COMPLETED | ✅ | Execução bem-sucedida |
| FAILURE | ❌ | Execução com falha |
| PENDING | ⏳ | Aguardando execução |
| IN_PROGRESS | 🔄 | Em execução |
| CANCELLED | ⚠️ | Cancelado |
| QUEUED/REQUESTED | 📋 | Na fila |
| WAITING | ⏰ | Aguardando recursos |

## Solução de Problemas

### Erro de Autenticação
```
❌ ERRO: GitHub API error: 401 - Bad credentials
```
- Verifique se o token está correto
- Confirme que o token tem as permissões necessárias

### Erro de Rate Limit
```
❌ ERRO: GitHub API error: 403 - API rate limit exceeded
```
- Aguarde um momento antes de executar novamente
- Use um token autenticado para ter limite maior

### Comando não encontrado (Bash)
```
bash: jq: command not found
```
- Instale as dependências:
  - Ubuntu/Debian: `sudo apt-get install jq curl`
  - macOS: `brew install jq`
  - CentOS/RHEL: `sudo yum install jq curl`

## Scripts Relacionados

- `create-pr.sh` / `create-pr.ps1`: Criar Pull Requests
- `smoke-test.sh`: Testes de smoke
- `check-build-env.js`: Verificar ambiente de build

## Configuração no CI/CD

Você pode usar estes scripts em workflows do GitHub Actions:

```yaml
- name: Check GitHub Status
  run: npm run github:status
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```