Set-Location $PSScriptRoot
Write-Host "Building TypeScript..."
npx tsc
Write-Host "Starting Alien Invaders at http://localhost:3000"
node server.js
