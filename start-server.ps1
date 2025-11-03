# Start Monstrens Natt Server
Write-Host "Starting Monstrens Natt Server..." -ForegroundColor Cyan
Write-Host ""

# Use full path to Node.js
$nodePath = "C:\Program Files\nodejs\node.exe"

# Check if Node.js exists
if (-not (Test-Path $nodePath)) {
    Write-Host "ERROR: Node.js not found at: $nodePath" -ForegroundColor Red
    Write-Host "Try to find Node.js with: where.exe node" -ForegroundColor Yellow
    exit 1
}

# Check if server.js exists
if (-not (Test-Path "server.js")) {
    Write-Host "ERROR: server.js not found in this folder" -ForegroundColor Red
    Write-Host "Current folder: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# Start the server
Write-Host "OK: Node.js found: $nodePath" -ForegroundColor Green
Write-Host "OK: server.js found" -ForegroundColor Green
Write-Host ""
Write-Host "Starting server on http://localhost:3000" -ForegroundColor Cyan
Write-Host "Network access on http://0.0.0.0:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

& $nodePath server.js
