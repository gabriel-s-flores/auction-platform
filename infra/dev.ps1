param(
  [ValidateSet("development", "staging")]
  [string]$Environment = "development"
)

$ErrorActionPreference = "Stop"

Write-Host "[dev] Iniciando ambiente: $Environment" -ForegroundColor Cyan

$apiScript = if ($Environment -eq "staging") { "dev:api:staging" } else { "dev:api" }
$webScript = if ($Environment -eq "staging") { "dev:web:staging" } else { "dev:web" }

Write-Host "[dev] Subindo API ($apiScript) em nova janela..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "bun run $apiScript"

Write-Host "[dev] Subindo Web ($webScript) nesta janela..." -ForegroundColor Yellow
bun run $webScript
