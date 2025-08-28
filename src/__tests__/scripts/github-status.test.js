// Test para verificar se os scripts de status do GitHub estão funcionando
// Jest test para validar a estrutura dos scripts

const fs = require('fs');
const path = require('path');

describe('GitHub Status Scripts', () => {
  const scriptsDir = path.join(__dirname, '..', '..', '..', 'scripts');

  test('bash script deve existir e ser executável', () => {
    const bashScript = path.join(scriptsDir, 'check-github-status.sh');
    expect(fs.existsSync(bashScript)).toBe(true);
    
    const stats = fs.statSync(bashScript);
    expect(stats.mode & parseInt('111', 8)).toBeGreaterThan(0); // Verificar se é executável
  });

  test('powershell script deve existir', () => {
    const psScript = path.join(scriptsDir, 'check-github-status.ps1');
    expect(fs.existsSync(psScript)).toBe(true);
  });

  test('node.js script deve existir e ser executável', () => {
    const nodeScript = path.join(scriptsDir, 'check-github-status.js');
    expect(fs.existsSync(nodeScript)).toBe(true);
    
    const stats = fs.statSync(nodeScript);
    expect(stats.mode & parseInt('111', 8)).toBeGreaterThan(0); // Verificar se é executável
  });

  test('README deve existir', () => {
    const readme = path.join(scriptsDir, 'README-github-status.md');
    expect(fs.existsSync(readme)).toBe(true);
  });

  test('scripts devem conter configurações corretas', () => {
    const nodeScript = path.join(scriptsDir, 'check-github-status.js');
    const content = fs.readFileSync(nodeScript, 'utf8');
    
    expect(content).toContain('OWNER = \'Gladiston-Porto\'');
    expect(content).toContain('REPO = \'GladPros\'');
    expect(content).toContain('GITHUB_TOKEN');
  });

  test('bash script deve conter configurações corretas', () => {
    const bashScript = path.join(scriptsDir, 'check-github-status.sh');
    const content = fs.readFileSync(bashScript, 'utf8');
    
    expect(content).toContain('OWNER="Gladiston-Porto"');
    expect(content).toContain('REPO="GladPros"');
    expect(content).toContain('GITHUB_TOKEN');
  });

  test('node.js script deve validar token ausente', () => {
    const nodeScript = path.join(scriptsDir, 'check-github-status.js');
    const content = fs.readFileSync(nodeScript, 'utf8');
    
    expect(content).toContain('if (!token)');
    expect(content).toContain('process.exit(1)');
  });

  test('scripts devem ter funções de formatação', () => {
    const nodeScript = path.join(scriptsDir, 'check-github-status.js');
    const content = fs.readFileSync(nodeScript, 'utf8');
    
    expect(content).toContain('formatTime');
    expect(content).toContain('getStatusColor');
    expect(content).toContain('colorText');
  });

  test('workflow do GitHub Actions deve existir', () => {
    const workflowFile = path.join(__dirname, '..', '..', '..', '.github', 'workflows', 'github-status-check.yml');
    expect(fs.existsSync(workflowFile)).toBe(true);
  });

  test('package.json deve conter script github:status', () => {
    const packageJson = path.join(__dirname, '..', '..', '..', 'package.json');
    const content = fs.readFileSync(packageJson, 'utf8');
    const pkg = JSON.parse(content);
    
    expect(pkg.scripts['github:status']).toBeDefined();
    expect(pkg.scripts['github:status-node']).toBeDefined();
  });
});