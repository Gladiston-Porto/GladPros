#!/usr/bin/env node
/**
 * Simple CI/CD Status Checker
 * 
 * A lightweight script to check CI/CD status using only Node.js built-ins
 */

const https = require('https');

// Configuration
const REPO_OWNER = 'Gladiston-Porto';
const REPO_NAME = 'GladPros';

/**
 * Simple HTTP request using Node.js built-ins
 */
function makeRequest(hostname, path, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'GladPros-CI-Checker'
    };
    
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    const options = {
      hostname,
      path,
      method: 'GET',
      headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.abort();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

/**
 * Get GitHub API data
 */
async function githubApi(endpoint, token = null) {
  return makeRequest('api.github.com', endpoint, token);
}

/**
 * Format time ago
 */
function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Get status symbol
 */
function getStatusSymbol(status, conclusion) {
  if (status === 'in_progress' || status === 'queued') return '⏳';
  if (conclusion === 'success') return '✅';
  if (conclusion === 'failure') return '❌';
  if (conclusion === 'cancelled') return '⏹️';
  return '❓';
}

/**
 * Check workflow status
 */
async function checkWorkflows(token) {
  console.log('🔧 Checking workflows...');
  
  try {
    const workflows = await githubApi(`/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows`, token);
    
    console.log(`\n📊 Found ${workflows.total_count} workflows:`);
    
    for (const workflow of workflows.workflows.slice(0, 5)) {
      const status = workflow.state === 'active' ? '🟢' : '🔴';
      console.log(`   ${status} ${workflow.name}`);
      
      try {
        const runs = await githubApi(
          `/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${workflow.id}/runs?per_page=3`,
          token
        );
        
        if (runs.workflow_runs.length > 0) {
          console.log('      Recent runs:');
          runs.workflow_runs.forEach((run, index) => {
            if (index < 3) {
              const symbol = getStatusSymbol(run.status, run.conclusion);
              const time = timeAgo(run.created_at);
              const branch = run.head_branch || 'unknown';
              console.log(`        ${symbol} ${branch} (${time})`);
            }
          });
        } else {
          console.log('      No recent runs');
        }
        
      } catch (error) {
        console.log(`      ❌ Failed to fetch runs: ${error.message}`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    return workflows.workflows;
  } catch (error) {
    if (error.message.includes('403')) {
      console.error('❌ Access denied - check GITHUB_TOKEN permissions or repository access');
      console.log('💡 Tip: Set GITHUB_TOKEN environment variable with repo access');
      console.log('   Example: GITHUB_TOKEN=ghp_xxx node scripts/check-ci-status.js');
    } else {
      console.error('❌ Failed to fetch workflows:', error.message);
    }
    return [];
  }
}

/**
 * Check branch status
 */
async function checkBranches(token) {
  console.log('🌿 Checking branches...');
  
  try {
    const branches = await githubApi(`/repos/${REPO_OWNER}/${REPO_NAME}/branches`, token);
    const repo = await githubApi(`/repos/${REPO_OWNER}/${REPO_NAME}`, token);
    
    console.log(`\n📊 Found ${branches.length} branches (default: ${repo.default_branch}):`);
    
    // Show main branches first
    const mainBranches = branches.filter(b => 
      ['main', 'master', 'develop', 'staging'].includes(b.name) ||
      b.name === repo.default_branch
    );
    
    console.log('   Main branches:');
    mainBranches.forEach(branch => {
      const isDefault = branch.name === repo.default_branch ? ' (default)' : '';
      const protection = branch.protected ? ' 🔒' : '';
      console.log(`     🌿 ${branch.name}${isDefault}${protection}`);
    });
    
    // Show feature branches
    const featureBranches = branches.filter(b => 
      !mainBranches.some(mb => mb.name === b.name)
    ).slice(0, 10);
    
    if (featureBranches.length > 0) {
      console.log('   Feature branches:');
      featureBranches.forEach(branch => {
        console.log(`     🔧 ${branch.name}`);
      });
      
      if (branches.length - mainBranches.length > 10) {
        console.log(`     ... and ${branches.length - mainBranches.length - 10} more`);
      }
    }
    
    return branches;
  } catch (error) {
    if (error.message.includes('403')) {
      console.error('❌ Access denied - check GITHUB_TOKEN permissions or repository access');
      console.log('💡 Tip: For private repos, ensure token has "repo" scope');
    } else {
      console.error('❌ Failed to fetch branches:', error.message);
    }
    return [];
  }
}

/**
 * Check recent commits on main branch
 */
async function checkRecentActivity(token) {
  console.log('\n📈 Checking recent activity...');
  
  try {
    const commits = await githubApi(
      `/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=5`,
      token
    );
    
    console.log('\n📋 Recent commits:');
    commits.slice(0, 5).forEach(commit => {
      const message = commit.commit.message.split('\n')[0];
      const author = commit.commit.author.name;
      const time = timeAgo(commit.commit.author.date);
      const sha = commit.sha.substring(0, 7);
      
      console.log(`   📝 ${sha} - ${message} (${author}, ${time})`);
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch recent commits:', error.message);
  }
}

/**
 * Generate health summary
 */
function generateHealthSummary(workflows) {
  console.log('\n🏥 Health Summary:');
  
  const activeWorkflows = workflows.filter(w => w.state === 'active');
  const inactiveWorkflows = workflows.filter(w => w.state !== 'active');
  
  console.log(`   Workflows: ${activeWorkflows.length} active, ${inactiveWorkflows.length} inactive`);
  
  if (workflows.length === 0) {
    console.log('   🔴 No workflows configured');
  } else if (activeWorkflows.length === workflows.length) {
    console.log('   🟢 All workflows are active');
  } else if (activeWorkflows.length > 0) {
    console.log('   🟡 Some workflows are inactive');
  } else {
    console.log('   🔴 All workflows are inactive');
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 GitHub CI/CD Status Checker');
  console.log(`📁 Repository: ${REPO_OWNER}/${REPO_NAME}`);
  console.log('='.repeat(50));
  
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('⚠️  GITHUB_TOKEN not set - using anonymous API (rate limited)');
  }
  
  try {
    // Check all aspects
    const [workflows] = await Promise.all([
      checkWorkflows(token),
      checkBranches(token)
    ]);
    
    await checkRecentActivity(token);
    generateHealthSummary(workflows);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Status check completed!');
    
  } catch (error) {
    console.error('\n💥 Status check failed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = {
  checkWorkflows,
  checkBranches,
  checkRecentActivity,
  generateHealthSummary
};