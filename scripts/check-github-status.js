#!/usr/bin/env node
// scripts/check-github-status.js
// Verifica o status dos branches e GitHub Actions CI/CD

const https = require('https');
const { URL } = require('url');

// Configuration
const OWNER = 'Gladiston-Porto';
const REPO = 'GladPros';
const API_BASE = 'https://api.github.com';

// Get GitHub token from environment
const TOKEN = process.env.GITHUB_TOKEN || process.env.PERSONAL_TOKEN;

function checkToken() {
  if (!TOKEN) {
    console.error('❌ ERROR: Set GITHUB_TOKEN or PERSONAL_TOKEN environment variable');
    console.error('   Example: GITHUB_TOKEN=ghp_xxx node scripts/check-github-status.js');
    process.exit(1);
  }
}

// Helper function to make GitHub API requests
function githubRequest(endpoint) {
  return new Promise((resolve, reject) => {
    if (!TOKEN) {
      reject(new Error('GitHub token not available'));
      return;
    }
    
    const url = new URL(`${API_BASE}${endpoint}`);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'GladPros-Status-Check'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(`GitHub API error ${res.statusCode}: ${json.message || data}`));
          }
        } catch (error) {
          reject(new Error(`JSON parse error: ${error.message}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

// Get repository info
async function getRepoInfo() {
  try {
    const repo = await githubRequest(`/repos/${OWNER}/${REPO}`);
    return {
      name: repo.name,
      fullName: repo.full_name,
      defaultBranch: repo.default_branch,
      private: repo.private,
      updatedAt: repo.updated_at
    };
  } catch (error) {
    throw new Error(`Failed to get repository info: ${error.message}`);
  }
}

// Get all branches
async function getBranches() {
  try {
    const branches = await githubRequest(`/repos/${OWNER}/${REPO}/branches`);
    return branches.map(branch => ({
      name: branch.name,
      protected: branch.protected,
      sha: branch.commit.sha.substring(0, 8),
      lastCommit: branch.commit.commit.committer.date
    }));
  } catch (error) {
    throw new Error(`Failed to get branches: ${error.message}`);
  }
}

// Get branch protection rules for a specific branch
async function getBranchProtection(branchName) {
  try {
    const protection = await githubRequest(`/repos/${OWNER}/${REPO}/branches/${branchName}/protection`);
    return {
      requiredStatusChecks: protection.required_status_checks,
      enforceAdmins: protection.enforce_admins.enabled,
      requiredPullRequestReviews: protection.required_pull_request_reviews,
      restrictions: protection.restrictions
    };
  } catch {
    // Branch might not have protection rules
    return null;
  }
}

// Get recent workflow runs
async function getWorkflowRuns() {
  try {
    const runs = await githubRequest(`/repos/${OWNER}/${REPO}/actions/runs?per_page=10`);
    return runs.workflow_runs.map(run => ({
      id: run.id,
      name: run.name,
      status: run.status,
      conclusion: run.conclusion,
      branch: run.head_branch,
      sha: run.head_sha.substring(0, 8),
      createdAt: run.created_at,
      updatedAt: run.updated_at,
      htmlUrl: run.html_url
    }));
  } catch (error) {
    throw new Error(`Failed to get workflow runs: ${error.message}`);
  }
}

// Get workflows
async function getWorkflows() {
  try {
    const workflows = await githubRequest(`/repos/${OWNER}/${REPO}/actions/workflows`);
    return workflows.workflows.map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      path: workflow.path,
      state: workflow.state,
      createdAt: workflow.created_at,
      updatedAt: workflow.updated_at
    }));
  } catch (error) {
    throw new Error(`Failed to get workflows: ${error.message}`);
  }
}

// Format date for display
function formatDate(isoString) {
  return new Date(isoString).toLocaleString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Get status emoji
function getStatusEmoji(status, conclusion) {
  if (status === 'completed') {
    switch (conclusion) {
      case 'success': return '✅';
      case 'failure': return '❌';
      case 'cancelled': return '⏸️';
      case 'skipped': return '⏭️';
      case 'timed_out': return '⏰';
      default: return '❓';
    }
  }
  switch (status) {
    case 'in_progress': return '🟡';
    case 'queued': return '🔵';
    case 'requested': return '🔵';
    case 'waiting': return '🟠';
    default: return '❓';
  }
}

// Main execution
async function main() {
  checkToken();
  
  console.log('🔍 Verificando status do GitHub - Branches e CI/CD\n');
  
  try {
    // Repository info
    console.log('📦 Informações do Repositório:');
    const repoInfo = await getRepoInfo();
    console.log(`   Nome: ${repoInfo.fullName}`);
    console.log(`   Branch padrão: ${repoInfo.defaultBranch}`);
    console.log(`   Privado: ${repoInfo.private ? 'Sim' : 'Não'}`);
    console.log(`   Última atualização: ${formatDate(repoInfo.updatedAt)}\n`);

    // Branches info
    console.log('🌿 Status dos Branches:');
    const branches = await getBranches();
    for (const branch of branches) {
      const protectionIcon = branch.protected ? '🔒' : '🔓';
      console.log(`   ${protectionIcon} ${branch.name} (${branch.sha}) - ${formatDate(branch.lastCommit)}`);
      
      if (branch.protected) {
        const protection = await getBranchProtection(branch.name);
        if (protection) {
          console.log(`      └── Regras de proteção: Revisões obrigatórias: ${protection.requiredPullRequestReviews ? 'Sim' : 'Não'}`);
          if (protection.requiredStatusChecks) {
            console.log(`      └── Checks obrigatórios: ${protection.requiredStatusChecks.contexts.join(', ') || 'Nenhum'}`);
          }
        }
      }
    }
    console.log('');

    // Workflows info
    console.log('⚙️ Workflows Disponíveis:');
    const workflows = await getWorkflows();
    for (const workflow of workflows) {
      const stateIcon = workflow.state === 'active' ? '🟢' : '🔴';
      console.log(`   ${stateIcon} ${workflow.name} (${workflow.path})`);
      console.log(`      └── Estado: ${workflow.state}, Atualizado: ${formatDate(workflow.updatedAt)}`);
    }
    console.log('');

    // Recent workflow runs
    console.log('🚀 Execuções Recentes dos Workflows:');
    const runs = await getWorkflowRuns();
    if (runs.length === 0) {
      console.log('   Nenhuma execução encontrada.');
    } else {
      for (const run of runs) {
        const emoji = getStatusEmoji(run.status, run.conclusion);
        console.log(`   ${emoji} ${run.name} - ${run.branch} (${run.sha})`);
        console.log(`      └── Status: ${run.status}${run.conclusion ? ` / ${run.conclusion}` : ''}`);
        console.log(`      └── Executado: ${formatDate(run.createdAt)}`);
        console.log(`      └── URL: ${run.htmlUrl}`);
        console.log('');
      }
    }

    console.log('✅ Verificação concluída com sucesso!');
    
  } catch (error) {
    console.error(`❌ Erro durante a verificação: ${error.message}`);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { main, getRepoInfo, getBranches, getWorkflowRuns };