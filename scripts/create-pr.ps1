Param()
try {
    $token = $env:GITHUB_TOKEN
    if (-not $token) {
        Write-Host "GITHUB_TOKEN not set. Run: $env:GITHUB_TOKEN='ghp_xxx'`nThen run this script." -ForegroundColor Yellow
        exit 1
    }

    $owner = 'Gladiston-Porto'
    $repo = 'GladPros'
    $head = 'chore/refactor-structure'
    $base = 'main'
    $title = 'chore: refactor + fix TypeScript/ESLint issues, add CI and smoke workflows'

    $body = @'
Resumo
- Corrige vários avisos do ESLint e erros de tipagem TypeScript.
- Ajusta helpers e rotas (foco em clientes/propostas) para serem mais robustos a mocks de teste.
- Move declaração de tipos de testes (`jest-dom.d.ts`) para `src/types` para evitar descoberta como suíte de teste.
- Adiciona CI: `.github/workflows/ci.yml` (lint → tsc → tests → build).
- Adiciona workflows manuais: `staging-migrations.yml` e `smoke-e2e.yml`.
- Adiciona `scripts/smoke-test.sh` e `PULL_REQUEST_TEMPLATE.md`.
'@

    $payloadObj = @{ title = $title; head = $head; base = $base; body = $body }
    $payload = $payloadObj | ConvertTo-Json -Depth 6
    Write-Host "Payload:" -ForegroundColor Cyan
    Write-Host $payload

    # Use token auth for classic PAT and include a User-Agent — GitHub API expects a user-agent header
    $headers = @{ Authorization = "token $token"; Accept = 'application/vnd.github+json'; 'User-Agent' = 'GladPros-Script' }

    $url = "https://api.github.com/repos/$owner/$repo/pulls"
    try {
        $resp = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $payload -ContentType 'application/json'
        if ($resp.html_url) {
            Write-Host "PR criado: $($resp.html_url)" -ForegroundColor Green
            exit 0
        } else {
            Write-Host "Falha ao criar PR. Resposta inesperada:" -ForegroundColor Red
            $resp | ConvertTo-Json | Write-Host
            exit 2
        }
    } catch {
        # Try to extract response details from the exception first
        $r = $_.Exception.Response
        if ($r -ne $null) {
            try {
                $status = $r.StatusCode.Value__
            } catch { $status = 'unknown' }
            try {
                $stream = $r.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                $text = $reader.ReadToEnd()
            } catch { $text = $null }
            Write-Host "STATUS: $status" -ForegroundColor Yellow
            if ($text) { Write-Host $text } else { Write-Host "(no response body)" }
            # Also attempt a fallback using Invoke-WebRequest which often exposes headers/content cleanly
            try {
                $resp2 = Invoke-WebRequest -Uri $url -Method Post -Headers $headers -Body $payload -ContentType 'application/json' -ErrorAction Stop
                Write-Host "--- Invoke-WebRequest fallback ---" -ForegroundColor Cyan
                Write-Host "StatusCode: $($resp2.StatusCode)"
                Write-Host "Headers:"; $resp2.Headers | ConvertTo-Json -Depth 3 | Write-Host
                Write-Host "Content:"; if ($resp2.Content) { $resp2.Content } else { Write-Host "(empty)" }
            } catch {
                Write-Host "Invoke-WebRequest fallback failed: $($_.Exception.Message)" -ForegroundColor Red
            }
            exit 4
        } else {
            Write-Host "Erro local: $($_.Exception.Message)" -ForegroundColor Red
            exit 3
        }
    }
} catch {
    Write-Host "Erro inesperado: $($_.Exception.Message)" -ForegroundColor Red
    exit 5
}
