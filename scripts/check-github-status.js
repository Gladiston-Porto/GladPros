#!/usr/bin/env node
/**
 * GitHub Branch and CI/CD Status Checker
 * 
 * This script checks the status of GitHub branches and CI/CD workflows,
 * providing detailed information about workflow runs, branch health, and actionable insights.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const REPO_OWNER = 'Gladiston-Porto';
const REPO_NAME = 'GladPros';
const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Make a request to the GitHub API
 */
async function githubApiRequest(endpoint, token = null) {
  const url = `${GITHUB_API_BASE}${endpoint}`;
  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'GladPros-Status-Checker'
  };
  
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    // Fallback for environments without node-fetch - use basic Node.js modules
    return await fallbackHttpRequest(url, headers);
  }
}

/**
 * Fallback HTTP request using Node.js built-ins
 */
async function fallbackHttpRequest(url, headers) {
  const https = require('https');
  const urlParsed = new URL(url);
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: urlParsed.hostname,
      path: urlParsed.pathname + urlParsed.search,
      method: 'GET',
      headers
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

/**
 * Get status emoji
 */
function getStatusEmoji(status) {
  const statusMap = {
    'success': '✅',
    'completed': '✅', 
    'failure': '❌',
    'cancelled': '⏹️',
    'in_progress': '🔄',
    'queued': '⏳',
    'pending': '⏳',
    'neutral': '⚪',
    'skipped': '⏭️'
  };
  return statusMap[status] || '❓';
}

/**
 * Get branch information
 */
async function getBranchInfo(token) {
  console.log('🔍 Fetching branch information...\n');
  
  try {
    const branches = await githubApiRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/branches`, token);
    const defaultBranch = await githubApiRequest(`/repos/${REPO_OWNER}/${REPO_NAME}`, token);
    
    const branchInfo = {
      total: branches.length,
      default: defaultBranch.default_branch,
      branches: branches.map(branch => ({
        name: branch.name,
        sha: branch.commit.sha.substring(0, 7),
        protected: branch.protected || false
      }))
    };
    
    console.log(`📊 Branch Summary:`);
    console.log(`   Total branches: ${branchInfo.total}`);
    console.log(`   Default branch: ${branchInfo.default}`);
    console.log(`   Protected branches: ${branchInfo.branches.filter(b => b.protected).length}\n`);
    
    console.log('📋 Branch List:');
    branchInfo.branches.forEach(branch => {
      const protection = branch.protected ? ' 🔒' : '';
      const isDefault = branch.name === branchInfo.default ? ' (default)' : '';
      console.log(`   ${branch.name}${isDefault}${protection} - ${branch.sha}`);
    });
    
    return branchInfo;
  } catch (error) {
    console.error('❌ Error fetching branch information:', error.message);
    return null;
  }
}

/**
 * Get workflow information
 */
async function getWorkflowInfo(token) {
  console.log('\n🔧 Fetching workflow information...\n');
  
  try {
    const workflows = await githubApiRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows`, token);
    
    console.log(`📊 Workflow Summary:`);
    console.log(`   Total workflows: ${workflows.total_count}`);
    console.log(`   Active workflows: ${workflows.workflows.filter(w => w.state === 'active').length}\n`);
    
    console.log('📋 Workflow List:');
    for (const workflow of workflows.workflows) {
      const status = workflow.state === 'active' ? '✅ Active' : '❌ Inactive';
      console.log(`   ${workflow.name} - ${status}`);
      console.log(`      ID: ${workflow.id}`);
      console.log(`      Path: ${workflow.path}`);
      console.log(`      Badge: ${workflow.badge_url}\n`);
    }
    
    return workflows.workflows;
  } catch (error) {
    console.error('❌ Error fetching workflow information:', error.message);
    return [];
  }
}

/**
 * Get recent workflow runs
 */
async function getRecentWorkflowRuns(workflows, token) {
  console.log('🏃 Fetching recent workflow runs...\n');
  
  const allRuns = [];
  
  for (const workflow of workflows.slice(0, 3)) { // Limit to first 3 workflows to avoid rate limits
    try {
      const runs = await githubApiRequest(
        `/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${workflow.id}/runs?per_page=5`,
        token
      );
      
      console.log(`📈 ${workflow.name} - Recent Runs:`);
      if (runs.workflow_runs.length === 0) {
        console.log('   No recent runs\n');
        continue;
      }
      
      runs.workflow_runs.forEach(run => {
        const emoji = getStatusEmoji(run.conclusion || run.status);
        const timeAgo = formatDate(run.created_at);
        console.log(`   ${emoji} ${run.display_title} - ${run.head_branch} (${timeAgo})`);
      });
      console.log('');
      
      allRuns.push(...runs.workflow_runs.map(run => ({
        ...run,
        workflow_name: workflow.name
      })));
    } catch (error) {
      console.error(`❌ Error fetching runs for ${workflow.name}:`, error.message);
    }
  }
  
  return allRuns;
}

/**
 * Analyze workflow health
 */
function analyzeWorkflowHealth(runs) {
  console.log('🏥 Workflow Health Analysis:\n');
  
  const analysis = {
    total: runs.length,
    success: runs.filter(r => r.conclusion === 'success').length,
    failure: runs.filter(r => r.conclusion === 'failure').length,
    cancelled: runs.filter(r => r.conclusion === 'cancelled').length,
    inProgress: runs.filter(r => r.status === 'in_progress').length
  };
  
  const successRate = analysis.total > 0 ? (analysis.success / analysis.total * 100).toFixed(1) : 0;
  
  console.log(`📊 Health Metrics:`);
  console.log(`   Success Rate: ${successRate}% (${analysis.success}/${analysis.total})`);
  console.log(`   Failures: ${analysis.failure}`);
  console.log(`   Cancelled: ${analysis.cancelled}`);
  console.log(`   In Progress: ${analysis.inProgress}\n`);
  
  // Health recommendations
  if (analysis.failure > 0) {
    console.log('⚠️  Recommendations:');
    console.log('   • Investigate recent failures');
    console.log('   • Check error logs for common issues');
    console.log('   • Consider fixing broken builds on main branch\n');
  }
  
  if (parseFloat(successRate) < 80) {
    console.log('🚨 Critical Issues:');
    console.log('   • Success rate below 80% indicates systemic problems');
    console.log('   • Immediate attention required for CI/CD stability\n');
  }
  
  return analysis;
}

/**
 * Generate status report
 */
function generateStatusReport(branchInfo, workflows, runs, analysis) {
  console.log('📋 Status Report Summary:\n');
  
  console.log('🌿 Branch Status:');
  console.log(`   ${branchInfo ? '✅' : '❌'} Branch information ${branchInfo ? 'retrieved successfully' : 'failed to load'}`);
  if (branchInfo) {
    console.log(`   📈 Total: ${branchInfo.total} branches`);
    console.log(`   🔒 Protected: ${branchInfo.branches.filter(b => b.protected).length} branches`);
  }
  console.log('');
  
  console.log('🔧 Workflow Status:');
  console.log(`   ${workflows.length > 0 ? '✅' : '❌'} Workflows ${workflows.length > 0 ? 'active' : 'not found'}`);
  console.log(`   📈 Total: ${workflows.length} workflows`);
  console.log(`   🟢 Active: ${workflows.filter(w => w.state === 'active').length}`);
  console.log('');
  
  console.log('🏃 Recent Activity:');
  console.log(`   📈 Total runs analyzed: ${analysis.total}`);
  console.log(`   ${analysis.success > 0 ? '✅' : '❌'} Successful: ${analysis.success}`);
  console.log(`   ${analysis.failure === 0 ? '✅' : '❌'} Failed: ${analysis.failure}`);
  console.log('');
  
  const overallHealth = analysis.total > 0 && (analysis.success / analysis.total) > 0.8 ? 'HEALTHY' : 'NEEDS ATTENTION';
  const healthEmoji = overallHealth === 'HEALTHY' ? '🟢' : '🟡';
  
  console.log(`${healthEmoji} Overall CI/CD Health: ${overallHealth}`);
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 GitHub Branch and CI/CD Status Checker');
  console.log(`📁 Repository: ${REPO_OWNER}/${REPO_NAME}`);
  console.log('=' .repeat(50) + '\n');
  
  // Get GitHub token from environment
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('⚠️  No GITHUB_TOKEN provided - using unauthenticated requests (limited rate)');
  }
  
  try {
    // Fetch all information
    const branchInfo = await getBranchInfo(token);
    const workflows = await getWorkflowInfo(token);
    const runs = await getRecentWorkflowRuns(workflows, token);
    const analysis = analyzeWorkflowHealth(runs);
    
    // Generate final report
    generateStatusReport(branchInfo, workflows, runs, analysis);
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ Status check completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Status check failed:', error.message);
    process.exit(1);
  }
}

// Handle command line execution
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unexpected error:', error.message);
    process.exit(1);
  });
}

module.exports = {
  githubApiRequest,
  getBranchInfo,
  getWorkflowInfo,
  getRecentWorkflowRuns,
  analyzeWorkflowHealth,
  generateStatusReport
};