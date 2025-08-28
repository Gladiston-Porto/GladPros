#!/usr/bin/env node
// Demo script para mostrar o output esperado dos scripts de status do GitHub
// Este script simula a saída sem fazer chamadas reais à API

const colors = {
  red: '\x1b[0;31m',
  green: '\x1b[0;32m',
  yellow: '\x1b[1;33m',
  blue: '\x1b[0;34m',
  nc: '\x1b[0m'
};

function colorText(text, color) {
  return `${color}${text}${colors.nc}`;
}

console.log(colorText('🔍 Verificando status dos branches e CI/CD do repositório Gladiston-Porto/GladPros...', colors.blue));
console.log();

console.log(colorText('📋 Status dos Branches:', colors.blue));
console.log('==================================');
console.log(`  ${colorText('main', colors.green)} - 🔒 Protected - Commit: cc6107b - 28/08/2024 10:30:45`);
console.log(`  ${colorText('copilot/fix-934b3156-8a24-4612-beee-9cbc096014ac', colors.green)} - 🔓 Open - Commit: e29ce81 - 28/08/2024 01:47:32`);
console.log();

console.log(colorText('🏃 GitHub Actions Workflows:', colors.blue));
console.log('==================================');
console.log(`  ${colorText('CI', colors.green)} - Status: ${colorText('active', colors.green)}`);
console.log(`    └─ ${colorText('success', colors.green)} - Branch: main - 28/08/2024 10:35:20`);
console.log(`    └─ ${colorText('success', colors.green)} - Branch: copilot/fix-934b3156-8a24-4612-beee-9cbc096014ac - 28/08/2024 01:50:15`);
console.log();

console.log(`  ${colorText('Build', colors.green)} - Status: ${colorText('active', colors.green)}`);
console.log(`    └─ ${colorText('success', colors.green)} - Branch: main - 28/08/2024 10:33:15`);
console.log();

console.log(`  ${colorText('Smoke E2E', colors.green)} - Status: ${colorText('active', colors.green)}`);
console.log(`    └─ ${colorText('success', colors.green)} - Branch: main - 28/08/2024 09:15:30`);
console.log();

console.log(`  ${colorText('GitHub Status Check', colors.green)} - Status: ${colorText('active', colors.green)}`);
console.log(`    └─ ${colorText('pending', colors.yellow)} - Branch: copilot/fix-934b3156-8a24-4612-beee-9cbc096014ac - 28/08/2024 01:50:00`);
console.log();

console.log(colorText('📊 Resumo de Status Checks:', colors.blue));
console.log('==================================');
console.log(`  Branch main: ${colorText('success', colors.green)} (3 checks)`);
console.log(`    └─ ci/github-actions: ${colorText('success', colors.green)} - Build and test completed successfully`);
console.log(`    └─ continuous-integration: ${colorText('success', colors.green)} - All checks passed`);
console.log(`    └─ security/code-scanning: ${colorText('success', colors.green)} - No security issues found`);
console.log();

console.log(colorText('🚀 Runs Recentes (últimas 10):', colors.blue));
console.log('==================================');
console.log(`  ${colorText('success', colors.green)} - CI (copilot/fix-934b3156-8a24-4612-beee-9cbc096014ac) - 28/08/2024 01:50:15`);
console.log(`  ${colorText('success', colors.green)} - CI (main) - 28/08/2024 10:35:20`);
console.log(`  ${colorText('success', colors.green)} - Build (main) - 28/08/2024 10:33:15`);
console.log(`  ${colorText('success', colors.green)} - Smoke E2E (main) - 28/08/2024 09:15:30`);
console.log(`  ${colorText('in_progress', colors.yellow)} - GitHub Status Check (copilot/fix-934b3156-8a24-4612-beee-9cbc096014ac) - 28/08/2024 01:50:00`);
console.log(`  ${colorText('success', colors.green)} - CI (main) - 27/08/2024 15:25:10`);
console.log(`  ${colorText('success', colors.green)} - Build (main) - 27/08/2024 15:23:45`);
console.log(`  ${colorText('failure', colors.red)} - CI (feature/old-branch) - 26/08/2024 09:12:30`);
console.log(`  ${colorText('success', colors.green)} - Smoke E2E (main) - 25/08/2024 14:20:15`);
console.log(`  ${colorText('success', colors.green)} - CI (main) - 25/08/2024 14:18:00`);
console.log();

console.log(colorText('💾 Artefatos Disponíveis:', colors.blue));
console.log('==================================');
console.log(`  📦 build-artifacts - 15MB - 28/08/2024 10:35:20 ${colorText('(Ativo)', colors.green)}`);
console.log(`  📦 test-coverage - 2MB - 28/08/2024 10:35:20 ${colorText('(Ativo)', colors.green)}`);
console.log(`  📦 github-status-report - 1MB - 28/08/2024 01:50:00 ${colorText('(Ativo)', colors.green)}`);
console.log(`  📦 eslint-report - 1MB - 27/08/2024 15:25:10 ${colorText('(Ativo)', colors.green)}`);
console.log();

console.log(colorText('✅ Verificação concluída!', colors.green));
console.log();
console.log(colorText('💡 Dicas:', colors.blue));
console.log('  • Para mais detalhes, acesse: https://github.com/Gladiston-Porto/GladPros/actions');
console.log('  • Para reexecutar workflows falhos, use a interface web do GitHub');
console.log('  • Verifique logs específicos clicando nos runs individuais');