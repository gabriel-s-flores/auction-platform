param(
  [ValidateSet("development", "staging")]
  [string]$Environment = "development"
)

$ErrorActionPreference = "Stop"

$scriptName = if ($Environment -eq "staging") { "dev:staging" } else { "dev" }

Write-Host "[run-web] Iniciando frontend em $Environment ($scriptName)..." -ForegroundColor Cyan
bun run --filter @auction/web $scriptName
