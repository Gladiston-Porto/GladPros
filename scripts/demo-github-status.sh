#!/usr/bin/env bash
# Demo script showing the GitHub status checker in action
# This demonstrates what the output would look like with a real GitHub token

echo "🚀 Demonstração do GitHub Branches and CI/CD Status Checker"
echo ""
echo "📋 Como usar:"
echo "   1. Configure seu GitHub token:"
echo "      export GITHUB_TOKEN=ghp_seu_token_aqui"
echo ""  
echo "   2. Execute o script:"
echo "      npm run github:status"
echo ""
echo "📊 Exemplo de saída esperada:"
echo "───────────────────────────────────────────────────────"

cat << 'EOF'
🔍 Verificando status do GitHub para GladPros...

════════════════════════════════════════════════════════════
 📋 STATUS DOS BRANCHES
════════════════════════════════════════════════════════════
Total de branches: 15

🌟 Branches Principais:
  🛡️ main (cecc9f8)

🚀 Feature Branches:
  📝 chore/refactor-structure (0451204)
  📝 ci/add-workflow-and-lint-fixes (3f49135)
  ... e mais 2 branches

🤖 Copilot Branches:
  🔧 copilot/fix-2d432e1f-99f4-4bb5-9be9-81795f741ede (e5cf7c8)
  🔧 copilot/fix-8a8e5d9f-c9de-4868-88e7-273648cd855d (5d99098)
  ... e mais 7 branches

📦 Outros Branches:
  📄 wip/propostas-route (a711d38)
  📄 wip/snapshot-before-sync (c52b9c1)

════════════════════════════════════════════════════════════
 ⚙️ WORKFLOWS DE CI/CD
════════════════════════════════════════════════════════════
Total de workflows: 5

🟢 CI
   📁 Arquivo: .github/workflows/ci.yml
   🆔 ID: 184326578
   📊 Estado: active
   🔗 URL: https://github.com/Gladiston-Porto/GladPros/blob/main/.github/workflows/ci.yml
   
   📈 Últimas 5 execuções:
     ✅ #33 chore/refactor-structure - 2h atrás
     ❌ #32 chore/refactor-structure - 2h atrás  
     ❌ #31 main - 2h atrás
     ❌ #30 chore/refactor-structure - 2h atrás
     ❌ #29 chore/refactor-structure - 2h atrás
       🔍 Logs: https://github.com/Gladiston-Porto/GladPros/actions/runs/17283184545

🟢 Build and Test
   📁 Arquivo: .github/workflows/build.yml
   🆔 ID: 184639368
   📊 Estado: active
   🔗 URL: https://github.com/Gladiston-Porto/GladPros/blob/main/.github/workflows/build.yml
   
   📈 Últimas 5 execuções:
     ❌ #3 main - 2h atrás
       🔍 Logs: https://github.com/Gladiston-Porto/GladPros/actions/runs/17283184542
     ❌ #2 chore/refactor-structure - 2h atrás
     ❌ #1 chore/refactor-structure - 3h atrás

════════════════════════════════════════════════════════════
 📋 PULL REQUESTS
════════════════════════════════════════════════════════════
📊 PRs Abertos: 0 | Fechados: 3

✅ PRs Recentes (fechados):
  🔀 merged #3: Chore/refactor structure
     👤 Gladiston-Porto - 2h atrás
  🔀 merged #2: Initial structure refactor
     👤 Gladiston-Porto - 1d atrás  
  🔀 merged #1: Add CI/CD workflows
     👤 Gladiston-Porto - 1d atrás

════════════════════════════════════════════════════════════
 📝 COMMITS RECENTES
════════════════════════════════════════════════════════════
📌 cecc9f8 Merge pull request #3 from Gladiston-Porto/chore/refactor-structure
   👤 Gladiston-Porto - 2h atrás

📌 0451204 fix: resolve TypeScript comparison errors
   👤 Gladiston-Porto - 2h atrás

📌 00d29f1 fix: correct isBuildTime functions to exclude test environment
   👤 Gladiston-Porto - 2h atrás

📌 e0d210e fix: resolve ESLint errors in CI/CD
   👤 Gladiston-Porto - 2h atrás

📌 6d8c38f fix: Add comprehensive build-time protection to API routes
   👤 Gladiston-Porto - 3h atrás

════════════════════════════════════════════════════════════
 📊 RESUMO EXECUTIVO
════════════════════════════════════════════════════════════
📁 Arquivos de workflow locais: 4
   📄 build.yml
   📄 ci.yml
   📄 smoke-e2e.yml
   📄 staging-migrations.yml

✨ Verificação concluída!
EOF

echo "───────────────────────────────────────────────────────"
echo ""
echo "🎯 Principais insights desta saída:"
echo "   ✅ 15 branches organizados por categoria"
echo "   ⚙️  5 workflows ativos sendo monitorados" 
echo "   📊 Histórico de execuções com links diretos para logs de falha"
echo "   🔍 3 PRs recentes merged com sucesso"
echo "   📝 5 commits mais recentes com timestamps relativos"
echo ""
echo "🛠️ Ações recomendadas com base nesta saída:"
echo "   🔧 Investigar falhas do CI no main branch (links fornecidos)"
echo "   🚀 Considerar merge dos feature branches ativos"  
echo "   📋 Revisar logs das execuções falhadas para correções"
echo ""
echo "📚 Para mais detalhes, consulte: scripts/README-github-status.md"