#!/usr/bin/env node

/**
 * Script para verificar status dos branches e CI/CD do GitHub
 * 
 * Usage:
 *   GITHUB_TOKEN=ghp_xxx node scripts/check-github-status.js
 * 
 * Features:
 * - Lista todos os branches do repositório
 * - Verifica status dos workflows do GitHub Actions
 * - Mostra status dos checks para cada branch
 * - Exibe output colorido para melhor visualização
 */

const https = require('https');

// Configurações do repositório
const OWNER = 'Gladiston-Porto';
const REPO = 'GladPros';

// Cores para output colorido
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

// Função para fazer requisições para a API do GitHub
function githubRequest(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'GladPros-Status-Checker',
        'Accept': 'application/vnd.github+json',
        'Authorization': `token ${token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`GitHub API error: ${res.statusCode} - ${response.message || data}`));
          }
        } catch (error) {
          reject(new Error(`JSON parse error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Função para formatar status com cores
function formatStatus(status) {
  switch (status) {
    case 'success':
      return `${colors.green}✅ SUCCESS${colors.reset}`;
    case 'failure':
      return `${colors.red}❌ FAILURE${colors.reset}`;
    case 'pending':
      return `${colors.yellow}⏳ PENDING${colors.reset}`;
    case 'in_progress':
      return `${colors.blue}🔄 IN PROGRESS${colors.reset}`;
    case 'completed':
      return `${colors.green}✅ COMPLETED${colors.reset}`;
    case 'cancelled':
      return `${colors.yellow}⚠️ CANCELLED${colors.reset}`;
    case 'queued':
      return `${colors.cyan}📋 QUEUED${colors.reset}`;
    case 'requested':
      return `${colors.cyan}📋 REQUESTED${colors.reset}`;
    case 'waiting':
      return `${colors.blue}⏰ WAITING${colors.reset}`;
    default:
      return `${colors.dim}❓ ${status?.toUpperCase() || 'UNKNOWN'}${colors.reset}`;
  }
}

// Função para formatar tempo relativo
function formatTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'agora mesmo';
  if (diffMins < 60) return `${diffMins}m atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  return `${diffDays}d atrás`;
}

// Função principal
async function checkGitHubStatus() {
  const token = process.env.GITHUB_TOKEN || process.env.PERSONAL_TOKEN;
  
  if (!token) {
    console.error(`${colors.red}❌ ERRO: Defina GITHUB_TOKEN ou PERSONAL_TOKEN com permissões de repo${colors.reset}`);
    console.error(`${colors.dim}Exemplo: GITHUB_TOKEN=ghp_xxx node scripts/check-github-status.js${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.bold}${colors.cyan}🔍 Verificando status do GitHub para ${OWNER}/${REPO}${colors.reset}\n`);

  try {
    // 1. Buscar branches
    console.log(`${colors.bold}📋 BRANCHES:${colors.reset}`);
    const branches = await githubRequest(`/repos/${OWNER}/${REPO}/branches?per_page=50`, token);
    
    const branchPromises = branches.map(async (branch) => {
      const branchName = branch.name;
      const sha = branch.commit.sha;
      
      try {
        // Buscar status do commit (checks)
        const [checkRuns, statuses] = await Promise.all([
          githubRequest(`/repos/${OWNER}/${REPO}/commits/${sha}/check-runs`, token).catch(() => ({ check_runs: [] })),
          githubRequest(`/repos/${OWNER}/${REPO}/commits/${sha}/status`, token).catch(() => ({ statuses: [] }))
        ]);

        // Buscar workflows runs recentes para este branch
        const workflowRuns = await githubRequest(
          `/repos/${OWNER}/${REPO}/actions/runs?branch=${encodeURIComponent(branchName)}&per_page=10`,
          token
        ).catch(() => ({ workflow_runs: [] }));

        return {
          name: branchName,
          sha: sha.substring(0, 7),
          checkRuns: checkRuns.check_runs || [],
          statuses: statuses.statuses || [],
          workflowRuns: workflowRuns.workflow_runs || []
        };
      } catch (error) {
        return {
          name: branchName,
          sha: sha.substring(0, 7),
          error: error.message,
          checkRuns: [],
          statuses: [],
          workflowRuns: []
        };
      }
    });

    const branchDetails = await Promise.all(branchPromises);

    // Exibir informações dos branches
    branchDetails.forEach(branch => {
      console.log(`\n${colors.bold}${colors.blue}📌 ${branch.name}${colors.reset} ${colors.dim}(${branch.sha})${colors.reset}`);
      
      if (branch.error) {
        console.log(`   ${colors.red}❌ Erro: ${branch.error}${colors.reset}`);
        return;
      }

      // Workflow runs
      if (branch.workflowRuns.length > 0) {
        console.log(`   ${colors.bold}🔧 Workflows Recentes:${colors.reset}`);
        branch.workflowRuns.slice(0, 3).forEach(run => {
          const conclusion = run.conclusion || run.status;
          const status = formatStatus(conclusion);
          const timeAgo = formatTimeAgo(run.created_at);
          console.log(`      ${status} ${run.name} - ${timeAgo}`);
        });
      }

      // Check runs (GitHub Actions)
      if (branch.checkRuns.length > 0) {
        console.log(`   ${colors.bold}✓ Check Runs:${colors.reset}`);
        branch.checkRuns.forEach(check => {
          const conclusion = check.conclusion || check.status;
          const status = formatStatus(conclusion);
          console.log(`      ${status} ${check.name}`);
        });
      }

      // Status checks (external)
      if (branch.statuses.length > 0) {
        console.log(`   ${colors.bold}🔍 Status Checks:${colors.reset}`);
        branch.statuses.slice(0, 3).forEach(status => {
          const statusFormatted = formatStatus(status.state);
          console.log(`      ${statusFormatted} ${status.context} - ${status.description || 'No description'}`);
        });
      }

      // Se não houver checks/workflows
      if (branch.workflowRuns.length === 0 && branch.checkRuns.length === 0 && branch.statuses.length === 0) {
        console.log(`   ${colors.dim}📝 Nenhum workflow ou check encontrado${colors.reset}`);
      }
    });

    // 2. Resumo geral dos workflows
    console.log(`\n${colors.bold}${colors.magenta}🏗️ RESUMO DOS WORKFLOWS:${colors.reset}`);
    
    const workflows = await githubRequest(`/repos/${OWNER}/${REPO}/actions/workflows`, token);
    
    for (const workflow of workflows.workflows) {
      const runs = await githubRequest(
        `/repos/${OWNER}/${REPO}/actions/workflows/${workflow.id}/runs?per_page=5`,
        token
      ).catch(() => ({ workflow_runs: [] }));
      
      console.log(`\n${colors.bold}⚙️ ${workflow.name}${colors.reset}`);
      console.log(`   Estado: ${workflow.state === 'active' ? `${colors.green}Ativo${colors.reset}` : `${colors.yellow}Inativo${colors.reset}`}`);
      
      if (runs.workflow_runs && runs.workflow_runs.length > 0) {
        console.log(`   ${colors.bold}Execuções Recentes:${colors.reset}`);
        runs.workflow_runs.slice(0, 3).forEach(run => {
          const conclusion = run.conclusion || run.status;
          const status = formatStatus(conclusion);
          const timeAgo = formatTimeAgo(run.created_at);
          const branch = run.head_branch || 'unknown';
          console.log(`      ${status} ${branch} - ${timeAgo}`);
        });
      } else {
        console.log(`   ${colors.dim}📝 Nenhuma execução encontrada${colors.reset}`);
      }
    }

    console.log(`\n${colors.bold}${colors.green}✅ Verificação concluída com sucesso!${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}❌ Erro durante a verificação:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  checkGitHubStatus();
}

module.exports = { checkGitHubStatus };