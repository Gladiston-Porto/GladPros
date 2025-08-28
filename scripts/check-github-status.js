#!/usr/bin/env node
// scripts/check-github-status.js
// Verificar o status dos branches e checks do GitHub Actions

const https = require('https');
const { execSync } = require('child_process');

const OWNER = 'Gladiston-Porto';
const REPO = 'GladPros';
const API_BASE = 'https://api.github.com/repos';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const token = process.env.GITHUB_TOKEN || process.env.PERSONAL_TOKEN;
    
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'GladPros-Status-Checker',
        'Accept': 'application/vnd.github+json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `token ${token}`;
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`GitHub API Error ${res.statusCode}: ${parsed.message || 'Unknown error'}`));
          } else {
            resolve(parsed);
          }
        } catch (error) {
          reject(new Error(`JSON parsing error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request error: ${error.message}`));
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { 
      encoding: 'utf8',
      cwd: process.cwd()
    }).trim();
  } catch (error) {
    return 'unknown';
  }
}

async function getRemoteBranches() {
  try {
    console.log(colorize('🌿 Buscando branches do repositório...', 'cyan'));
    const branches = await makeRequest(`/repos/${OWNER}/${REPO}/branches`);
    
    console.log(colorize('\n📋 Branches disponíveis:', 'bright'));
    branches.forEach(branch => {
      const isProtected = branch.protected ? colorize(' (protegido)', 'yellow') : '';
      console.log(`  • ${colorize(branch.name, 'green')}${isProtected}`);
    });

    return branches;
  } catch (error) {
    console.error(colorize(`❌ Erro ao buscar branches: ${error.message}`, 'red'));
    return [];
  }
}

async function getWorkflowRuns() {
  try {
    console.log(colorize('\n🔄 Verificando status dos workflows...', 'cyan'));
    
    // Get workflow runs for the repository
    const runs = await makeRequest(`/repos/${OWNER}/${REPO}/actions/runs?per_page=10`);
    
    if (!runs.workflow_runs || runs.workflow_runs.length === 0) {
      console.log(colorize('  ℹ️  Nenhum workflow encontrado', 'yellow'));
      return [];
    }

    console.log(colorize('\n🚀 Status dos workflows recentes:', 'bright'));
    
    const statusIcons = {
      success: '✅',
      failure: '❌',
      in_progress: '🔄',
      queued: '⏳',
      cancelled: '⚠️',
      completed: '✅'
    };

    runs.workflow_runs.slice(0, 10).forEach(run => {
      const status = run.conclusion || run.status;
      const icon = statusIcons[status] || '❓';
      const color = status === 'success' ? 'green' : 
                   status === 'failure' ? 'red' : 
                   status === 'in_progress' ? 'yellow' : 'blue';
      
      console.log(
        `  ${icon} ${colorize(run.name, 'bright')} - ${colorize(status.toUpperCase(), color)}\n` +
        `     Branch: ${colorize(run.head_branch, 'cyan')} | ` +
        `Commit: ${run.head_sha.substring(0, 7)} | ` +
        `${formatDate(run.created_at)}`
      );
    });

    return runs.workflow_runs;
  } catch (error) {
    console.error(colorize(`❌ Erro ao verificar workflows: ${error.message}`, 'red'));
    return [];
  }
}

async function getWorkflowsStatus() {
  try {
    console.log(colorize('\n⚙️  Verificando workflows configurados...', 'cyan'));
    
    const workflows = await makeRequest(`/repos/${OWNER}/${REPO}/actions/workflows`);
    
    if (!workflows.workflows || workflows.workflows.length === 0) {
      console.log(colorize('  ℹ️  Nenhum workflow configurado', 'yellow'));
      return [];
    }

    console.log(colorize('\n📋 Workflows configurados:', 'bright'));
    
    for (const workflow of workflows.workflows) {
      const state = workflow.state === 'active' ? 
        colorize('ATIVO', 'green') : 
        colorize('INATIVO', 'red');
      
      console.log(`  • ${colorize(workflow.name, 'bright')} (${workflow.path}) - ${state}`);
    }

    return workflows.workflows;
  } catch (error) {
    console.error(colorize(`❌ Erro ao verificar workflows: ${error.message}`, 'red'));
    return [];
  }
}

async function getCommitStatus() {
  try {
    const currentBranch = await getCurrentBranch();
    console.log(colorize(`\n🔍 Verificando status do branch atual: ${currentBranch}`, 'cyan'));
    
    // Get latest commit on current branch
    const commits = await makeRequest(`/repos/${OWNER}/${REPO}/commits?sha=${currentBranch}&per_page=1`);
    
    if (!commits || commits.length === 0) {
      console.log(colorize('  ℹ️  Nenhum commit encontrado', 'yellow'));
      return null;
    }

    const latestCommit = commits[0];
    console.log(colorize('\n📊 Status do último commit:', 'bright'));
    console.log(`  Commit: ${latestCommit.sha.substring(0, 7)} - ${latestCommit.commit.message.split('\n')[0]}`);
    console.log(`  Autor: ${latestCommit.commit.author.name}`);
    console.log(`  Data: ${formatDate(latestCommit.commit.author.date)}`);

    // Get commit status/checks
    const status = await makeRequest(`/repos/${OWNER}/${REPO}/commits/${latestCommit.sha}/status`);
    
    if (status) {
      const stateColor = status.state === 'success' ? 'green' : 
                        status.state === 'failure' ? 'red' : 
                        status.state === 'pending' ? 'yellow' : 'blue';
      
      console.log(`  Status: ${colorize(status.state.toUpperCase(), stateColor)}`);
      
      if (status.statuses && status.statuses.length > 0) {
        console.log(colorize('  📋 Checks:', 'bright'));
        status.statuses.forEach(check => {
          const checkColor = check.state === 'success' ? 'green' : 
                           check.state === 'failure' ? 'red' : 'yellow';
          const icon = check.state === 'success' ? '✅' : 
                      check.state === 'failure' ? '❌' : '🔄';
          
          console.log(`    ${icon} ${check.context}: ${colorize(check.state.toUpperCase(), checkColor)}`);
          if (check.description) {
            console.log(`       ${check.description}`);
          }
        });
      }
    }

    return latestCommit;
  } catch (error) {
    console.error(colorize(`❌ Erro ao verificar status do commit: ${error.message}`, 'red'));
    return null;
  }
}

async function main() {
  console.log(colorize('🚀 GladPros - Verificação de Status do GitHub', 'bright'));
  console.log(colorize('=' .repeat(50), 'blue'));

  const token = process.env.GITHUB_TOKEN || process.env.PERSONAL_TOKEN;
  if (!token) {
    console.log(colorize('\n⚠️  AVISO: GITHUB_TOKEN não configurado. Algumas funcionalidades podem ter limitação de rate limit.', 'yellow'));
    console.log(colorize('   Configure: export GITHUB_TOKEN=ghp_xxx', 'yellow'));
  }

  let apiAccessible = true;
  
  try {
    // Test API access first
    await makeRequest(`/repos/${OWNER}/${REPO}`);
  } catch (error) {
    if (error.message.includes('JSON parsing error') || error.message.includes('Blocked by') || error.message.includes('rate limit')) {
      console.log(colorize('\n⚠️  API do GitHub não está acessível. Usando verificação local...', 'yellow'));
      console.log(colorize('   Para acesso completo, configure um GITHUB_TOKEN válido.', 'yellow'));
      apiAccessible = false;
    }
  }

  try {
    // Check repository info
    console.log(colorize(`\n📦 Repositório: ${OWNER}/${REPO}`, 'bright'));
    
    const currentBranch = await getCurrentBranch();
    console.log(colorize(`🌿 Branch local atual: ${currentBranch}`, 'bright'));

    if (apiAccessible) {
      // Get all information from GitHub API
      await getRemoteBranches();
      await getWorkflowsStatus();
      await getWorkflowRuns();
      await getCommitStatus();
    } else {
      // Fallback to local git information
      const localChecker = require('./check-local-git-status.js');
      console.log(colorize('\n📋 Usando informações locais do git:', 'cyan'));
      localChecker.checkLocalGitStatus();
    }

    console.log(colorize('\n✅ Verificação concluída!', 'green'));
    console.log(colorize('=' .repeat(50), 'blue'));

  } catch (error) {
    console.error(colorize(`\n❌ Erro geral: ${error.message}`, 'red'));
    process.exit(1);
  }
}

// Handle command line execution
if (require.main === module) {
  main().catch(error => {
    console.error(colorize(`Erro fatal: ${error.message}`, 'red'));
    process.exit(1);
  });
}

module.exports = {
  makeRequest,
  getRemoteBranches,
  getWorkflowRuns,
  getWorkflowsStatus,
  getCommitStatus
};