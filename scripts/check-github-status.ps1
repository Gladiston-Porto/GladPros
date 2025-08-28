# scripts/check-github-status.ps1
# Verifica o status dos branches e GitHub Actions CI/CD

Param()

try {
    $token = $env:GITHUB_TOKEN
    if (-not $token) {
        $token = $env:PERSONAL_TOKEN
    }
    
    if (-not $token) {
        Write-Host "❌ ERROR: Set GITHUB_TOKEN or PERSONAL_TOKEN environment variable" -ForegroundColor Red
        Write-Host "   Example: `$env:GITHUB_TOKEN='ghp_xxx'" -ForegroundColor Yellow
        Write-Host "   Then run: powershell scripts/check-github-status.ps1" -ForegroundColor Yellow
        exit 1
    }

    Write-Host "🔍 Iniciando verificação do status do GitHub..." -ForegroundColor Cyan
    Write-Host "   Repositório: Gladiston-Porto/GladPros" -ForegroundColor Gray
    Write-Host ""

    # Get script directory and execute Node.js script
    $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $nodeScript = Join-Path $scriptPath "check-github-status.js"
    
    if (-not (Test-Path $nodeScript)) {
        Write-Host "❌ ERROR: Node.js script not found at $nodeScript" -ForegroundColor Red
        exit 1
    }

    # Execute the Node.js script
    & node $nodeScript
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Script execution failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit $LASTEXITCODE
    }

} catch {
    Write-Host "❌ PowerShell error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor DarkRed
    exit 1
}