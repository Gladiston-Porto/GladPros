# GitHub Branch and CI/CD Status Checker

Este projeto inclui ferramentas para verificar o status dos branches e workflows do GitHub Actions, fornecendo informações detalhadas sobre a saúde do CI/CD do repositório.

## 🚀 Scripts Disponíveis

### 1. `check-github-status.sh` (Recomendado)
Script em Bash que funciona offline usando git local e opcionalmente GitHub API.

**Características:**
- ✅ Funciona sem dependências externas
- ✅ Verifica branches locais e remotos
- ✅ Analisa arquivos de workflow
- ✅ Mostra atividade recente de commits
- ✅ Suporte opcional para GitHub API

### 2. `check-ci-status.js`
Script em Node.js com foco na GitHub API para informações em tempo real.

**Características:**
- ✅ Informações detalhadas via GitHub API
- ✅ Status de workflows em tempo real
- ✅ Histórico de execuções
- ✅ Análise de saúde dos workflows

### 3. `check-github-status.js`
Script Node.js completo com análise avançada.

**Características:**
- ✅ Análise completa de saúde do CI/CD
- ✅ Relatórios detalhados
- ✅ Recomendações de melhoria
- ✅ Suporte para múltiplos workflows

## 📋 Como Usar

### Uso Básico (Script Bash - Recomendado)

```bash
# Executar verificação básica
./scripts/check-github-status.sh

# Com token do GitHub para informações mais detalhadas
GITHUB_TOKEN=ghp_xxx ./scripts/check-github-status.sh

# Mostrar ajuda
./scripts/check-github-status.sh --help
```

### Uso com Node.js

```bash
# Script simples
node scripts/check-ci-status.js

# Com token do GitHub
GITHUB_TOKEN=ghp_xxx node scripts/check-ci-status.js

# Script completo
GITHUB_TOKEN=ghp_xxx node scripts/check-github-status.js
```

## 🔧 Configuração do Token GitHub

Para acessar informações privadas e evitar rate limiting:

1. Gere um Personal Access Token no GitHub:
   - Vá para Settings → Developer settings → Personal access tokens
   - Clique em "Generate new token (classic)"
   - Selecione os escopos necessários:
     - `repo` (para repositórios privados)
     - `actions:read` (para workflows)

2. Configure o token:
   ```bash
   export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
   ```

3. Ou use diretamente:
   ```bash
   GITHUB_TOKEN=ghp_xxx ./scripts/check-github-status.sh
   ```

## 📊 Informações Fornecidas

### Status de Branches
- ✅ Branch atual e branches disponíveis
- ✅ Branches locais vs remotos
- ✅ Branch padrão do repositório
- ✅ Branches protegidos (com token)
- ✅ Estado do working directory

### Status de Workflows
- ✅ Lista de workflows configurados
- ✅ Status ativo/inativo dos workflows
- ✅ Histórico de execuções recentes
- ✅ Triggers configurados (push, PR, schedule)
- ✅ Taxa de sucesso

### Atividade Recente
- ✅ Commits recentes
- ✅ Autores mais ativos
- ✅ Mudanças não commitadas
- ✅ Status de sincronização com remote

### Saúde Geral
- ✅ Resumo da saúde do CI/CD
- ✅ Identificação de problemas
- ✅ Recomendações de melhoria
- ✅ Análise de tendências

## 🎯 Casos de Uso

### Para Desenvolvedores
```bash
# Verificar status antes de começar a trabalhar
./scripts/check-github-status.sh

# Verificar se workflows estão funcionando
GITHUB_TOKEN=xxx ./scripts/check-ci-status.js
```

### Para CI/CD
```bash
# Em workflows GitHub Actions
- name: Check Repository Health
  run: ./scripts/check-github-status.sh
```

### Para DevOps
```bash
# Monitoramento automatizado
GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }} node scripts/check-github-status.js
```

## 🔍 Exemplo de Saída

```
🚀 GitHub Branch and CI/CD Status Checker
📁 Repository: Gladiston-Porto/GladPros
==================================================

🌿 Checking local branches...
📊 Local Branch Summary:
   Current branch: main
   Local branches: 3
   Remote branches: 15
   Total branches: 18

🔧 Checking workflow files...
📊 Workflow Files Summary:
   Total workflows: 4
📋 Workflow files:
   📄 ci.yml (31 lines)
      - Triggers on push
      - Triggers on PR
   📄 build.yml (54 lines)
      - Triggers on push
      - Triggers on PR

🏥 Health Summary:
   🟢 Found 4 workflow files
   🟢 Working directory clean

🟢 Overall Status: HEALTHY
```

## ⚠️ Limitações

### Sem Token GitHub
- Rate limiting da API (60 requests/hora)
- Não acessa repositórios privados
- Informações limitadas sobre workflows

### Com Token GitHub
- Rate limiting mais alto (5000 requests/hora)
- Acesso completo conforme permissões do token
- Informações detalhadas de workflows e branches

## 🛠️ Solução de Problemas

### Erro 403 - Forbidden
- Verificar se o token tem as permissões necessárias
- Para repos privados, necessário escopo `repo`
- Verificar se o token não expirou

### Erro de Rede
- Verificar conectividade com api.github.com
- Considerar usar proxy se necessário

### Comandos Git Falhando
- Verificar se está em um repositório git válido
- Verificar se o remote está configurado corretamente

## 📝 Contribuição

Para adicionar novas funcionalidades:

1. Modifique o script bash para funcionalidade local
2. Adicione funcionalidade API no script Node.js
3. Atualize esta documentação
4. Teste em diferentes cenários

## 🔄 Integração com CI/CD

### GitHub Actions
```yaml
- name: Check CI/CD Health
  run: |
    chmod +x scripts/check-github-status.sh
    ./scripts/check-github-status.sh
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Script de Pre-commit
```bash
#!/bin/bash
# .git/hooks/pre-commit
./scripts/check-github-status.sh || exit 1
```

---

**Autor:** GladPros Development Team  
**Última atualização:** 2025-08-28