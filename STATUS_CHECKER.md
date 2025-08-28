# GitHub Status Checker - Quick Start

## 🚀 Verificação Rápida de Status

### Comando Mais Simples
```bash
npm run status:check
```

### Com Token GitHub (Recomendado)
```bash
GITHUB_TOKEN=ghp_xxx npm run status:check
```

### Scripts Disponíveis
```bash
# Verificação completa (bash - funciona offline)
npm run status:check

# Verificação via API GitHub (Node.js)
npm run status:check-js

# Análise completa avançada
npm run status:check-full
```

## 📋 O que Verifica

- ✅ **Branches**: Status atual, branches locais/remotos, mudanças não commitadas
- ✅ **Workflows**: Arquivos de workflow, triggers configurados, execuções recentes
- ✅ **Commits**: Atividade recente, autores, histórico
- ✅ **Saúde**: Status geral do CI/CD, problemas identificados

## 🎯 Uso Típico

```bash
# Antes de começar a trabalhar
npm run status:check

# Verificar workflows específicos
GITHUB_TOKEN=$TOKEN npm run status:check-js

# Debug de problemas de CI/CD
./scripts/check-github-status.sh --help
```

## 📖 Documentação Completa

Ver: [`docs/github-status-checker.md`](docs/github-status-checker.md)

---
*Última atualização: 2025-08-28*