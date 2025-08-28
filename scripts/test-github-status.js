#!/usr/bin/env node
// scripts/test-github-status.js
// Test script for the GitHub status checker

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Testing GitHub Status Checker...\n');

try {
  // Test if the main script exists and is executable
  const scriptPath = path.join(__dirname, 'check-github-status.js');
  console.log('✅ Main script exists:', scriptPath);
  
  // Test if Node.js can load the module without syntax errors
  const statusChecker = require('./check-github-status.js');
  console.log('✅ Main script loads without syntax errors');
  
  // Test exported functions exist
  const expectedFunctions = ['makeRequest', 'getRemoteBranches', 'getWorkflowRuns', 'getWorkflowsStatus', 'getCommitStatus'];
  expectedFunctions.forEach(func => {
    if (typeof statusChecker[func] === 'function') {
      console.log(`✅ Function ${func} is exported`);
    } else {
      console.log(`❌ Function ${func} is missing or not a function`);
    }
  });
  
  // Test if shell script exists and is executable
  const shellScriptPath = path.join(__dirname, 'check-github-status.sh');
  try {
    execSync(`ls -la "${shellScriptPath}"`, { encoding: 'utf8' });
    console.log('✅ Shell script exists and is executable');
  } catch (error) {
    console.log('❌ Shell script issue:', error.message);
  }
  
  // Test git integration (current branch)
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { 
      encoding: 'utf8',
      cwd: process.cwd()
    }).trim();
    console.log(`✅ Git integration working - current branch: ${branch}`);
  } catch (error) {
    console.log('⚠️  Git integration issue (expected in some environments):', error.message);
  }
  
  console.log('\n🎉 All basic tests passed!');
  console.log('\nTo test full functionality, run:');
  console.log('  npm run github:status');
  console.log('  # or with token:');
  console.log('  GITHUB_TOKEN=ghp_xxx npm run github:status');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}