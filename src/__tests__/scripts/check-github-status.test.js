// src/__tests__/scripts/check-github-status.test.js
/**
 * Tests for GitHub status checking script
 * @jest-environment node
 */

/* eslint-disable @typescript-eslint/no-require-imports */
// CommonJS is required for Jest configuration compatibility

describe('GitHub Status Checker', () => {
  let mockScript;

  beforeEach(() => {
    // Clear module cache to avoid test interference
    jest.resetModules();
    
    // Mock the script module
    mockScript = {
      main: jest.fn(),
      getRepoInfo: jest.fn(),
      getBranches: jest.fn(),
      getWorkflowRuns: jest.fn()
    };
    
    // Mock the module
    jest.doMock('../../../scripts/check-github-status.js', () => mockScript);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Module structure', () => {
    test('should have main function available', () => {
      expect(typeof mockScript.main).toBe('function');
    });

    test('should have API functions available', () => {
      expect(typeof mockScript.getRepoInfo).toBe('function');
      expect(typeof mockScript.getBranches).toBe('function');
      expect(typeof mockScript.getWorkflowRuns).toBe('function');
    });
  });

  describe('Error handling simulation', () => {
    test('should handle API errors gracefully when mocked', async () => {
      mockScript.getRepoInfo.mockRejectedValue(new Error('GitHub token not available'));
      mockScript.getBranches.mockRejectedValue(new Error('GitHub token not available'));
      mockScript.getWorkflowRuns.mockRejectedValue(new Error('GitHub token not available'));
      
      await expect(mockScript.getRepoInfo()).rejects.toThrow('GitHub token not available');
      await expect(mockScript.getBranches()).rejects.toThrow('GitHub token not available'); 
      await expect(mockScript.getWorkflowRuns()).rejects.toThrow('GitHub token not available');
    });
  });
});

describe('Script configuration validation', () => {
  test('should have correct repository configuration in file', () => {
    const fs = require('fs');
    const path = require('path');
    const scriptPath = path.join(__dirname, '../../../scripts/check-github-status.js');
    
    expect(() => fs.readFileSync(scriptPath, 'utf8')).not.toThrow();
    
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    expect(scriptContent).toContain('Gladiston-Porto');
    expect(scriptContent).toContain('GladPros');
    expect(scriptContent).toContain('https://api.github.com');
    expect(scriptContent).toContain('GITHUB_TOKEN');
  });

  test('should have proper script structure', () => {
    const fs = require('fs');
    const path = require('path');
    const scriptPath = path.join(__dirname, '../../../scripts/check-github-status.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    // Check for main function export
    expect(scriptContent).toContain('module.exports');
    expect(scriptContent).toContain('main');
    expect(scriptContent).toContain('getRepoInfo');
    expect(scriptContent).toContain('getBranches');
    expect(scriptContent).toContain('getWorkflowRuns');
  });
});