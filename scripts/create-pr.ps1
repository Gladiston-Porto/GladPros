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

    $payload = @{ title = $title; head = $head; base = $base; body = $body } | ConvertTo-Json -Depth 6

    $headers = @{ Authorization = "token $token"; Accept = 'application/vnd.github+json' }

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
        $r = $_.Exception.Response
        if ($r -ne $null) {
            $status = $r.StatusCode.Value__
            $stream = $r.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $text = $reader.ReadToEnd()
            Write-Host "STATUS: $status" -ForegroundColor Yellow
            Write-Host $text
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
