#!/usr/bin/env node
// Verifica o status dos branches e checks do GitHub Actions
// Uso:
//   GITHUB_TOKEN=ghp_xxx node scripts/check-github-status.js

const https = require('https');

const OWNER = 'Gladiston-Porto';
const REPO = 'GladPros';

// Configuração de cores
const colors = {
  red: '\033[0;31m',
  green: '\033[0;32m',
  yellow: '\033[1;33m',
  blue: '\033[0;34m',
  nc: '\033[0m' // No Color
};

function colorText(text, color) {
  return `${color}${text}${colors.nc}`;
}

function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'success':
    case 'completed':
      return colors.green;
    case 'failure':
    case 'failed':
    case 'error':
      return colors.red;
    case 'pending':
    case 'in_progress':
    case 'queued':
      return colors.yellow;
    default:
      return colors.nc;
  }
}

function formatTime(timestamp) {
  if (!timestamp || timestamp === 'null') return 'N/A';
  try {
    return new Date(timestamp).toLocaleString('pt-BR');
  } catch {
    return timestamp;
  }
}

// Função para fazer chamadas à API do GitHub
function githubApi(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}${endpoint}`,
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'GladPros-StatusChecker'
      }
    };

    const req = https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Verificar token
const token = process.env.GITHUB_TOKEN || process.env.PERSONAL_TOKEN;
if (!token) {
  console.log(colorText('ERROR: defina GITHUB_TOKEN ou PERSONAL_TOKEN environment variable com permissão repo:status', colors.red));
  console.log('Exemplo: GITHUB_TOKEN=ghp_xxx node scripts/check-github-status.js');
  process.exit(1);
}

async function main() {
  console.log(colorText(`🔍 Verificando status dos branches e CI/CD do repositório ${OWNER}/${REPO}...`, colors.blue));
  console.log();

  try {
    // Status dos Branches
    console.log(colorText('📋 Status dos Branches:', colors.blue));
    console.log('==================================');

    const branches = await githubApi('/branches');
    if (Array.isArray(branches)) {
      const mainBranches = branches.filter(b => ['main', 'master', 'develop', 'staging'].includes(b.name));
      mainBranches.forEach(branch => {
        const protectedStatus = branch.protected ? '🔒 Protected' : '🔓 Open';
        const commitSha = branch.commit.sha.substring(0, 7);
        const commitDate = formatTime(branch.commit.commit.author.date);
        console.log(`  ${colorText(branch.name, colors.green)} - ${protectedStatus} - Commit: ${commitSha} - ${commitDate}`);
      });
    } else {
      console.log(colorText('  ❌ Erro ao obter informações dos branches', colors.red));
    }

    console.log();
    
    // GitHub Actions Workflows
    console.log(colorText('🏃 GitHub Actions Workflows:', colors.blue));
    console.log('==================================');

    const workflows = await githubApi('/actions/workflows');
    if (workflows.workflows && Array.isArray(workflows.workflows)) {
      for (const workflow of workflows.workflows) {
        const stateColor = getStatusColor(workflow.state);
        console.log(`  ${colorText(workflow.name, stateColor)} - Status: ${colorText(workflow.state, stateColor)}`);
        
        // Obter runs recentes
        try {
          const runs = await githubApi(`/actions/workflows/${workflow.id}/runs?per_page=3`);
          if (runs.workflow_runs && Array.isArray(runs.workflow_runs)) {
            runs.workflow_runs.slice(0, 3).forEach(run => {
              const runStatus = run.conclusion || run.status;
              const statusColor = getStatusColor(runStatus);
              const runDate = formatTime(run.created_at);
              console.log(`    └─ ${colorText(runStatus, statusColor)} - Branch: ${run.head_branch} - ${runDate}`);
            });
          }
        } catch (e) {
          console.log(`    └─ ${colorText('Erro ao obter runs', colors.red)}`);
        }
        console.log();
      }
    } else {
      console.log(colorText('  ❌ Erro ao obter informações dos workflows', colors.red));
    }

    // Resumo de Status Checks
    console.log(colorText('📊 Resumo de Status Checks:', colors.blue));
    console.log('==================================');

    const mainBranch = 'main';
    try {
      const statusChecks = await githubApi(`/commits/${mainBranch}/status`);
      
      if (statusChecks.state) {
        const overallState = statusChecks.state;
        const totalCount = statusChecks.total_count || 0;
        const stateColor = getStatusColor(overallState);
        
        console.log(`  Branch ${mainBranch}: ${colorText(overallState, stateColor)} (${totalCount} checks)`);
        
        if (totalCount > 0 && statusChecks.statuses) {
          statusChecks.statuses.forEach(status => {
            const statusColor = getStatusColor(status.state);
            console.log(`    └─ ${status.context}: ${colorText(status.state, statusColor)} - ${status.description}`);
          });
        }
      } else {
        console.log(colorText(`  ⚠️  Nenhum status check encontrado para o branch ${mainBranch}`, colors.yellow));
      }
    } catch (e) {
      console.log(colorText(`  ❌ Erro ao obter status checks: ${e.message}`, colors.red));
    }

    console.log();

    // Runs Recentes
    console.log(colorText('🚀 Runs Recentes (últimas 10):', colors.blue));
    console.log('==================================');

    const recentRuns = await githubApi('/actions/runs?per_page=10');
    if (recentRuns.workflow_runs && Array.isArray(recentRuns.workflow_runs)) {
      recentRuns.workflow_runs.forEach(run => {
        const runStatus = run.conclusion || run.status;
        const statusColor = getStatusColor(runStatus);
        const runDate = formatTime(run.created_at);
        console.log(`  ${colorText(runStatus, statusColor)} - ${run.name} (${run.head_branch}) - ${runDate}`);
      });
    } else {
      console.log(colorText('  ❌ Erro ao obter runs recentes', colors.red));
    }

    console.log();

    // Artefatos
    console.log(colorText('💾 Artefatos Disponíveis:', colors.blue));
    console.log('==================================');

    const artifacts = await githubApi('/actions/artifacts?per_page=10');
    if (artifacts.artifacts && Array.isArray(artifacts.artifacts) && artifacts.total_count > 0) {
      artifacts.artifacts.forEach(artifact => {
        const sizeMB = Math.round(artifact.size_in_bytes / (1024 * 1024));
        const artifactDate = formatTime(artifact.created_at);
        const expiredStatus = artifact.expired 
          ? colorText('(Expirado)', colors.red)
          : colorText('(Ativo)', colors.green);
        console.log(`  📦 ${artifact.name} - ${sizeMB}MB - ${artifactDate} ${expiredStatus}`);
      });
    } else {
      console.log(colorText('  ⚠️  Nenhum artefato encontrado', colors.yellow));
    }

    console.log();
    console.log(colorText('✅ Verificação concluída!', colors.green));
    console.log();
    console.log(colorText('💡 Dicas:', colors.blue));
    console.log(`  • Para mais detalhes, acesse: https://github.com/${OWNER}/${REPO}/actions`);
    console.log('  • Para reexecutar workflows falhos, use a interface web do GitHub');
    console.log('  • Verifique logs específicos clicando nos runs individuais');

  } catch (error) {
    console.error(colorText(`❌ Erro: ${error.message}`, colors.red));
    process.exit(1);
  }
}

main();