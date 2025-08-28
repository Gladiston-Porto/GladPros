#!/usr/bin/env node
// scripts/check-github-status.js
// Verifica o status dos branches e workflows do GitHub Actions

const https = require('https');

const OWNER = 'Gladiston-Porto';
const REPO = 'GladPros';

console.log('🔍 Verificando status dos branches e CI/CD do GitHub...');
console.log(`Repository: ${OWNER}/${REPO}\n`);

// Check for authentication token
const TOKEN = process.env.GITHUB_TOKEN || process.env.PERSONAL_TOKEN;
if (!TOKEN) {
  console.log('❌ ERROR: set GITHUB_TOKEN or PERSONAL_TOKEN environment variable');
  console.log('Example: GITHUB_TOKEN=ghp_xxx node scripts/check-github-status.js');
  process.exit(1);
}

// Helper function to make GitHub API requests
function githubRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'GladPros-Status-Check'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (err) {
          reject(new Error(`JSON parse error: ${err.message}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Helper function to get status icon
function getStatusIcon(conclusion, status) {
  if (conclusion === 'success') return '✅';
  if (conclusion === 'failure') return '❌';
  if (conclusion === 'cancelled') return '⚪';
  if (status === 'in_progress') return '🔄';
  return '⏳';
}

async function checkBranches() {
  console.log('📋 BRANCHES STATUS');
  console.log('==================');

  try {
    const branches = await githubRequest(`/repos/${OWNER}/${REPO}/branches`);
    
    branches.forEach(branch => {
      const shortSha = branch.commit.sha.substring(0, 7);
      const date = branch.commit.commit.author.date;
      console.log(`📌 ${branch.name} - Commit: ${shortSha} - ${date}`);
    });
  } catch (error) {
    console.log(`❌ Erro ao obter branches: ${error.message}`);
  }
}

async function checkWorkflows() {
  console.log('\n🚀 CI/CD WORKFLOWS STATUS');
  console.log('========================');

  try {
    const workflows = await githubRequest(`/repos/${OWNER}/${REPO}/actions/workflows`);
    
    if (workflows.workflows.length === 0) {
      console.log('⚠️  Nenhum workflow encontrado');
      return;
    }

    for (const workflow of workflows.workflows) {
      console.log(`\n📊 Workflow: ${workflow.name} (ID: ${workflow.id}) - Estado: ${workflow.state}`);
      
      try {
        const runs = await githubRequest(`/repos/${OWNER}/${REPO}/actions/workflows/${workflow.id}/runs?per_page=5`);
        
        runs.workflow_runs.forEach(run => {
          const status = run.conclusion || 'running';
          console.log(`   🔸 ${run.head_branch} - ${status} - ${run.created_at} - ${run.html_url}`);
        });
      } catch (error) {
        console.log(`   ❌ Erro ao obter runs do workflow: ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`❌ Erro ao obter workflows: ${error.message}`);
  }
}

async function checkRecentRuns() {
  console.log('\n📈 WORKFLOW RUNS SUMMARY (últimos 10)');
  console.log('===================================');

  try {
    const allRuns = await githubRequest(`/repos/${OWNER}/${REPO}/actions/runs?per_page=10`);
    
    allRuns.workflow_runs.forEach(run => {
      const icon = getStatusIcon(run.conclusion, run.status);
      const status = run.conclusion || run.status;
      const date = run.created_at.substring(0, 10);
      console.log(`${icon} ${run.workflow_name} - ${run.head_branch} - ${status} - ${date}`);
    });
  } catch (error) {
    console.log(`❌ Erro ao obter resumo dos workflow runs: ${error.message}`);
  }
}

async function main() {
  await checkBranches();
  await checkWorkflows();
  await checkRecentRuns();
  
  console.log('\n🏁 Verificação concluída!');
}

main().catch(error => {
  console.error('❌ Erro geral:', error.message);
  process.exit(1);
});