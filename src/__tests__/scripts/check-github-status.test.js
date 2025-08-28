/**
 * Test for GitHub Status Checker
 */

const { 
  checkLocalBranches, 
  checkLocalWorkflows, 
  checkLocalRepositoryInfo 
} = require('../../../scripts/check-github-status');

// Mock console.log to capture output
let logOutput = [];
const originalLog = console.log;
console.log = (...args) => {
  logOutput.push(args.join(' '));
};

describe('GitHub Status Checker', () => {
  beforeEach(() => {
    logOutput = [];
  });

  afterAll(() => {
    console.log = originalLog;
  });

  test('should check local repository info', async () => {
    await checkLocalRepositoryInfo();
    
    // Should have some repository information
    expect(logOutput.length).toBeGreaterThan(0);
    
    // Should mention the repository
    const repoMention = logOutput.find(line => 
      line.includes('Repository:') && line.includes('GladPros')
    );
    expect(repoMention).toBeDefined();
  });

  test('should analyze local workflows', async () => {
    await checkLocalWorkflows();
    
    // Should have found workflows
    expect(logOutput.length).toBeGreaterThan(0);
    
    // Should mention CI workflow
    const ciWorkflow = logOutput.find(line => 
      line.includes('CI') && line.includes('📄')
    );
    expect(ciWorkflow).toBeDefined();
  });

  test('should check local branches', async () => {
    await checkLocalBranches();
    
    // Should have some output
    expect(logOutput.length).toBeGreaterThan(0);
    
    // Should show some branch or info message
    const hasOutput = logOutput.some(line => 
      line.includes('-') || line.includes('Local git') || line.includes('No remote')
    );
    expect(hasOutput).toBe(true);
  });

  test('should handle missing directories gracefully', async () => {
    // This should not throw
    await expect(checkLocalWorkflows()).resolves.not.toThrow();
    await expect(checkLocalBranches()).resolves.not.toThrow();
    await expect(checkLocalRepositoryInfo()).resolves.not.toThrow();
  });
});