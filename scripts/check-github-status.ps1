# Verifica o status dos branches e checks do GitHub Actions
# Uso:
#   $env:GITHUB_TOKEN='ghp_xxx'; .\scripts\check-github-status.ps1

param(
    [string]$Owner = "Gladiston-Porto",
    [string]$Repo = "GladPros"
)

# Configuração de cores
$Red = [ConsoleColor]::Red
$Green = [ConsoleColor]::Green
$Yellow = [ConsoleColor]::Yellow
$Blue = [ConsoleColor]::Cyan
$White = [ConsoleColor]::White

function Write-ColorText {
    param(
        [string]$Text,
        [ConsoleColor]$Color = [ConsoleColor]::White
    )
    Write-Host $Text -ForegroundColor $Color
}

function Get-StatusColor {
    param([string]$Status)
    switch ($Status.ToLower()) {
        {$_ -in "success", "completed"} { return $Green }
        {$_ -in "failure", "failed", "error"} { return $Red }
        {$_ -in "pending", "in_progress", "queued"} { return $Yellow }
        default { return $White }
    }
}

function Format-GitHubTime {
    param([string]$Timestamp)
    if ($Timestamp -and $Timestamp -ne "null") {
        try {
            $date = [DateTime]::Parse($Timestamp)
            return $date.ToString("dd/MM/yyyy HH:mm:ss")
        } catch {
            return $Timestamp
        }
    }
    return "N/A"
}

# Verificar token de autenticação
$token = $env:GITHUB_TOKEN
if (-not $token) {
    Write-ColorText "ERROR: defina GITHUB_TOKEN environment variable com permissão repo:status" $Red
    Write-ColorText "Exemplo: `$env:GITHUB_TOKEN='ghp_xxx'; .\scripts\check-github-status.ps1" $White
    exit 1
}

$headers = @{
    'Authorization' = "token $token"
    'Accept' = 'application/vnd.github+json'
    'User-Agent' = 'GladPros-StatusChecker'
}

Write-ColorText "🔍 Verificando status dos branches e CI/CD do repositório $Owner/$Repo..." $Blue
Write-Host ""

function Invoke-GitHubApi {
    param(
        [string]$Endpoint,
        [hashtable]$Headers
    )
    $url = "https://api.github.com/repos/$Owner/$Repo$Endpoint"
    try {
        return Invoke-RestMethod -Uri $url -Headers $Headers -Method Get
    } catch {
        Write-ColorText "❌ Erro na API: $($_.Exception.Message)" $Red
        return $null
    }
}

# Status dos Branches
Write-ColorText "📋 Status dos Branches:" $Blue
Write-ColorText "==================================" $White

$branches = Invoke-GitHubApi -Endpoint "/branches" -Headers $headers
if ($branches) {
    $mainBranches = $branches | Where-Object { $_.name -in @("main", "master", "develop", "staging") }
    foreach ($branch in $mainBranches) {
        $protectedStatus = if ($branch.protected) { "🔒 Protected" } else { "🔓 Open" }
        $commitSha = $branch.commit.sha.Substring(0, 7)
        $commitDate = Format-GitHubTime $branch.commit.commit.author.date
        Write-Host "  " -NoNewline
        Write-ColorText $branch.name $Green -NoNewline
        Write-Host " - $protectedStatus - Commit: $commitSha - $commitDate"
    }
} else {
    Write-ColorText "  ❌ Erro ao obter informações dos branches" $Red
}

Write-Host ""
Write-ColorText "🏃 GitHub Actions Workflows:" $Blue
Write-ColorText "==================================" $White

$workflows = Invoke-GitHubApi -Endpoint "/actions/workflows" -Headers $headers
if ($workflows -and $workflows.workflows) {
    foreach ($workflow in $workflows.workflows) {
        $stateColor = Get-StatusColor $workflow.state
        Write-Host "  " -NoNewline
        Write-ColorText $workflow.name $stateColor -NoNewline
        Write-Host " - Status: " -NoNewline
        Write-ColorText $workflow.state $stateColor
        
        # Obter runs recentes para este workflow
        $runs = Invoke-GitHubApi -Endpoint "/actions/workflows/$($workflow.id)/runs?per_page=3" -Headers $headers
        if ($runs -and $runs.workflow_runs) {
            foreach ($run in $runs.workflow_runs[0..2]) {
                $runStatus = if ($run.conclusion) { $run.conclusion } else { $run.status }
                $statusColor = Get-StatusColor $runStatus
                $runDate = Format-GitHubTime $run.created_at
                Write-Host "    └─ " -NoNewline
                Write-ColorText $runStatus $statusColor -NoNewline
                Write-Host " - Branch: $($run.head_branch) - $runDate"
            }
        }
        Write-Host ""
    }
} else {
    Write-ColorText "  ❌ Erro ao obter informações dos workflows" $Red
}

Write-ColorText "📊 Resumo de Status Checks:" $Blue
Write-ColorText "==================================" $White

$mainBranch = "main"
$statusChecks = Invoke-GitHubApi -Endpoint "/commits/$mainBranch/status" -Headers $headers

if ($statusChecks) {
    $overallState = $statusChecks.state
    $totalCount = $statusChecks.total_count
    
    $stateColor = Get-StatusColor $overallState
    Write-Host "  Branch $mainBranch`: " -NoNewline
    Write-ColorText $overallState $stateColor -NoNewline
    Write-Host " ($totalCount checks)"
    
    if ($totalCount -gt 0 -and $statusChecks.statuses) {
        foreach ($status in $statusChecks.statuses) {
            $statusColor = Get-StatusColor $status.state
            Write-Host "    └─ $($status.context): " -NoNewline
            Write-ColorText $status.state $statusColor -NoNewline
            Write-Host " - $($status.description)"
        }
    }
} else {
    Write-ColorText "  ⚠️  Nenhum status check encontrado para o branch $mainBranch" $Yellow
}

Write-Host ""
Write-ColorText "🚀 Runs Recentes (últimas 10):" $Blue
Write-ColorText "==================================" $White

$recentRuns = Invoke-GitHubApi -Endpoint "/actions/runs?per_page=10" -Headers $headers
if ($recentRuns -and $recentRuns.workflow_runs) {
    foreach ($run in $recentRuns.workflow_runs) {
        $runStatus = if ($run.conclusion) { $run.conclusion } else { $run.status }
        $statusColor = Get-StatusColor $runStatus
        $runDate = Format-GitHubTime $run.created_at
        Write-Host "  " -NoNewline
        Write-ColorText $runStatus $statusColor -NoNewline
        Write-Host " - $($run.name) ($($run.head_branch)) - $runDate"
    }
} else {
    Write-ColorText "  ❌ Erro ao obter runs recentes" $Red
}

Write-Host ""
Write-ColorText "💾 Artefatos Disponíveis:" $Blue
Write-ColorText "==================================" $White

$artifacts = Invoke-GitHubApi -Endpoint "/actions/artifacts?per_page=10" -Headers $headers
if ($artifacts -and $artifacts.artifacts -and $artifacts.total_count -gt 0) {
    foreach ($artifact in $artifacts.artifacts) {
        $sizeMB = [math]::Round($artifact.size_in_bytes / 1MB, 2)
        $artifactDate = Format-GitHubTime $artifact.created_at
        $expiredStatus = if ($artifact.expired) { 
            Write-ColorText "(Expirado)" $Red -NoNewline 
        } else { 
            Write-ColorText "(Ativo)" $Green -NoNewline 
        }
        Write-Host "  📦 $($artifact.name) - ${sizeMB}MB - $artifactDate " -NoNewline
        if ($artifact.expired) {
            Write-ColorText "(Expirado)" $Red
        } else {
            Write-ColorText "(Ativo)" $Green
        }
    }
} else {
    Write-ColorText "  ⚠️  Nenhum artefato encontrado" $Yellow
}

Write-Host ""
Write-ColorText "✅ Verificação concluída!" $Green
Write-Host ""
Write-ColorText "💡 Dicas:" $Blue
Write-Host "  • Para mais detalhes, acesse: https://github.com/$Owner/$Repo/actions"
Write-Host "  • Para reexecutar workflows falhos, use a interface web do GitHub"
Write-Host "  • Verifique logs específicos clicando nos runs individuais"