#!/usr/bin/env bash
set -euo pipefail

# Creates a Pull Request on GitHub using the REST API.
# Usage:
#   GITHUB_TOKEN=ghp_xxx bash scripts/create-pr.sh
# or set PERSONAL_TOKEN env var

OWNER="Gladiston-Porto"
REPO="GladPros"
HEAD_BRANCH="chore/refactor-structure"
BASE_BRANCH="main"
TITLE="chore: refactor + fix TypeScript/ESLint issues, add CI and smoke workflows"

read -r -d '' BODY <<'PRBODY'
Resumo
- Corrige vários avisos do ESLint e erros de tipagem TypeScript.
- Ajusta helpers e rotas (foco em clientes/propostas) para serem mais robustos a mocks de teste.
- Move declaração de tipos de testes (`jest-dom.d.ts`) para `src/types` para evitar descoberta como suíte de teste.
- Adiciona CI: `.github/workflows/ci.yml` (lint → tsc → tests → build).
- Adiciona workflows manuais: `staging-migrations.yml` e `smoke-e2e.yml`.
- Adiciona `scripts/smoke-test.sh` e `PULL_REQUEST_TEMPLATE.md`.

Checklist
- ESLint: passou (no warnings)
- TypeScript: passou (npx tsc --noEmit)
- Testes unitários: passaram (npm test)
- Build: npm run build
PRBODY

TOKEN="${GITHUB_TOKEN:-${PERSONAL_TOKEN:-}}"
if [ -z "$TOKEN" ]; then
  echo "ERROR: set GITHUB_TOKEN or PERSONAL_TOKEN environment variable with repo:status permission"
  echo "Example: GITHUB_TOKEN=ghp_xxx bash scripts/create-pr.sh"
  exit 1
fi

API_URL="https://api.github.com/repos/${OWNER}/${REPO}/pulls"

echo "Creating PR ${HEAD_BRANCH} -> ${BASE_BRANCH} on ${OWNER}/${REPO}..."

resp=$(curl -sS -X POST "$API_URL" \
  -H "Authorization: token ${TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  -d @- <<EOF
{ "title": "${TITLE}", "head": "${HEAD_BRANCH}", "base": "${BASE_BRANCH}", "body": $(jq -Rs '.' <<<"${BODY}") }
EOF
)

html_url=$(echo "$resp" | jq -r .html_url // empty)
if [ -n "$html_url" ] && [ "$html_url" != "null" ]; then
  echo "PR criado: $html_url"
  exit 0
fi

echo "Erro ao criar PR. Resposta da API:" >&2
echo "$resp" >&2
exit 2
