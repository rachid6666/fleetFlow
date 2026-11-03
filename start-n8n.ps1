$ErrorActionPreference = 'Stop'

$envFile = Join-Path $PSScriptRoot '.env'
if (-not (Test-Path -LiteralPath $envFile)) {
    throw "Missing .env file: $envFile"
}

$databaseLine = Get-Content -LiteralPath $envFile | Where-Object { $_ -match '^\s*DATABASE_URL\s*=' } | Select-Object -First 1
if (-not $databaseLine) {
    throw 'DATABASE_URL is missing from .env'
}

$databaseUrl = ($databaseLine -replace '^\s*DATABASE_URL\s*=\s*', '').Trim().Trim('"').Trim("'")
$connection = [Uri]$databaseUrl
if ($connection.Scheme -notin @('postgres', 'postgresql')) {
    throw 'DATABASE_URL must be a PostgreSQL connection URL'
}

$userInfo = $connection.UserInfo -split ':', 2
if ($userInfo.Count -ne 2) {
    throw 'DATABASE_URL must include a username and password'
}

$env:DB_TYPE = 'postgresdb'
$env:DB_POSTGRESDB_HOST = $connection.Host
$env:DB_POSTGRESDB_PORT = if ($connection.Port -gt 0) { [string]$connection.Port } else { '5432' }
$env:DB_POSTGRESDB_DATABASE = $connection.AbsolutePath.TrimStart('/')
$env:DB_POSTGRESDB_USER = [Uri]::UnescapeDataString($userInfo[0])
$env:DB_POSTGRESDB_PASSWORD = [Uri]::UnescapeDataString($userInfo[1])
$env:DB_POSTGRESDB_SCHEMA = 'public'
$env:DB_POSTGRESDB_SSL_ENABLED = 'true'
$env:DB_POSTGRESDB_SSL_REJECT_UNAUTHORIZED = 'true'

$env:N8N_HOST = 'localhost'
$env:N8N_PORT = '5678'
$env:N8N_PROTOCOL = 'http'
$env:N8N_SECURE_COOKIE = 'false'

Write-Host 'Starting n8n at http://localhost:5678 using the Neon DATABASE_URL from .env'
n8n
