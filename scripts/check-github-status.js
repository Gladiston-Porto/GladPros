#!/usr/bin/env node
/**
 * GitHub Branches and CI/CD Status Checker for GladPros
 * 
 * Este script verifica o status dos branches e workflows de CI/CD do GitHub
 * Requer uma variável de ambiente GITHUB_TOKEN para acessar a API do GitHub
 * 
 * Usage: 
 *   GITHUB_TOKEN=ghp_xxx node scripts/check-github-status.js
 *   npm run github:status
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuração
const REPO_OWNER = 'Gladiston-Porto';
const REPO_NAME = 'GladPros';
const GITHUB_API_BASE = 'https://api.github.com';

// Emojis para status
const STATUS_ICONS = {
  success: '✅',
  failure: '❌',  
  pending: '🟡',
  neutral: '⚪',
  cancelled: '⚫',
  in_progress: '🔄',
  queued: '⏳',
  unknown: '❓'
};

// Cores ANSI
const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

function log(message, color = '') {
  console.log(`${color}${message}${COLORS.reset}`);
}

function logSection(title) {
  console.log('\n' + COLORS.bold + COLORS.cyan + '═'.repeat(60) + COLORS.reset);
  console.log(COLORS.bold + COLORS.cyan + ` ${title}` + COLORS.reset);
  console.log(COLORS.bold + COLORS.cyan + '═'.repeat(60) + COLORS.reset);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);  
  const days = Math.floor(hours / 24);
  
  if (minutes < 1) return 'agora mesmo';
  if (minutes < 60) return `${minutes}m atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days < 7) return `${days}d atrás`;
  
  return date.toLocaleDateString('pt-BR');
}

async function makeGitHubRequest(endpoint) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN não configurado. Execute: export GITHUB_TOKEN=ghp_xxx');
  }
  
  const url = `${GITHUB_API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'GladPros-Status-Checker'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Erro ao acessar GitHub API: ${error.message}`);
  }
}

async function checkBranches() {
  logSection('📋 STATUS DOS BRANCHES');
  
  try {
    const branches = await makeGitHubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/branches`);
    
    log(`Total de branches: ${COLORS.bold}${branches.length}${COLORS.reset}`);
    console.log();
    
    // Categorizar branches
    const mainBranches = branches.filter(b => ['main', 'master', 'develop'].includes(b.name));
    const featureBranches = branches.filter(b => 
      b.name.startsWith('feature/') || 
      b.name.startsWith('chore/') ||
      b.name.startsWith('fix/') ||
      b.name.startsWith('feat/')
    );
    const copilotBranches = branches.filter(b => b.name.startsWith('copilot/'));
    const otherBranches = branches.filter(b => 
      !mainBranches.includes(b) && 
      !featureBranches.includes(b) && 
      !copilotBranches.includes(b)
    );
    
    // Branch principal
    if (mainBranches.length > 0) {
      log('🌟 Branches Principais:', COLORS.bold + COLORS.green);
      for (const branch of mainBranches) {
        const protection = branch.protected ? '🛡️' : '🔓';
        log(`  ${protection} ${COLORS.bold}${branch.name}${COLORS.reset} (${branch.commit.sha.substring(0, 7)})`);
      }
    }
    
    // Feature branches  
    if (featureBranches.length > 0) {
      log('\n🚀 Feature Branches:', COLORS.bold + COLORS.blue);
      for (const branch of featureBranches.slice(0, 10)) { // Top 10
        log(`  📝 ${branch.name} (${branch.commit.sha.substring(0, 7)})`);
      }
      if (featureBranches.length > 10) {
        log(`  ${COLORS.dim}... e mais ${featureBranches.length - 10} branches${COLORS.reset}`);
      }
    }
    
    // Copilot branches
    if (copilotBranches.length > 0) {
      log('\n🤖 Copilot Branches:', COLORS.bold + COLORS.magenta);
      for (const branch of copilotBranches.slice(0, 5)) { // Top 5
        log(`  🔧 ${branch.name} (${branch.commit.sha.substring(0, 7)})`);
      }
      if (copilotBranches.length > 5) {
        log(`  ${COLORS.dim}... e mais ${copilotBranches.length - 5} branches${COLORS.reset}`);
      }
    }
    
    // Outros branches
    if (otherBranches.length > 0) {
      log('\n📦 Outros Branches:', COLORS.bold + COLORS.yellow);
      for (const branch of otherBranches) {
        log(`  📄 ${branch.name} (${branch.commit.sha.substring(0, 7)})`);
      }
    }
    
  } catch (error) {
    log(`❌ Erro ao verificar branches: ${error.message}`, COLORS.red);
  }
}

async function checkWorkflows() {
  logSection('⚙️ WORKFLOWS DE CI/CD');
  
  try {
    const workflows = await makeGitHubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows`);
    
    log(`Total de workflows: ${COLORS.bold}${workflows.total_count}${COLORS.reset}`);
    console.log();
    
    for (const workflow of workflows.workflows) {
      const state = workflow.state === 'active' ? '🟢' : '🔴';
      log(`${state} ${COLORS.bold}${workflow.name}${COLORS.reset}`);
      log(`   📁 Arquivo: ${workflow.path}`);
      log(`   🆔 ID: ${workflow.id}`);
      log(`   📊 Estado: ${workflow.state}`);
      log(`   🔗 URL: ${workflow.html_url}`);
      console.log();
      
      // Verificar execuções recentes para cada workflow
      await checkWorkflowRuns(workflow.id, workflow.name);
    }
    
  } catch (error) {
    log(`❌ Erro ao verificar workflows: ${error.message}`, COLORS.red);
  }
}

async function checkWorkflowRuns(workflowId, workflowName) {
  try {
    const runs = await makeGitHubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${workflowId}/runs?per_page=5`);
    
    if (runs.workflow_runs && runs.workflow_runs.length > 0) {
      log(`   📈 Últimas 5 execuções:`, COLORS.dim);
      
      for (const run of runs.workflow_runs) {
        const status = STATUS_ICONS[run.conclusion] || STATUS_ICONS[run.status] || STATUS_ICONS.unknown;
        const branch = run.head_branch || 'unknown';
        const time = formatDate(run.created_at);
        
        log(`     ${status} #${run.run_number} ${branch} - ${time}`);
        
        if (run.conclusion === 'failure') {
          log(`       🔍 Logs: ${run.html_url}`, COLORS.dim);
        }
      }
      console.log();
    }
  } catch (error) {
    log(`     ⚠️  Não foi possível carregar execuções: ${error.message}`, COLORS.dim);
  }
}

async function checkPullRequests() {
  logSection('📋 PULL REQUESTS');
  
  try {
    const prs = await makeGitHubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=all&per_page=10`);
    
    if (prs.length === 0) {
      log('Nenhum Pull Request encontrado');
      return;
    }
    
    const openPRs = prs.filter(pr => pr.state === 'open');
    const closedPRs = prs.filter(pr => pr.state === 'closed');
    
    log(`📊 PRs Abertos: ${COLORS.green}${openPRs.length}${COLORS.reset} | Fechados: ${COLORS.blue}${closedPRs.length}${COLORS.reset}`);
    console.log();
    
    if (openPRs.length > 0) {
      log('🔓 PRs Abertos:', COLORS.bold + COLORS.green);
      for (const pr of openPRs) {
        log(`  📝 #${pr.number}: ${pr.title}`);
        log(`     🌿 ${pr.head.ref} → ${pr.base.ref}`);
        log(`     👤 ${pr.user.login} - ${formatDate(pr.created_at)}`);
        console.log();
      }
    }
    
    if (closedPRs.length > 0) {
      log('✅ PRs Recentes (fechados):', COLORS.bold + COLORS.blue);
      for (const pr of closedPRs.slice(0, 3)) {
        const merged = pr.merged_at ? '🔀 merged' : '❌ closed';
        log(`  ${merged} #${pr.number}: ${pr.title}`);
        log(`     👤 ${pr.user.login} - ${formatDate(pr.closed_at || pr.created_at)}`);
      }
    }
    
  } catch (error) {
    log(`❌ Erro ao verificar pull requests: ${error.message}`, COLORS.red);
  }
}

async function checkRecentCommits() {
  logSection('📝 COMMITS RECENTES');
  
  try {
    const commits = await makeGitHubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=10`);
    
    for (const commit of commits.slice(0, 5)) {
      const sha = commit.sha.substring(0, 7);
      const message = commit.commit.message.split('\n')[0]; // Primeira linha apenas
      const author = commit.commit.author.name;
      const time = formatDate(commit.commit.author.date);
      
      log(`📌 ${COLORS.bold}${sha}${COLORS.reset} ${message}`);
      log(`   👤 ${author} - ${time}`);
      console.log();
    }
    
  } catch (error) {
    log(`❌ Erro ao verificar commits: ${error.message}`, COLORS.red);
  }
}

async function generateReport() {
  try {
    log('🔍 Verificando status do GitHub para GladPros...', COLORS.bold);
    console.log();
    
    await checkBranches();
    await checkWorkflows();
    await checkPullRequests();
    await checkRecentCommits();
    
    logSection('📊 RESUMO EXECUTIVO');
    
    // Análise básica dos arquivos de workflow locais
    const workflowDir = path.join(process.cwd(), '.github', 'workflows');
    if (fs.existsSync(workflowDir)) {
      const workflowFiles = fs.readdirSync(workflowDir);
      log(`📁 Arquivos de workflow locais: ${workflowFiles.length}`);
      for (const file of workflowFiles) {
        log(`   📄 ${file}`);
      }
    }
    
    console.log();
    log('✨ Verificação concluída!', COLORS.bold + COLORS.green);
    
  } catch (error) {
    log(`❌ Erro geral: ${error.message}`, COLORS.red);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  generateReport().catch(error => {
    console.error('Erro não tratado:', error);
    process.exit(1);
  });
}

module.exports = {
  checkBranches,
  checkWorkflows, 
  checkPullRequests,
  checkRecentCommits,
  generateReport
};