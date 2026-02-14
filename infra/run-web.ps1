param(
  [ValidateSet("development", "staging")]
  [string]$Environment = "development"
)

$ErrorActionPreference = "Stop"

$scriptName = if ($Environment -eq "staging") { "dev:web:staging" } else { "dev:web" }

Write-Host "[run-web] Iniciando frontend em $Environment ($scriptName)" -ForegroundColor Cyan
bun run $scriptName
