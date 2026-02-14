param(
  [ValidateSet("development", "staging")]
  [string]$Environment = "development"
)

$ErrorActionPreference = "Stop"

$scriptName = if ($Environment -eq "staging") { "dev:watch:staging" } else { "dev:watch" }

Write-Host "[run-api] Gerando cliente Prisma..." -ForegroundColor Cyan
bun run prisma:generate

Write-Host "[run-api] Iniciando backend em $Environment ($scriptName)..." -ForegroundColor Cyan
bun run $scriptName
