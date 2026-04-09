Set-Location $PSScriptRoot
Write-Host "Building TypeScript..."
npx tsc
if ($LASTEXITCODE -ne 0) {
    Write-Error "TypeScript build failed. Server not started."
    exit $LASTEXITCODE
}
Write-Host "Starting Alien Invaders at http://localhost:3000"
node server.js
