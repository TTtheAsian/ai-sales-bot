# Test Build Script for SocialManager
Write-Host "🔧 Testing Build Configuration..." -ForegroundColor Cyan

# Test Server Build
Write-Host "`n📦 Testing Server Build..." -ForegroundColor Magenta
Push-Location "server"
try {
    Write-Host "Installing server dependencies..."
    npm install
    
    Write-Host "Testing server start..."
    # Test if server can start without errors (timeout after 5 seconds)
    $process = Start-Process -FilePath "node" -ArgumentList "index.js" -PassThru -NoNewWindow
    Start-Sleep -Seconds 3
    if (-not $process.HasExited) {
        Write-Host "✅ Server starts successfully" -ForegroundColor Green
        Stop-Process -Id $process.Id -Force
    } else {
        Write-Host "❌ Server failed to start" -ForegroundColor Red
    }
} finally {
    Pop-Location
}

# Test Client Build
Write-Host "`n🎨 Testing Client Build..." -ForegroundColor Green
Push-Location "client"
try {
    Write-Host "Installing client dependencies..."
    npm install
    
    Write-Host "Testing client build..."
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Client builds successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Client build failed" -ForegroundColor Red
    }
} finally {
    Pop-Location
}

Write-Host "`n✅ Build Test Completed!" -ForegroundColor Cyan