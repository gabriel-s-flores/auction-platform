param(
  [ValidateSet("development", "staging")]
  [string]$Environment = "development"
)

$ErrorActionPreference = "Stop"

$scriptName = if ($Environment -eq "staging") { "dev:api:staging" } else { "dev:api" }

Write-Host "[run-api] Iniciando backend em $Environment ($scriptName)" -ForegroundColor Cyan
bun run $scriptName
