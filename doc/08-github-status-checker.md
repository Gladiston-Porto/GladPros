# GitHub Status Checker - GladPros

Este script verifica o status dos branches e workflows do GitHub Actions para o repositório GladPros.

## Funcionalidades

- ✅ Lista todos os branches do repositório
- ✅ Mostra status dos workflows do GitHub Actions  
- ✅ Exibe histórico recente de execuções
- ✅ Verifica status do último commit
- ✅ Identifica checks de CI/CD falhando
- ✅ Interface colorida e amigável

## Como usar

### 1. Usando npm script (recomendado)
```bash
npm run github:status
# ou
npm run github:check  # versão com wrapper shell
```

### 2. Executando diretamente
```bash
# Script Node.js
node scripts/check-github-status.js

# Script shell (wrapper)
bash scripts/check-github-status.sh
```

## Configuração do Token GitHub

Para acesso completo à API do GitHub (sem limitações de rate limit), configure um token:

### 1. Criar um Personal Access Token
1. Vá para https://github.com/settings/tokens
2. Clique em "Generate new token" → "Classic"
3. Selecione as seguintes permissões:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
   - `read:org` (Read organization membership)

### 2. Configurar o token
```bash
# Temporário (sessão atual)
export GITHUB_TOKEN=ghp_seu_token_aqui

# Permanente (adicione ao seu ~/.bashrc ou ~/.zshrc)
echo 'export GITHUB_TOKEN=ghp_seu_token_aqui' >> ~/.bashrc
```

Alternativamente, você pode usar `PERSONAL_TOKEN`:
```bash
export PERSONAL_TOKEN=ghp_seu_token_aqui
```

## Exemplo de saída

```
🚀 GladPros - Verificação de Status do GitHub
==================================================

📦 Repositório: Gladiston-Porto/GladPros
🌿 Branch local atual: main

📋 Branches disponíveis:
  • main (protegido)
  • develop
  • feature/new-dashboard
  • hotfix/security-patch

📋 Workflows configurados:
  • CI (.github/workflows/ci.yml) - ATIVO
  • Build and Test (.github/workflows/build.yml) - ATIVO  
  • Smoke Tests (.github/workflows/smoke-e2e.yml) - ATIVO

🚀 Status dos workflows recentes:
  ✅ CI - SUCCESS
     Branch: main | Commit: abc1234 | 28/08/2024 10:30
  ❌ Build and Test - FAILURE
     Branch: develop | Commit: def5678 | 27/08/2024 15:45
  🔄 Smoke Tests - IN_PROGRESS
     Branch: feature/dashboard | Commit: ghi9012 | 28/08/2024 11:00

📊 Status do último commit:
  Commit: abc1234 - feat: add new dashboard components
  Autor: Gladiston Porto
  Data: 28/08/2024 10:25
  Status: SUCCESS
  📋 Checks:
    ✅ ci/lint: SUCCESS
    ✅ ci/test: SUCCESS  
    ✅ ci/build: SUCCESS

✅ Verificação concluída!
```

## Tratamento de Erros

O script trata graciosamente os seguintes cenários:
- Token não configurado (usa rate limit público)
- Problemas de conectividade
- Repositório privado sem permissões
- Branch local não existe no remoto
- API indisponível

## Integração com CI/CD

Você pode usar este script em workflows para monitoramento:

```yaml
- name: Check GitHub Status
  run: npm run github:status
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Arquivos

- `scripts/check-github-status.js` - Script principal Node.js
- `scripts/check-github-status.sh` - Wrapper shell script  
- `doc/08-github-status-checker.md` - Esta documentação

## Desenvolvimento

Para contribuir com melhorias:

1. Os scripts seguem o padrão dos outros utilitários em `/scripts`
2. Use as funções modulares exportadas para testes
3. Mantenha compatibilidade com Node.js 18+
4. Adicione tratamento de erros adequado