Param()

# Checks GitHub branches and CI/CD workflow status using the REST API
# Usage: Set $env:GITHUB_TOKEN='ghp_xxx' then run this script

try {
    $token = $env:GITHUB_TOKEN
    if (-not $token) {
        Write-Host "❌ GITHUB_TOKEN not set. Run: `$env:GITHUB_TOKEN='ghp_xxx'" -ForegroundColor Red
        Write-Host "Then run this script." -ForegroundColor Yellow
        exit 1
    }

    $owner = 'Gladiston-Porto'
    $repo = 'GladPros'
    
    Write-Host "🔍 Verificando status dos branches e CI/CD do GitHub..." -ForegroundColor Cyan
    Write-Host "Repository: $owner/$repo" -ForegroundColor Cyan
    Write-Host ""

    # Common headers for GitHub API
    $headers = @{ 
        Authorization = "token $token"
        Accept = 'application/vnd.github+json'
        'User-Agent' = 'GladPros-Status-Check'
    }

    Write-Host "📋 BRANCHES STATUS" -ForegroundColor Green
    Write-Host "=================="

    # Get all branches
    $branchesUrl = "https://api.github.com/repos/$owner/$repo/branches"
    try {
        $branchesResp = Invoke-RestMethod -Uri $branchesUrl -Method Get -Headers $headers
        
        foreach ($branch in $branchesResp) {
            $shortSha = $branch.commit.sha.Substring(0, 7)
            $date = $branch.commit.commit.author.date
            Write-Host "📌 $($branch.name) - Commit: $shortSha - $date"
        }
    } catch {
        Write-Host "❌ Erro ao obter branches: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "🚀 CI/CD WORKFLOWS STATUS" -ForegroundColor Green
    Write-Host "========================"

    # Get workflows
    $workflowsUrl = "https://api.github.com/repos/$owner/$repo/actions/workflows"
    try {
        $workflowsResp = Invoke-RestMethod -Uri $workflowsUrl -Method Get -Headers $headers
        
        if ($workflowsResp.workflows.Count -eq 0) {
            Write-Host "⚠️  Nenhum workflow encontrado" -ForegroundColor Yellow
        } else {
            foreach ($workflow in $workflowsResp.workflows) {
                Write-Host ""
                Write-Host "📊 Workflow: $($workflow.name) (ID: $($workflow.id)) - Estado: $($workflow.state)"
                
                # Get recent runs for this workflow
                $runsUrl = "https://api.github.com/repos/$owner/$repo/actions/workflows/$($workflow.id)/runs?per_page=5"
                try {
                    $runsResp = Invoke-RestMethod -Uri $runsUrl -Method Get -Headers $headers
                    
                    foreach ($run in $runsResp.workflow_runs) {
                        $status = if ($run.conclusion) { $run.conclusion } else { "running" }
                        Write-Host "   🔸 $($run.head_branch) - $status - $($run.created_at) - $($run.html_url)"
                    }
                } catch {
                    Write-Host "   ❌ Erro ao obter runs do workflow: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        }
    } catch {
        Write-Host "❌ Erro ao obter workflows: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "📈 WORKFLOW RUNS SUMMARY (últimos 10)" -ForegroundColor Green
    Write-Host "==================================="

    # Get recent workflow runs across all workflows
    $allRunsUrl = "https://api.github.com/repos/$owner/$repo/actions/runs?per_page=10"
    try {
        $allRunsResp = Invoke-RestMethod -Uri $allRunsUrl -Method Get -Headers $headers
        
        foreach ($run in $allRunsResp.workflow_runs) {
            $icon = switch ($run.conclusion) {
                "success" { "✅" }
                "failure" { "❌" }
                "cancelled" { "⚪" }
                default { 
                    if ($run.status -eq "in_progress") { "🔄" } else { "⏳" }
                }
            }
            
            $status = if ($run.conclusion) { $run.conclusion } else { $run.status }
            $date = $run.created_at.Substring(0, 10)
            Write-Host "$icon $($run.workflow_name) - $($run.head_branch) - $status - $date"
        }
    } catch {
        Write-Host "❌ Erro ao obter resumo dos workflow runs: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "🏁 Verificação concluída!" -ForegroundColor Green

} catch {
    Write-Host "❌ Erro geral: $($_.Exception.Message)" -ForegroundColor Red
    exit 2
}