param()

$ErrorActionPreference = "Stop"

Write-Host "[setup] Verificando Bun..." -ForegroundColor Cyan
if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
  throw "Bun não encontrado. Instale em https://bun.sh antes de continuar."
}

Write-Host "[setup] Instalando dependências..." -ForegroundColor Cyan
bun install

Write-Host "[setup] Instalando hooks do Husky..." -ForegroundColor Cyan
bun run prepare

Write-Host "[setup] Gerando Prisma Client da API..." -ForegroundColor Cyan
bun run --filter @auction/api prisma:generate

Write-Host "[setup] Concluído." -ForegroundColor Green
