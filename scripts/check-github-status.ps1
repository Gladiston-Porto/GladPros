# PowerShell script para verificar status dos branches e CI/CD do GitHub
# 
# Usage:
#   $env:GITHUB_TOKEN='ghp_xxx'
#   .\scripts\check-github-status.ps1
# 
# Features:
# - Lista todos os branches do repositório
# - Verifica status dos workflows do GitHub Actions
# - Mostra status dos checks para cada branch
# - Exibe output colorido para melhor visualização

Param()

# Configurações do repositório
$OWNER = 'Gladiston-Porto'
$REPO = 'GladPros'

# Função para formatar status com cores
function Format-Status {
    param($status)
    switch ($status) {
        'success' { return '✅ SUCCESS' }
        'failure' { return '❌ FAILURE' }
        'pending' { return '⏳ PENDING' }
        'in_progress' { return '🔄 IN PROGRESS' }
        'completed' { return '✅ COMPLETED' }
        'cancelled' { return '⚠️ CANCELLED' }
        'queued' { return '📋 QUEUED' }
        'requested' { return '📋 REQUESTED' }
        'waiting' { return '⏰ WAITING' }
        default { return "❓ $($status ?? 'UNKNOWN')".ToUpper() }
    }
}

# Função para formatar tempo relativo
function Format-TimeAgo {
    param($dateString)
    $now = Get-Date
    $date = [datetime]::Parse($dateString)
    $diff = $now - $date
    
    if ($diff.TotalMinutes -lt 1) { return 'agora mesmo' }
    if ($diff.TotalMinutes -lt 60) { return "$([math]::Floor($diff.TotalMinutes))m atrás" }
    if ($diff.TotalHours -lt 24) { return "$([math]::Floor($diff.TotalHours))h atrás" }
    return "$([math]::Floor($diff.TotalDays))d atrás"
}

# Função para fazer requisições à API do GitHub
function Invoke-GitHubApi {
    param($Uri, $Token)
    
    $headers = @{
        'User-Agent' = 'GladPros-Status-Checker'
        'Accept' = 'application/vnd.github+json'
        'Authorization' = "token $Token"
        'X-GitHub-Api-Version' = '2022-11-28'
    }
    
    try {
        return Invoke-RestMethod -Uri $Uri -Headers $headers -ErrorAction Stop
    }
    catch {
        throw "Erro na API do GitHub: $($_.Exception.Message)"
    }
}

try {
    $token = $env:GITHUB_TOKEN
    if (-not $token) {
        Write-Host "❌ ERRO: Defina GITHUB_TOKEN com permissões de repo" -ForegroundColor Red
        Write-Host "Exemplo: `$env:GITHUB_TOKEN='ghp_xxx'; .\scripts\check-github-status.ps1" -ForegroundColor DarkGray
        exit 1
    }

    Write-Host "🔍 Verificando status do GitHub para $OWNER/$REPO" -ForegroundColor Cyan
    Write-Host ""

    # 1. Buscar branches
    Write-Host "📋 BRANCHES:" -ForegroundColor White
    $baseUri = "https://api.github.com/repos/$OWNER/$REPO"
    $branches = Invoke-GitHubApi -Uri "$baseUri/branches?per_page=50" -Token $token

    foreach ($branch in $branches) {
        $branchName = $branch.name
        $sha = $branch.commit.sha.Substring(0, 7)
        
        Write-Host ""
        Write-Host "📌 $branchName" -ForegroundColor Blue -NoNewline
        Write-Host " ($sha)" -ForegroundColor DarkGray

        try {
            # Buscar workflow runs recentes para este branch
            $workflowRuns = Invoke-GitHubApi -Uri "$baseUri/actions/runs?branch=$([uri]::EscapeDataString($branchName))&per_page=10" -Token $token -ErrorAction SilentlyContinue
            
            if ($workflowRuns.workflow_runs -and $workflowRuns.workflow_runs.Count -gt 0) {
                Write-Host "   🔧 Workflows Recentes:" -ForegroundColor White
                $workflowRuns.workflow_runs | Select-Object -First 3 | ForEach-Object {
                    $conclusion = if ($_.conclusion) { $_.conclusion } else { $_.status }
                    $status = Format-Status -status $conclusion
                    $timeAgo = Format-TimeAgo -dateString $_.created_at
                    Write-Host "      $status $($_.name) - $timeAgo"
                }
            }

            # Buscar check runs
            $checkRuns = Invoke-GitHubApi -Uri "$baseUri/commits/$($branch.commit.sha)/check-runs" -Token $token -ErrorAction SilentlyContinue
            
            if ($checkRuns.check_runs -and $checkRuns.check_runs.Count -gt 0) {
                Write-Host "   ✓ Check Runs:" -ForegroundColor White
                $checkRuns.check_runs | ForEach-Object {
                    $conclusion = if ($_.conclusion) { $_.conclusion } else { $_.status }
                    $status = Format-Status -status $conclusion
                    Write-Host "      $status $($_.name)"
                }
            }

            # Buscar status checks
            $statuses = Invoke-GitHubApi -Uri "$baseUri/commits/$($branch.commit.sha)/status" -Token $token -ErrorAction SilentlyContinue
            
            if ($statuses.statuses -and $statuses.statuses.Count -gt 0) {
                Write-Host "   🔍 Status Checks:" -ForegroundColor White
                $statuses.statuses | Select-Object -First 3 | ForEach-Object {
                    $status = Format-Status -status $_.state
                    $description = if ($_.description) { $_.description } else { 'No description' }
                    Write-Host "      $status $($_.context) - $description"
                }
            }

            # Se não houver checks/workflows
            if ((-not $workflowRuns.workflow_runs -or $workflowRuns.workflow_runs.Count -eq 0) -and 
                (-not $checkRuns.check_runs -or $checkRuns.check_runs.Count -eq 0) -and 
                (-not $statuses.statuses -or $statuses.statuses.Count -eq 0)) {
                Write-Host "   📝 Nenhum workflow ou check encontrado" -ForegroundColor DarkGray
            }
        }
        catch {
            Write-Host "   ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    # 2. Resumo geral dos workflows
    Write-Host ""
    Write-Host "🏗️ RESUMO DOS WORKFLOWS:" -ForegroundColor Magenta
    
    $workflows = Invoke-GitHubApi -Uri "$baseUri/actions/workflows" -Token $token
    
    foreach ($workflow in $workflows.workflows) {
        Write-Host ""
        Write-Host "⚙️ $($workflow.name)" -ForegroundColor White
        
        $stateColor = if ($workflow.state -eq 'active') { 'Green' } else { 'Yellow' }
        $stateText = if ($workflow.state -eq 'active') { 'Ativo' } else { 'Inativo' }
        Write-Host "   Estado: $stateText" -ForegroundColor $stateColor
        
        try {
            $runs = Invoke-GitHubApi -Uri "$baseUri/actions/workflows/$($workflow.id)/runs?per_page=5" -Token $token
            
            if ($runs.workflow_runs -and $runs.workflow_runs.Count -gt 0) {
                Write-Host "   Execuções Recentes:" -ForegroundColor White
                $runs.workflow_runs | Select-Object -First 3 | ForEach-Object {
                    $conclusion = if ($_.conclusion) { $_.conclusion } else { $_.status }
                    $status = Format-Status -status $conclusion
                    $timeAgo = Format-TimeAgo -dateString $_.created_at
                    $branch = if ($_.head_branch) { $_.head_branch } else { 'unknown' }
                    Write-Host "      $status $branch - $timeAgo"
                }
            } else {
                Write-Host "   📝 Nenhuma execução encontrada" -ForegroundColor DarkGray
            }
        }
        catch {
            Write-Host "   ❌ Erro ao buscar execuções: $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    Write-Host ""
    Write-Host "✅ Verificação concluída com sucesso!" -ForegroundColor Green

} catch {
    Write-Host "❌ Erro durante a verificação: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}