#!/usr/bin/env bash
# scripts/check-github-status.sh
# Wrapper script para verificar o status dos branches e checks do GitHub Actions

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 GladPros - Verificação de Status do GitHub${NC}"
echo -e "${BLUE}================================================${NC}"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Erro: Node.js não está instalado${NC}"
    echo -e "${YELLOW}   Instale o Node.js para usar este script${NC}"
    exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Check if the main script exists
MAIN_SCRIPT="$SCRIPT_DIR/check-github-status.js"
if [ ! -f "$MAIN_SCRIPT" ]; then
    echo -e "${RED}❌ Erro: Script principal não encontrado: $MAIN_SCRIPT${NC}"
    exit 1
fi

# Check for GitHub token
if [ -z "${GITHUB_TOKEN:-}" ] && [ -z "${PERSONAL_TOKEN:-}" ]; then
    echo -e "${YELLOW}⚠️  AVISO: GITHUB_TOKEN não configurado${NC}"
    echo -e "${YELLOW}   Para acesso completo à API, configure:${NC}"
    echo -e "${YELLOW}   export GITHUB_TOKEN=ghp_xxx${NC}"
    echo ""
fi

# Change to project root and run the main script
cd "$PROJECT_ROOT"

echo -e "${BLUE}📁 Diretório do projeto: $PROJECT_ROOT${NC}"
echo ""

# Run the main Node.js script
node "$MAIN_SCRIPT" "$@"

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Script executado com sucesso!${NC}"
else
    echo ""
    echo -e "${RED}❌ Script finalizado com erro (código: $exit_code)${NC}"
fi

exit $exit_code