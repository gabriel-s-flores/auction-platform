param(
  [ValidateSet("development", "staging")]
  [string]$Environment = "development"
)

$ErrorActionPreference = "Stop"

$apiPath = "apps/api"
$envFile = if ($Environment -eq "staging") { "$apiPath/.env.staging" } else { "$apiPath/.env.development" }

if (-not (Test-Path $envFile)) {
  throw "Arquivo de ambiente não encontrado: $envFile"
}

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
  throw "psql não encontrado no PATH. Instale PostgreSQL e adicione o diretório bin ao PATH."
}

$envMap = @{}
Get-Content $envFile | ForEach-Object {
  if ($_ -match "^\s*#" -or $_ -match "^\s*$") { return }
  $parts = $_ -split "=", 2
  if ($parts.Count -eq 2) {
    $envMap[$parts[0]] = $parts[1]
  }
}

$pgHost = $envMap["POSTGRES_HOST"]
$pgPort = $envMap["POSTGRES_PORT"]
$pgUser = $envMap["POSTGRES_USER"]
$pgPassword = $envMap["POSTGRES_PASSWORD"]
$pgDb = $envMap["POSTGRES_DB"]

if (-not $pgHost -or -not $pgPort -or -not $pgUser -or -not $pgPassword -or -not $pgDb) {
  throw "Variáveis POSTGRES_HOST/POSTGRES_PORT/POSTGRES_USER/POSTGRES_PASSWORD/POSTGRES_DB são obrigatórias no $envFile"
}

$env:PGPASSWORD = $pgPassword

Write-Host "[db-setup] criando banco (se não existir): $pgDb" -ForegroundColor Cyan
$checkDb = psql -h $pgHost -p $pgPort -U $pgUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$pgDb';"
if (($checkDb | Out-String).Trim() -ne "1") {
  psql -h $pgHost -p $pgPort -U $pgUser -d postgres -c "CREATE DATABASE \"$pgDb\";"
}

Write-Host "[db-setup] gerando prisma client" -ForegroundColor Cyan
bun run --filter @auction/api prisma:generate

Write-Host "[db-setup] executando migrations" -ForegroundColor Cyan
$migrateScript = if ($Environment -eq "staging") {
  "prisma:migrate:deploy:staging"
} else {
  "prisma:migrate:deploy:development"
}
bun run --filter @auction/api $migrateScript

Write-Host "[db-setup] executando seed" -ForegroundColor Cyan
$seedScript = if ($Environment -eq "staging") { "db:seed:staging" } else { "db:seed:development" }
bun run --filter @auction/api $seedScript

Write-Host "[db-setup] concluído" -ForegroundColor Green
