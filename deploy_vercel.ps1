# deploy_vercel.ps1
# Automating Vercel Deployment for SocialManager

param (
    [string]$VercelToken
)

if (-not $VercelToken) {
    Write-Host "❌ Vercel Token not provided. Please provide a token using the -VercelToken parameter." -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Starting Automated Deployment..." -ForegroundColor Cyan

# Deploy Server (Backend)
Write-Host "`n📦 Deploying Server (Backend)..." -ForegroundColor Magenta
Push-Location "server"
try {
    Write-Host "Deploying to Production..."
    npx vercel --prod --token $VercelToken --yes
} finally {
    Pop-Location
}

# Deploy Client (Frontend)
Write-Host "`n🎨 Deploying Client (Frontend)..." -ForegroundColor Green
Push-Location "client"
try {
    Write-Host "Deploying to Production..."
    npx vercel --prod --token $VercelToken --yes
} finally {
    Pop-Location
}

Write-Host "`n✅ Deployment Script Completed!" -ForegroundColor Cyan
Write-Host "Please check the Vercel Dashboard for final URLs and Environment Variables."
