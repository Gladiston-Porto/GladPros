#!/usr/bin/env node

/**
 * GitHub Status Checker
 * Verifica o status dos branches e workflows do GitHub Actions
 * 
 * Usage:
 *   node scripts/check-github-status.js
 *   GITHUB_TOKEN=ghp_xxx node scripts/check-github-status.js
 * 
 * Environment variables:
 *   GITHUB_TOKEN - GitHub Personal Access Token (optional for public repos)
 *   GITHUB_REPO - Repository name (default: auto-detect from git remote)
 *   GITHUB_OWNER - Repository owner (default: auto-detect from git remote)
 */

const https = require('https');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  owner: process.env.GITHUB_OWNER || 'Gladiston-Porto',
  repo: process.env.GITHUB_REPO || 'GladPros',
  token: process.env.GITHUB_TOKEN,
  maxWorkflowRuns: 5,
  maxBranches: 10,
  summaryMode: process.argv.includes('--summary') || process.argv.includes('-s')
};

// Emojis for status visualization
const EMOJIS = {
  success: '✅',
  failure: '❌',
  pending: '⏳',
  running: '🔄',
  warning: '⚠️',
  info: 'ℹ️',
  branch: '🌿',
  workflow: '⚙️',
  commit: '📝',
  time: '⏰',
  shield: '🛡️',
  rocket: '🚀'
};

// Console colors
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function colorize(text, color) {
  return `${COLORS[color] || ''}${text}${COLORS.reset}`;
}

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: 'api.github.com',
      port: 443,
      path: path,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'GladPros-Status-Checker',
        'Accept': 'application/vnd.github+json',
        ...(CONFIG.token && { 'Authorization': `token ${CONFIG.token}` }),
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`GitHub API Error (${res.statusCode}): ${parsed.message || data}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return date.toLocaleDateString('pt-BR');
}

function formatDuration(startTime, endTime) {
  if (!startTime || !endTime) return 'N/A';
  const diffMs = new Date(endTime) - new Date(startTime);
  const diffSecs = Math.floor(diffMs / 1000);
  const mins = Math.floor(diffSecs / 60);
  const secs = diffSecs % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function getStatusEmoji(status, conclusion) {
  if (status === 'in_progress' || status === 'queued') return EMOJIS.running;
  if (status === 'completed') {
    switch (conclusion) {
      case 'success': return EMOJIS.success;
      case 'failure': return EMOJIS.failure;
      case 'cancelled': return EMOJIS.warning;
      default: return EMOJIS.pending;
    }
  }
  return EMOJIS.pending;
}

function getStatusColor(status, conclusion) {
  if (status === 'in_progress' || status === 'queued') return 'yellow';
  if (status === 'completed') {
    switch (conclusion) {
      case 'success': return 'green';
      case 'failure': return 'red';
      case 'cancelled': return 'yellow';
      default: return 'gray';
    }
  }
  return 'gray';
}

async function checkBranches() {
  console.log(colorize(`\n${EMOJIS.branch} BRANCHES STATUS`, 'cyan'));
  console.log(colorize('─'.repeat(50), 'gray'));

  try {
    const branches = await makeRequest(`/repos/${CONFIG.owner}/${CONFIG.repo}/branches`);
    const sortedBranches = branches
      .slice(0, CONFIG.maxBranches)
      .sort((a, b) => a.name === 'main' ? -1 : b.name === 'main' ? 1 : 0);

    for (const branch of sortedBranches) {
      const isMain = branch.name === 'main';
      const branchColor = isMain ? 'green' : 'blue';
      const protectionEmoji = branch.protected ? ` ${EMOJIS.shield}` : '';
      
      console.log(
        `${colorize(branch.name, branchColor)}${protectionEmoji} - ` +
        `${colorize(branch.commit.sha.substring(0, 7), 'gray')} ` +
        `${colorize('(' + formatDate(branch.commit.commit.committer.date) + ')', 'gray')}`
      );

      // Show commit message for main branches
      if (isMain || branch.name.includes('main') || branch.name.includes('develop')) {
        const commitMsg = branch.commit.commit.message.split('\n')[0];
        if (commitMsg.length > 60) {
          console.log(colorize(`  ${EMOJIS.commit} ${commitMsg.substring(0, 57)}...`, 'gray'));
        } else {
          console.log(colorize(`  ${EMOJIS.commit} ${commitMsg}`, 'gray'));
        }
      }
    }

    // Check for branch protection on main
    try {
      const protection = await makeRequest(`/repos/${CONFIG.owner}/${CONFIG.repo}/branches/main/protection`);
      console.log(colorize(`\n${EMOJIS.shield} Branch Protection (main):`, 'yellow'));
      if (protection.required_status_checks) {
        console.log(colorize(`  • Required status checks: ${protection.required_status_checks.contexts.join(', ') || 'None'}`, 'gray'));
      }
      if (protection.required_pull_request_reviews) {
        console.log(colorize(`  • Required PR reviews: ${protection.required_pull_request_reviews.required_approving_review_count || 0}`, 'gray'));
      }
    } catch (e) {
      if (e.message.includes('404')) {
        console.log(colorize(`\n${EMOJIS.warning} No branch protection configured for main`, 'yellow'));
      }
    }

  } catch (error) {
    console.log(colorize(`${EMOJIS.info} Falling back to local git information...`, 'yellow'));
    await checkLocalBranches();
  }
}

async function checkLocalBranches() {
  try {
    // Get local branches
    const localBranches = execSync('git branch -r --format="%(refname:short) %(objectname:short) %(committerdate:relative)"', { encoding: 'utf8' }).trim();
    
    if (!localBranches) {
      console.log(colorize(`${EMOJIS.warning} No remote branches found`, 'yellow'));
      return;
    }

    const branches = localBranches.split('\n').slice(0, CONFIG.maxBranches);
    
    for (const branchLine of branches) {
      const [fullName, sha, ...dateParts] = branchLine.trim().split(' ');
      const branchName = fullName.replace('origin/', '');
      const isMain = branchName === 'main';
      const branchColor = isMain ? 'green' : 'blue';
      const date = dateParts.join(' ');
      
      console.log(
        `${colorize(branchName, branchColor)} - ` +
        `${colorize(sha, 'gray')} ` +
        `${colorize(`(${date})`, 'gray')}`
      );

      // Show commit message for main branches
      if (isMain || branchName.includes('main') || branchName.includes('develop')) {
        try {
          const commitMsg = execSync(`git log -1 --pretty=format:"%s" origin/${branchName}`, { encoding: 'utf8' }).trim();
          const displayMsg = commitMsg.length > 60 ? `${commitMsg.substring(0, 57)}...` : commitMsg;
          console.log(colorize(`  ${EMOJIS.commit} ${displayMsg}`, 'gray'));
        } catch (e) {
          // Ignore if can't get commit message
        }
      }
    }

    console.log(colorize(`\n${EMOJIS.info} Local git information used (GitHub API not accessible)`, 'yellow'));

  } catch (error) {
    console.log(colorize(`${EMOJIS.failure} Erro ao buscar branches locais: ${error.message}`, 'red'));
  }
}

async function checkWorkflows() {
  console.log(colorize(`\n${EMOJIS.workflow} WORKFLOWS STATUS`, 'cyan'));
  console.log(colorize('─'.repeat(50), 'gray'));

  try {
    // Get all workflows
    const workflows = await makeRequest(`/repos/${CONFIG.owner}/${CONFIG.repo}/actions/workflows`);
    
    if (workflows.workflows.length === 0) {
      console.log(colorize(`${EMOJIS.info} Nenhum workflow encontrado`, 'yellow'));
      return;
    }

    for (const workflow of workflows.workflows) {
      console.log(colorize(`\n📄 ${workflow.name}`, 'bright'));
      
      try {
        // Get recent runs for this workflow
        const runs = await makeRequest(`/repos/${CONFIG.owner}/${CONFIG.repo}/actions/workflows/${workflow.id}/runs?per_page=${CONFIG.maxWorkflowRuns}`);
        
        if (runs.workflow_runs.length === 0) {
          console.log(colorize('  Nenhuma execução encontrada', 'gray'));
          continue;
        }

        for (const run of runs.workflow_runs.slice(0, 3)) {
          const emoji = getStatusEmoji(run.status, run.conclusion);
          const statusColor = getStatusColor(run.status, run.conclusion);
          const duration = formatDuration(run.created_at, run.updated_at);
          const branch = run.head_branch;
          
          console.log(
            `  ${emoji} ${colorize(run.status, statusColor)} ` +
            `${colorize(`(${branch})`, 'blue')} - ` +
            `${colorize(formatDate(run.created_at), 'gray')} ` +
            `${colorize(`[${duration}]`, 'gray')}`
          );

          if (run.conclusion === 'failure' && run.html_url) {
            console.log(colorize(`    🔗 ${run.html_url}`, 'red'));
          }
        }

        // Workflow summary
        const successRuns = runs.workflow_runs.filter(r => r.conclusion === 'success').length;
        const failureRuns = runs.workflow_runs.filter(r => r.conclusion === 'failure').length;
        const totalRuns = runs.workflow_runs.length;
        
        if (totalRuns > 0) {
          const successRate = Math.round((successRuns / totalRuns) * 100);
          const rateColor = successRate >= 80 ? 'green' : successRate >= 60 ? 'yellow' : 'red';
          console.log(colorize(`  📊 Success rate: ${successRate}% (${successRuns}/${totalRuns})`, rateColor));
        }

      } catch (error) {
        console.log(colorize(`  ${EMOJIS.failure} Erro ao buscar execuções: ${error.message}`, 'red'));
      }
    }

  } catch (error) {
    console.log(colorize(`${EMOJIS.info} Falling back to local workflow information...`, 'yellow'));
    await checkLocalWorkflows();
  }
}

async function checkLocalWorkflows() {
  try {
    const fs = require('fs');
    const path = require('path');
    const workflowDir = path.join(process.cwd(), '.github', 'workflows');
    
    if (!fs.existsSync(workflowDir)) {
      console.log(colorize(`${EMOJIS.info} Nenhum diretório de workflows encontrado (.github/workflows)`, 'yellow'));
      return;
    }

    const workflowFiles = fs.readdirSync(workflowDir).filter(file => 
      file.endsWith('.yml') || file.endsWith('.yaml')
    );

    if (workflowFiles.length === 0) {
      console.log(colorize(`${EMOJIS.info} Nenhum workflow encontrado`, 'yellow'));
      return;
    }

    for (const file of workflowFiles) {
      const filePath = path.join(workflowDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract workflow name from YAML
      const nameMatch = content.match(/^name:\s*(.+)$/m);
      const workflowName = nameMatch ? nameMatch[1].trim().replace(/['"]/g, '') : file;
      
      // Extract triggers
      const onMatch = content.match(/^on:\s*$/m);
      let triggers = [];
      if (onMatch) {
        const afterOn = content.substring(onMatch.index + onMatch[0].length);
        const nextSection = afterOn.match(/^[a-zA-Z]/m);
        const triggerSection = nextSection ? afterOn.substring(0, nextSection.index) : afterOn;
        
        if (triggerSection.includes('push:')) triggers.push('push');
        if (triggerSection.includes('pull_request:')) triggers.push('pull_request');
        if (triggerSection.includes('workflow_dispatch:')) triggers.push('manual');
        if (triggerSection.includes('schedule:')) triggers.push('schedule');
      } else {
        const directTriggers = content.match(/^on:\s*\[([^\]]+)\]$/m) || content.match(/^on:\s*(\w+)$/m);
        if (directTriggers) {
          triggers = directTriggers[1].split(',').map(t => t.trim().replace(/['"]/g, ''));
        }
      }

      console.log(colorize(`\n📄 ${workflowName}`, 'bright'));
      console.log(colorize(`  📄 File: ${file}`, 'gray'));
      console.log(colorize(`  🎯 Triggers: ${triggers.join(', ') || 'N/A'}`, 'blue'));

      // Extract jobs
      const jobsMatch = content.match(/^jobs:\s*$/m);
      if (jobsMatch) {
        const afterJobs = content.substring(jobsMatch.index + jobsMatch[0].length);
        const jobNames = [...afterJobs.matchAll(/^  ([a-zA-Z][a-zA-Z0-9_-]*):/gm)].map(m => m[1]);
        if (jobNames.length > 0) {
          console.log(colorize(`  💼 Jobs: ${jobNames.join(', ')}`, 'green'));
        }
      }

      // Check if there are environment secrets referenced
      const secretMatches = [...content.matchAll(/\$\{\{\s*secrets\.([A-Z_]+)\s*\}\}/g)];
      if (secretMatches.length > 0) {
        const secrets = [...new Set(secretMatches.map(m => m[1]))];
        console.log(colorize(`  🔐 Secrets: ${secrets.join(', ')}`, 'yellow'));
      }
    }

    console.log(colorize(`\n${EMOJIS.info} Local workflow files analyzed (GitHub Actions API not accessible)`, 'yellow'));

  } catch (error) {
    console.log(colorize(`${EMOJIS.failure} Erro ao analisar workflows locais: ${error.message}`, 'red'));
  }
}

async function checkRepositoryInfo() {
  console.log(colorize(`\n${EMOJIS.info} REPOSITORY INFO`, 'cyan'));
  console.log(colorize('─'.repeat(50), 'gray'));

  try {
    const repo = await makeRequest(`/repos/${CONFIG.owner}/${CONFIG.repo}`);
    
    console.log(`📁 Repository: ${colorize(repo.full_name, 'bright')}`);
    console.log(`🌟 Stars: ${repo.stargazers_count} | 🍴 Forks: ${repo.forks_count}`);
    console.log(`📝 Description: ${repo.description || 'N/A'}`);
    console.log(`🔓 Visibility: ${colorize(repo.private ? 'Private' : 'Public', repo.private ? 'yellow' : 'green')}`);
    console.log(`📅 Updated: ${formatDate(repo.updated_at)}`);

    if (repo.default_branch !== 'main') {
      console.log(colorize(`⚠️  Default branch: ${repo.default_branch} (not 'main')`, 'yellow'));
    }

  } catch (error) {
    console.log(colorize(`${EMOJIS.info} Using local repository information...`, 'yellow'));
    await checkLocalRepositoryInfo();
  }
}

async function checkLocalRepositoryInfo() {
  try {
    console.log(`📁 Repository: ${colorize(`${CONFIG.owner}/${CONFIG.repo}`, 'bright')}`);
    
    // Get remote URL
    try {
      const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
      console.log(`🔗 Remote: ${remoteUrl}`);
    } catch (e) {
      console.log(`🔗 Remote: ${colorize('N/A (not in git repo)', 'gray')}`);
    }

    // Get current branch
    try {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      console.log(`🌿 Current branch: ${colorize(currentBranch, 'green')}`);
    } catch (e) {
      console.log(`🌿 Current branch: ${colorize('N/A', 'gray')}`);
    }

    // Get last commit info
    try {
      const lastCommit = execSync('git log -1 --pretty=format:"%h - %s (%cr by %an)"', { encoding: 'utf8' }).trim();
      console.log(`📝 Last commit: ${colorize(lastCommit, 'gray')}`);
    } catch (e) {
      console.log(`📝 Last commit: ${colorize('N/A', 'gray')}`);
    }

    // Count commits
    try {
      const commitCount = execSync('git rev-list --all --count', { encoding: 'utf8' }).trim();
      console.log(`📊 Total commits: ${commitCount}`);
    } catch (e) {
      console.log(`📊 Total commits: ${colorize('N/A', 'gray')}`);
    }

    // Check git status
    try {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
      if (gitStatus) {
        const lines = gitStatus.split('\n').length;
        console.log(colorize(`⚠️  Working directory has ${lines} uncommitted changes`, 'yellow'));
      } else {
        console.log(colorize(`✅ Working directory is clean`, 'green'));
      }
    } catch (e) {
      console.log(`📋 Git status: ${colorize('N/A', 'gray')}`);
    }

  } catch (error) {
    console.log(colorize(`${EMOJIS.failure} Erro ao obter informações locais: ${error.message}`, 'red'));
  }
}

async function main() {
  console.log(colorize(`${EMOJIS.rocket} GITHUB STATUS CHECKER`, 'bright'));
  console.log(colorize(`Checking ${CONFIG.owner}/${CONFIG.repo}`, 'gray'));
  console.log(colorize('═'.repeat(60), 'gray'));

  if (!CONFIG.token) {
    console.log(colorize(`${EMOJIS.warning} GITHUB_TOKEN não configurado - rate limits podem aplicar`, 'yellow'));
  }

  if (CONFIG.summaryMode) {
    console.log(colorize('📋 SUMMARY MODE', 'cyan'));
    await generateSummaryReport();
  } else {
    await checkRepositoryInfo();
    await checkBranches();
    await checkWorkflows();
  }

  console.log(colorize('\n✨ Status check completed!', 'green'));
}

async function generateSummaryReport() {
  console.log(colorize('─'.repeat(50), 'gray'));
  
  // Quick repository status
  try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    
    console.log(`📁 ${colorize(`${CONFIG.owner}/${CONFIG.repo}`, 'bright')}`);
    console.log(`🌿 Branch: ${colorize(currentBranch, 'green')}`);
    
    if (gitStatus) {
      const changeCount = gitStatus.split('\n').length;
      console.log(`📝 Changes: ${colorize(`${changeCount} uncommitted`, 'yellow')}`);
    } else {
      console.log(`📝 Changes: ${colorize('working directory clean', 'green')}`);
    }
    
  } catch (e) {
    console.log(`📁 Repository: ${colorize('Git info not available', 'gray')}`);
  }

  // Count workflows
  try {
    const fs = require('fs');
    const path = require('path');
    const workflowDir = path.join(process.cwd(), '.github', 'workflows');
    
    if (fs.existsSync(workflowDir)) {
      const workflowFiles = fs.readdirSync(workflowDir).filter(file => 
        file.endsWith('.yml') || file.endsWith('.yaml')
      );
      console.log(`⚙️ Workflows: ${colorize(`${workflowFiles.length} configured`, 'blue')}`);
    } else {
      console.log(`⚙️ Workflows: ${colorize('No workflows found', 'gray')}`);
    }
  } catch (e) {
    console.log(`⚙️ Workflows: ${colorize('Unable to check', 'gray')}`);
  }

  // Quick health check
  console.log(colorize('\n🏥 HEALTH CHECK:', 'cyan'));
  console.log(`${EMOJIS.success} Local git repository: OK`);
  
  try {
    const fs = require('fs');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`${EMOJIS.success} Package.json: ${packageJson.name || 'OK'}`);
  } catch (e) {
    console.log(`${EMOJIS.warning} Package.json: Not found or invalid`);
  }

  try {
    const fs = require('fs');
    if (fs.existsSync('.github/workflows/ci.yml') || fs.existsSync('.github/workflows/build.yml')) {
      console.log(`${EMOJIS.success} CI/CD: Configured`);
    } else {
      console.log(`${EMOJIS.warning} CI/CD: No standard workflows found`);
    }
  } catch (e) {
    console.log(`${EMOJIS.info} CI/CD: Unable to verify`);
  }
  
  console.log(colorize('─'.repeat(50), 'gray'));
}

// Auto-detect repository info from git if not provided
function detectRepository() {
  try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    const match = remoteUrl.match(/github\.com[\/:]([^\/]+)\/([^\/\s]+?)(\.git)?$/);
    
    if (match) {
      CONFIG.owner = CONFIG.owner || match[1];
      CONFIG.repo = CONFIG.repo || match[2];
    }
  } catch (e) {
    // Git not available or not in a git repo, use defaults
  }
}

if (require.main === module) {
  detectRepository();
  main().catch(error => {
    console.error(colorize(`${EMOJIS.failure} Fatal error: ${error.message}`, 'red'));
    process.exit(1);
  });
}

module.exports = { 
  checkBranches, 
  checkWorkflows, 
  checkRepositoryInfo, 
  checkLocalBranches, 
  checkLocalWorkflows, 
  checkLocalRepositoryInfo 
};