#!/usr/bin/env bash
set -euo pipefail

# Verifica o status dos branches e checks do GitHub Actions
# Uso:
#   GITHUB_TOKEN=ghp_xxx bash scripts/check-github-status.sh
# ou definir PERSONAL_TOKEN env var

OWNER="Gladiston-Porto"
REPO="GladPros"

# Configuração de cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TOKEN="${GITHUB_TOKEN:-${PERSONAL_TOKEN:-}}"
if [ -z "$TOKEN" ]; then
  echo -e "${RED}ERROR: defina GITHUB_TOKEN ou PERSONAL_TOKEN environment variable com permissão repo:status${NC}"
  echo "Exemplo: GITHUB_TOKEN=ghp_xxx bash scripts/check-github-status.sh"
  exit 1
fi

# Headers padrão para API calls
API_HEADERS=(-H "Authorization: token ${TOKEN}" -H "Accept: application/vnd.github+json" -H "User-Agent: GladPros-StatusChecker")

echo -e "${BLUE}🔍 Verificando status dos branches e CI/CD do repositório ${OWNER}/${REPO}...${NC}\n"

# Função para fazer chamadas à API do GitHub
github_api() {
  local endpoint="$1"
  local url="https://api.github.com/repos/${OWNER}/${REPO}${endpoint}"
  curl -sS "${API_HEADERS[@]}" "$url"
}

# Função para formatar timestamp
format_time() {
  local timestamp="$1"
  if [ "$timestamp" != "null" ] && [ -n "$timestamp" ]; then
    # Converter ISO 8601 para formato legível (se tiver gnu date)
    if date --version >/dev/null 2>&1; then
      date -d "$timestamp" '+%d/%m/%Y %H:%M:%S' 2>/dev/null || echo "$timestamp"
    else
      echo "$timestamp"
    fi
  else
    echo "N/A"
  fi
}

# Função para obter status de cor baseado no resultado
get_status_color() {
  local status="$1"
  case "$status" in
    "success"|"completed") echo -e "${GREEN}" ;;
    "failure"|"failed"|"error") echo -e "${RED}" ;;
    "pending"|"in_progress"|"queued") echo -e "${YELLOW}" ;;
    *) echo -e "${NC}" ;;
  esac
}

echo -e "${BLUE}📋 Status dos Branches:${NC}"
echo "=================================="

# Listar branches principais
branches_resp=$(github_api "/branches")
if [ "$(echo "$branches_resp" | jq -r 'type')" = "array" ]; then
  echo "$branches_resp" | jq -r '.[] | select(.name == "main" or .name == "master" or .name == "develop" or .name == "staging") | "\(.name)|\(.protected)|\(.commit.sha[0:7])|\(.commit.commit.author.date)"' | while IFS='|' read -r branch_name protected commit_sha commit_date; do
    protected_status=$([ "$protected" = "true" ] && echo "🔒 Protected" || echo "🔓 Open")
    formatted_date=$(format_time "$commit_date")
    echo -e "  ${GREEN}${branch_name}${NC} - ${protected_status} - Commit: ${commit_sha} - ${formatted_date}"
  done
else
  echo -e "  ${RED}❌ Erro ao obter informações dos branches${NC}"
fi

echo ""
echo -e "${BLUE}🏃 GitHub Actions Workflows:${NC}"
echo "=================================="

# Listar workflows
workflows_resp=$(github_api "/actions/workflows")
if [ "$(echo "$workflows_resp" | jq -r '.workflows | type')" = "array" ]; then
  echo "$workflows_resp" | jq -r '.workflows[] | "\(.id)|\(.name)|\(.state)|\(.badge_url)"' | while IFS='|' read -r workflow_id workflow_name state badge_url; do
    state_color=$(get_status_color "$state")
    echo -e "  ${state_color}${workflow_name}${NC} - Status: ${state_color}${state}${NC}"
    
    # Obter runs recentes para este workflow
    runs_resp=$(github_api "/actions/workflows/${workflow_id}/runs?per_page=5")
    if [ "$(echo "$runs_resp" | jq -r '.workflow_runs | type')" = "array" ]; then
      echo "$runs_resp" | jq -r '.workflow_runs[0:3][] | "\(.conclusion)|\(.status)|\(.created_at)|\(.head_branch)|\(.html_url)"' | while IFS='|' read -r conclusion status created_at head_branch html_url; do
        run_status="${conclusion:-$status}"
        status_color=$(get_status_color "$run_status")
        formatted_date=$(format_time "$created_at")
        echo -e "    └─ ${status_color}${run_status}${NC} - Branch: ${head_branch} - ${formatted_date}"
      done
    fi
    echo ""
  done
else
  echo -e "  ${RED}❌ Erro ao obter informações dos workflows${NC}"
fi

echo -e "${BLUE}📊 Resumo de Status Checks:${NC}"
echo "=================================="

# Verificar status checks do branch principal
main_branch="main"
status_checks_resp=$(github_api "/commits/${main_branch}/status")

if [ "$(echo "$status_checks_resp" | jq -r 'type')" = "object" ]; then
  overall_state=$(echo "$status_checks_resp" | jq -r '.state')
  total_count=$(echo "$status_checks_resp" | jq -r '.total_count')
  
  state_color=$(get_status_color "$overall_state")
  echo -e "  Branch ${main_branch}: ${state_color}${overall_state}${NC} (${total_count} checks)"
  
  if [ "$total_count" -gt 0 ]; then
    echo "$status_checks_resp" | jq -r '.statuses[]? | "\(.state)|\(.context)|\(.description)|\(.target_url)"' | while IFS='|' read -r state context description target_url; do
      status_color=$(get_status_color "$state")
      echo -e "    └─ ${context}: ${status_color}${state}${NC} - ${description}"
    done
  fi
else
  echo -e "  ${YELLOW}⚠️  Nenhum status check encontrado para o branch ${main_branch}${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Runs Recentes (últimas 10):${NC}"
echo "=================================="

# Listar runs recentes de todos os workflows
recent_runs_resp=$(github_api "/actions/runs?per_page=10")
if [ "$(echo "$recent_runs_resp" | jq -r '.workflow_runs | type')" = "array" ]; then
  echo "$recent_runs_resp" | jq -r '.workflow_runs[] | "\(.conclusion)|\(.status)|\(.name)|\(.head_branch)|\(.created_at)|\(.html_url)"' | while IFS='|' read -r conclusion status workflow_name head_branch created_at html_url; do
    run_status="${conclusion:-$status}"
    status_color=$(get_status_color "$run_status")
    formatted_date=$(format_time "$created_at")
    echo -e "  ${status_color}${run_status}${NC} - ${workflow_name} (${head_branch}) - ${formatted_date}"
  done
else
  echo -e "  ${RED}❌ Erro ao obter runs recentes${NC}"
fi

echo ""
echo -e "${BLUE}💾 Artefatos Disponíveis:${NC}"
echo "=================================="

# Listar artefatos recentes
artifacts_resp=$(github_api "/actions/artifacts?per_page=10")
if [ "$(echo "$artifacts_resp" | jq -r '.artifacts | type')" = "array" ]; then
  artifact_count=$(echo "$artifacts_resp" | jq -r '.total_count')
  if [ "$artifact_count" -gt 0 ]; then
    echo "$artifacts_resp" | jq -r '.artifacts[] | "\(.name)|\(.size_in_bytes)|\(.created_at)|\(.expired)"' | while IFS='|' read -r artifact_name size_bytes created_at expired; do
      size_mb=$((size_bytes / 1024 / 1024))
      formatted_date=$(format_time "$created_at")
      expired_status=$([ "$expired" = "true" ] && echo -e "${RED}(Expirado)${NC}" || echo -e "${GREEN}(Ativo)${NC}")
      echo -e "  📦 ${artifact_name} - ${size_mb}MB - ${formatted_date} ${expired_status}"
    done
  else
    echo -e "  ${YELLOW}⚠️  Nenhum artefato encontrado${NC}"
  fi
else
  echo -e "  ${RED}❌ Erro ao obter artefatos${NC}"
fi

echo ""
echo -e "${GREEN}✅ Verificação concluída!${NC}"
echo ""
echo -e "${BLUE}💡 Dicas:${NC}"
echo "  • Para mais detalhes, acesse: https://github.com/${OWNER}/${REPO}/actions"
echo "  • Para reexecutar workflows falhos, use a interface web do GitHub"
echo "  • Verifique logs específicos clicando nos runs individuais"