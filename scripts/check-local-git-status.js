#!/usr/bin/env node
// scripts/check-local-git-status.js
// Fallback script to check local git status when GitHub API is not accessible

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

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

function execGitCommand(command) {
  try {
    return execSync(command, { 
      encoding: 'utf8',
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
  } catch (error) {
    return null;
  }
}

function checkLocalGitStatus() {
  console.log(colorize('🌿 GladPros - Status Local do Git', 'bright'));
  console.log(colorize('=' .repeat(40), 'blue'));

  // Check if we're in a git repository
  const isGitRepo = execGitCommand('git rev-parse --is-inside-work-tree');
  if (!isGitRepo) {
    console.log(colorize('❌ Não está em um repositório git', 'red'));
    return;
  }

  // Current branch
  const currentBranch = execGitCommand('git rev-parse --abbrev-ref HEAD');
  console.log(colorize(`\n🌿 Branch atual: ${currentBranch}`, 'green'));

  // Remote URL
  const remoteUrl = execGitCommand('git remote get-url origin');
  if (remoteUrl) {
    console.log(colorize(`📦 Remote: ${remoteUrl}`, 'blue'));
  }

  // Local branches
  const localBranches = execGitCommand('git branch --format="%(refname:short)"');
  if (localBranches) {
    console.log(colorize('\n📋 Branches locais:', 'bright'));
    localBranches.split('\n').forEach(branch => {
      const marker = branch === currentBranch ? colorize('*', 'green') : ' ';
      console.log(`  ${marker} ${branch}`);
    });
  }

  // Remote tracking branches
  const remoteBranches = execGitCommand('git branch -r --format="%(refname:short)"');
  if (remoteBranches) {
    console.log(colorize('\n🌍 Branches remotos:', 'bright'));
    remoteBranches.split('\n').slice(0, 10).forEach(branch => {
      console.log(`  • ${branch}`);
    });
  }

  // Status of working directory
  const status = execGitCommand('git status --porcelain');
  if (status) {
    console.log(colorize('\n📝 Status do working directory:', 'bright'));
    const lines = status.split('\n');
    lines.forEach(line => {
      if (line.startsWith('??')) {
        console.log(colorize(`  + ${line.substring(3)} (não rastreado)`, 'yellow'));
      } else if (line.startsWith(' M')) {
        console.log(colorize(`  ~ ${line.substring(3)} (modificado)`, 'blue'));
      } else if (line.startsWith('M ')) {
        console.log(colorize(`  ✓ ${line.substring(3)} (staged)`, 'green'));
      } else if (line.startsWith(' D')) {
        console.log(colorize(`  - ${line.substring(3)} (removido)`, 'red'));
      } else {
        console.log(`  ${line}`);
      }
    });
  } else {
    console.log(colorize('\n✅ Working directory limpo', 'green'));
  }

  // Last few commits
  const commits = execGitCommand('git log --oneline -5');
  if (commits) {
    console.log(colorize('\n📊 Últimos commits:', 'bright'));
    commits.split('\n').forEach(commit => {
      const [hash, ...messageParts] = commit.split(' ');
      const message = messageParts.join(' ');
      console.log(`  ${colorize(hash, 'yellow')} ${message}`);
    });
  }

  // Check for workflows
  const workflowsDir = '.github/workflows';
  if (fs.existsSync(workflowsDir)) {
    const workflows = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
    if (workflows.length > 0) {
      console.log(colorize('\n⚙️ Workflows configurados:', 'bright'));
      workflows.forEach(workflow => {
        console.log(`  • ${workflow}`);
      });
    }
  }

  // Ahead/behind status
  const aheadBehind = execGitCommand(`git rev-list --count --left-right origin/${currentBranch}...HEAD 2>/dev/null`);
  if (aheadBehind) {
    const [behind, ahead] = aheadBehind.split('\t');
    if (ahead > 0) {
      console.log(colorize(`\n⬆️  ${ahead} commits à frente do remoto`, 'green'));
    }
    if (behind > 0) {
      console.log(colorize(`\n⬇️  ${behind} commits atrás do remoto`, 'yellow'));
    }
    if (ahead === '0' && behind === '0') {
      console.log(colorize('\n✅ Sincronizado com o remoto', 'green'));
    }
  }

  console.log(colorize('\n✅ Verificação local concluída!', 'green'));
  console.log(colorize('=' .repeat(40), 'blue'));
}

function main() {
  checkLocalGitStatus();
}

if (require.main === module) {
  main();
}

module.exports = { checkLocalGitStatus };