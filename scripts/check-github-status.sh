#!/usr/bin/env bash
set -euo pipefail

# Checks GitHub branches and CI/CD workflow status using the REST API
# Usage:
#   GITHUB_TOKEN=ghp_xxx bash scripts/check-github-status.sh
# or set PERSONAL_TOKEN env var

OWNER="Gladiston-Porto"
REPO="GladPros"

echo "🔍 Verificando status dos branches e CI/CD do GitHub..."
echo "Repository: ${OWNER}/${REPO}"
echo

# Check for authentication token
TOKEN="${GITHUB_TOKEN:-${PERSONAL_TOKEN:-}}"
if [ -z "$TOKEN" ]; then
  echo "❌ ERROR: set GITHUB_TOKEN or PERSONAL_TOKEN environment variable"
  echo "Example: GITHUB_TOKEN=ghp_xxx bash scripts/check-github-status.sh"
  exit 1
fi

# Check if jq is available
if ! command -v jq &> /dev/null; then
  echo "⚠️  jq não encontrado. Instalando ou usando fallback..."
  JQ_AVAILABLE=false
else
  JQ_AVAILABLE=true
fi

# Common headers for GitHub API
HEADERS=(-H "Authorization: token ${TOKEN}" -H "Accept: application/vnd.github+json" -H "User-Agent: GladPros-Status-Check")

# Helper function to parse JSON without jq (basic fallback)
parse_json_basic() {
  local json="$1"
  local field="$2"
  # Basic grep/sed approach - not as robust as jq but works for simple cases
  echo "$json" | grep -o "\"$field\":[^,}]*" | sed "s/\"$field\"://g" | sed 's/[",]//g'
}

echo "📋 BRANCHES STATUS"
echo "=================="

# Get all branches
BRANCHES_API="https://api.github.com/repos/${OWNER}/${REPO}/branches"
branches_resp=$(curl -sS "${HEADERS[@]}" "$BRANCHES_API")

if [ $? -ne 0 ]; then
  echo "❌ Erro ao obter branches"
  exit 1
fi

# Parse and display branches
if [ "$JQ_AVAILABLE" = true ]; then
  echo "$branches_resp" | jq -r '.[] | "📌 \(.name) - Commit: \(.commit.sha[0:7]) - \(.commit.commit.author.date)"' 2>/dev/null || {
    echo "⚠️  Resposta inesperada da API de branches"
    echo "$branches_resp"
  }
else
  echo "⚠️  Processando sem jq (saída limitada)"
  echo "$branches_resp" | grep -o '"name":"[^"]*"' | sed 's/"name":"//g' | sed 's/"//g' | while read -r branch; do
    echo "📌 $branch"
  done
fi

echo
echo "🚀 CI/CD WORKFLOWS STATUS"
echo "========================"

# Get workflows
WORKFLOWS_API="https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows"
workflows_resp=$(curl -sS "${HEADERS[@]}" "$WORKFLOWS_API")

if [ $? -ne 0 ]; then
  echo "❌ Erro ao obter workflows"
  exit 1
fi

# Get workflow IDs and names
if [ "$JQ_AVAILABLE" = true ]; then
  workflow_data=$(echo "$workflows_resp" | jq -r '.workflows[] | "\(.id) \(.name) \(.state)"' 2>/dev/null)
else
  # Basic fallback
  echo "⚠️  Processando workflows sem jq (saída limitada)"
  echo "$workflows_resp" | grep -o '"name":"[^"]*"' | sed 's/"name":"//g' | sed 's/"//g' | head -5
  workflow_data=""
fi

if [ -z "$workflow_data" ]; then
  echo "⚠️  Nenhum workflow encontrado ou erro no processamento"
else
  echo "$workflow_data" | while read -r workflow_id workflow_name workflow_state; do
    echo
    echo "📊 Workflow: $workflow_name (ID: $workflow_id) - Estado: $workflow_state"
    
    # Get recent runs for this workflow
    RUNS_API="https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${workflow_id}/runs?per_page=5"
    runs_resp=$(curl -sS "${HEADERS[@]}" "$RUNS_API")
    
    if [ $? -eq 0 ]; then
      if [ "$JQ_AVAILABLE" = true ]; then
        echo "$runs_resp" | jq -r '.workflow_runs[] | "   🔸 \(.head_branch) - \(.conclusion // "running") - \(.created_at) - \(.html_url)"' 2>/dev/null || {
          echo "   ⚠️  Erro ao processar runs do workflow"
        }
      else
        echo "   ⚠️  Listagem de runs requer jq para processamento completo"
      fi
    else
      echo "   ❌ Erro ao obter runs do workflow"
    fi
  done
fi

echo
echo "📈 WORKFLOW RUNS SUMMARY (últimos 10)"
echo "==================================="

# Get recent workflow runs across all workflows
RUNS_ALL_API="https://api.github.com/repos/${OWNER}/${REPO}/actions/runs?per_page=10"
all_runs_resp=$(curl -sS "${HEADERS[@]}" "$RUNS_ALL_API")

if [ $? -eq 0 ]; then
  if [ "$JQ_AVAILABLE" = true ]; then
    echo "$all_runs_resp" | jq -r '.workflow_runs[] | 
      if .conclusion == "success" then "✅"
      elif .conclusion == "failure" then "❌"  
      elif .conclusion == "cancelled" then "⚪"
      elif .status == "in_progress" then "🔄"
      else "⏳"
      end + " \(.workflow_name) - \(.head_branch) - \(.conclusion // .status) - \(.created_at[0:10])"' 2>/dev/null || {
      echo "⚠️  Erro ao processar resumo dos runs"
      echo "$all_runs_resp"
    }
  else
    echo "⚠️  Resumo detalhado requer jq. Mostrando resposta básica:"
    echo "$all_runs_resp" | head -20
  fi
else
  echo "❌ Erro ao obter resumo dos workflow runs"
fi

echo
echo "🏁 Verificação concluída!"