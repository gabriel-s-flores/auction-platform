param()

$ErrorActionPreference = "Stop"

function Assert-FileExists {
  param([string]$Path)
  if (-not (Test-Path $Path)) {
    throw "Arquivo obrigatório não encontrado: $Path"
  }
}

Write-Host "[check-env] Validando arquivos de ambiente..." -ForegroundColor Cyan

Assert-FileExists "apps/web/.env.development"
Assert-FileExists "apps/web/.env.staging"
Assert-FileExists "apps/api/.env.development"
Assert-FileExists "apps/api/.env.staging"

Write-Host "[check-env] Ambiente OK." -ForegroundColor Green
