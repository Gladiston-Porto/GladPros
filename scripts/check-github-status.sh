#!/usr/bin/env bash
# scripts/check-github-status.sh
# Verifica o status dos branches e GitHub Actions CI/CD

set -euo pipefail

# Check if GitHub token is available
TOKEN="${GITHUB_TOKEN:-${PERSONAL_TOKEN:-}}"
if [ -z "$TOKEN" ]; then
  echo "❌ ERROR: Set GITHUB_TOKEN or PERSONAL_TOKEN environment variable with repo permissions"
  echo "   Example: GITHUB_TOKEN=ghp_xxx bash scripts/check-github-status.sh"
  echo "   Or: export GITHUB_TOKEN=ghp_xxx && bash scripts/check-github-status.sh"
  exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔍 Iniciando verificação do status do GitHub..."
echo "   Repositório: Gladiston-Porto/GladPros"
echo ""

# Execute the Node.js script
exec node "$SCRIPT_DIR/check-github-status.js"