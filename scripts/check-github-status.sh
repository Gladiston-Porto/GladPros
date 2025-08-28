#!/usr/bin/env bash
set -euo pipefail

# Script para verificar status dos branches e CI/CD do GitHub
# 
# Usage:
#   GITHUB_TOKEN=ghp_xxx bash scripts/check-github-status.sh
# 
# Features:
# - Lista todos os branches do repositório
# - Verifica status dos workflows do GitHub Actions
# - Mostra status dos checks para cada branch
# - Exibe output colorido para melhor visualização

# Configurações do repositório
OWNER="Gladiston-Porto"
REPO="GladPros"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
DIM='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Função para formatar status com cores e ícones
format_status() {
    local status="$1"
    case "$status" in
        "success") echo -e "${GREEN}✅ SUCCESS${NC}" ;;
        "failure") echo -e "${RED}❌ FAILURE${NC}" ;;
        "pending") echo -e "${YELLOW}⏳ PENDING${NC}" ;;
        "in_progress") echo -e "${BLUE}🔄 IN PROGRESS${NC}" ;;
        "completed") echo -e "${GREEN}✅ COMPLETED${NC}" ;;
        "cancelled") echo -e "${YELLOW}⚠️ CANCELLED${NC}" ;;
        "queued") echo -e "${CYAN}📋 QUEUED${NC}" ;;
        "requested") echo -e "${CYAN}📋 REQUESTED${NC}" ;;
        "waiting") echo -e "${BLUE}⏰ WAITING${NC}" ;;
        *) echo -e "${DIM}❓ ${status^^}${NC}" ;;
    esac
}

# Função para calcular tempo relativo
format_time_ago() {
    local date_str="$1"
    local now_epoch=$(date +%s)
    
    # Converter data ISO para epoch (funciona no GNU date e macOS date)
    local date_epoch
    if date --version >/dev/null 2>&1; then
        # GNU date (Linux)
        date_epoch=$(date -d "$date_str" +%s 2>/dev/null || echo "$now_epoch")
    else
        # BSD date (macOS)
        date_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "${date_str%.*}Z" +%s 2>/dev/null || echo "$now_epoch")
    fi
    
    local diff=$((now_epoch - date_epoch))
    local minutes=$((diff / 60))
    local hours=$((minutes / 60))
    local days=$((hours / 24))
    
    if [ $minutes -lt 1 ]; then
        echo "agora mesmo"
    elif [ $minutes -lt 60 ]; then
        echo "${minutes}m atrás"
    elif [ $hours -lt 24 ]; then
        echo "${hours}h atrás"
    else
        echo "${days}d atrás"
    fi
}

# Função para fazer requisições à API do GitHub
github_api() {
    local endpoint="$1"
    local url="https://api.github.com${endpoint}"
    
    curl -s -H "User-Agent: GladPros-Status-Checker" \
         -H "Accept: application/vnd.github+json" \
         -H "Authorization: token ${TOKEN}" \
         -H "X-GitHub-Api-Version: 2022-11-28" \
         "$url"
}

# Verificar se o token está definido
TOKEN="${GITHUB_TOKEN:-${PERSONAL_TOKEN:-}}"
if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ ERRO: Defina GITHUB_TOKEN ou PERSONAL_TOKEN com permissões de repo${NC}"
    echo -e "${DIM}Exemplo: GITHUB_TOKEN=ghp_xxx bash scripts/check-github-status.sh${NC}"
    exit 1
fi

echo -e "${BOLD}${CYAN}🔍 Verificando status do GitHub para $OWNER/$REPO${NC}\n"

# 1. Buscar branches
echo -e "${BOLD}📋 BRANCHES:${NC}"

branches_json=$(github_api "/repos/$OWNER/$REPO/branches?per_page=50")
if [ "$?" -ne 0 ] || [ -z "$branches_json" ]; then
    echo -e "${RED}❌ Erro ao buscar branches${NC}"
    exit 1
fi

# Processar cada branch
echo "$branches_json" | jq -r '.[] | @base64' | while IFS= read -r branch_data; do
    branch_json=$(echo "$branch_data" | base64 --decode 2>/dev/null || echo "$branch_data" | base64 -d)
    branch_name=$(echo "$branch_json" | jq -r '.name')
    sha=$(echo "$branch_json" | jq -r '.commit.sha[:7]')
    full_sha=$(echo "$branch_json" | jq -r '.commit.sha')
    
    echo ""
    echo -e "${BOLD}${BLUE}📌 $branch_name${NC} ${DIM}($sha)${NC}"
    
    # Buscar workflow runs para este branch
    workflow_runs=$(github_api "/repos/$OWNER/$REPO/actions/runs?branch=$(printf '%s' "$branch_name" | jq -sRr @uri)&per_page=10")
    
    if echo "$workflow_runs" | jq -e '.workflow_runs | length > 0' >/dev/null 2>&1; then
        echo -e "   ${BOLD}🔧 Workflows Recentes:${NC}"
        echo "$workflow_runs" | jq -r '.workflow_runs[:3][] | @base64' | while IFS= read -r run_data; do
            run_json=$(echo "$run_data" | base64 --decode 2>/dev/null || echo "$run_data" | base64 -d)
            name=$(echo "$run_json" | jq -r '.name')
            conclusion=$(echo "$run_json" | jq -r '.conclusion // .status')
            created_at=$(echo "$run_json" | jq -r '.created_at')
            
            status_formatted=$(format_status "$conclusion")
            time_ago=$(format_time_ago "$created_at")
            echo -e "      $status_formatted $name - $time_ago"
        done
    fi
    
    # Buscar check runs
    check_runs=$(github_api "/repos/$OWNER/$REPO/commits/$full_sha/check-runs" 2>/dev/null || echo '{"check_runs":[]}')
    
    if echo "$check_runs" | jq -e '.check_runs | length > 0' >/dev/null 2>&1; then
        echo -e "   ${BOLD}✓ Check Runs:${NC}"
        echo "$check_runs" | jq -r '.check_runs[] | @base64' | while IFS= read -r check_data; do
            check_json=$(echo "$check_data" | base64 --decode 2>/dev/null || echo "$check_data" | base64 -d)
            name=$(echo "$check_json" | jq -r '.name')
            conclusion=$(echo "$check_json" | jq -r '.conclusion // .status')
            
            status_formatted=$(format_status "$conclusion")
            echo -e "      $status_formatted $name"
        done
    fi
    
    # Buscar status checks
    statuses=$(github_api "/repos/$OWNER/$REPO/commits/$full_sha/status" 2>/dev/null || echo '{"statuses":[]}')
    
    if echo "$statuses" | jq -e '.statuses | length > 0' >/dev/null 2>&1; then
        echo -e "   ${BOLD}🔍 Status Checks:${NC}"
        echo "$statuses" | jq -r '.statuses[:3][] | @base64' | while IFS= read -r status_data; do
            status_json=$(echo "$status_data" | base64 --decode 2>/dev/null || echo "$status_data" | base64 -d)
            context=$(echo "$status_json" | jq -r '.context')
            state=$(echo "$status_json" | jq -r '.state')
            description=$(echo "$status_json" | jq -r '.description // "No description"')
            
            status_formatted=$(format_status "$state")
            echo -e "      $status_formatted $context - $description"
        done
    fi
    
    # Verificar se não há nenhum check/workflow
    no_workflows=$(echo "$workflow_runs" | jq -r '.workflow_runs | length == 0')
    no_checks=$(echo "$check_runs" | jq -r '.check_runs | length == 0')
    no_statuses=$(echo "$statuses" | jq -r '.statuses | length == 0')
    
    if [ "$no_workflows" = "true" ] && [ "$no_checks" = "true" ] && [ "$no_statuses" = "true" ]; then
        echo -e "   ${DIM}📝 Nenhum workflow ou check encontrado${NC}"
    fi
done

# 2. Resumo geral dos workflows
echo ""
echo -e "${BOLD}${MAGENTA}🏗️ RESUMO DOS WORKFLOWS:${NC}"

workflows=$(github_api "/repos/$OWNER/$REPO/actions/workflows")

echo "$workflows" | jq -r '.workflows[] | @base64' | while IFS= read -r workflow_data; do
    workflow_json=$(echo "$workflow_data" | base64 --decode 2>/dev/null || echo "$workflow_data" | base64 -d)
    name=$(echo "$workflow_json" | jq -r '.name')
    state=$(echo "$workflow_json" | jq -r '.state')
    workflow_id=$(echo "$workflow_json" | jq -r '.id')
    
    echo ""
    echo -e "${BOLD}⚙️ $name${NC}"
    
    if [ "$state" = "active" ]; then
        echo -e "   Estado: ${GREEN}Ativo${NC}"
    else
        echo -e "   Estado: ${YELLOW}Inativo${NC}"
    fi
    
    # Buscar execuções recentes
    runs=$(github_api "/repos/$OWNER/$REPO/actions/workflows/$workflow_id/runs?per_page=5")
    
    if echo "$runs" | jq -e '.workflow_runs | length > 0' >/dev/null 2>&1; then
        echo -e "   ${BOLD}Execuções Recentes:${NC}"
        echo "$runs" | jq -r '.workflow_runs[:3][] | @base64' | while IFS= read -r run_data; do
            run_json=$(echo "$run_data" | base64 --decode 2>/dev/null || echo "$run_data" | base64 -d)
            conclusion=$(echo "$run_json" | jq -r '.conclusion // .status')
            created_at=$(echo "$run_json" | jq -r '.created_at')
            head_branch=$(echo "$run_json" | jq -r '.head_branch // "unknown"')
            
            status_formatted=$(format_status "$conclusion")
            time_ago=$(format_time_ago "$created_at")
            echo -e "      $status_formatted $head_branch - $time_ago"
        done
    else
        echo -e "   ${DIM}📝 Nenhuma execução encontrada${NC}"
    fi
done

echo ""
echo -e "${BOLD}${GREEN}✅ Verificação concluída com sucesso!${NC}"