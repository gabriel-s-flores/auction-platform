param(
  [ValidateSet("development", "staging")]
  [string]$Environment = "development"
)

$ErrorActionPreference = "Stop"

$scriptName = if ($Environment -eq "staging") {
  "db:migrate:api:staging"
} else {
  "db:migrate:api:development"
}

Write-Host "[migrate] Executando migrations para $Environment ($scriptName)" -ForegroundColor Cyan
bun run $scriptName

Write-Host "[migrate] Concluído" -ForegroundColor Green
