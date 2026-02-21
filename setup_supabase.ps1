# SocialManager — Supabase 全自動設定腳本
# 執行方式：powershell -ExecutionPolicy Bypass -File setup_supabase.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   SocialManager Supabase Auto-Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: 取得 Personal Access Token
Write-Host "[1/6] 開啟 Supabase Token 頁面..." -ForegroundColor Yellow
Start-Process "https://supabase.com/dashboard/account/tokens"
Start-Sleep -Seconds 2
$SUPABASE_TOKEN = Read-Host "請在瀏覽器建立 Personal Access Token 後貼到這裡"

if (-not $SUPABASE_TOKEN.Trim()) {
    Write-Host "錯誤：未輸入 Token" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Token 已取得" -ForegroundColor Green

# Step 2: 取得 Org ID
Write-Host "[2/6] 取得組織資訊..." -ForegroundColor Yellow
$H = @{ Authorization = "Bearer $SUPABASE_TOKEN" }

$orgs = Invoke-RestMethod "https://api.supabase.com/v1/organizations" -Headers $H
if ($orgs.Count -eq 0) { Write-Host "錯誤：查無組織" -ForegroundColor Red; exit 1 }
$ORG_ID = $orgs[0].id
Write-Host "OK: 組織 $($orgs[0].name) ($ORG_ID)" -ForegroundColor Green

# Step 3: 建立或取得專案
Write-Host "[3/6] 建立 Supabase 專案..." -ForegroundColor Yellow
$NAME = "social-manager-bot"
$DB_PASS = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 16 | ForEach-Object { [char]$_ })

$existing = Invoke-RestMethod "https://api.supabase.com/v1/projects" -Headers $H |
Where-Object { $_.name -eq $NAME }

if ($existing) {
    $PROJECT_ID = $existing.id
    Write-Host "OK: 已有專案 (ID: $PROJECT_ID)，跳過建立" -ForegroundColor Green
}
else {
    $createBody = @{
        name            = $NAME
        organization_id = $ORG_ID
        plan            = "free"
        region          = "ap-southeast-1"
        db_pass         = $DB_PASS
    } | ConvertTo-Json

    $proj = Invoke-RestMethod "https://api.supabase.com/v1/projects" `
        -Method POST -Headers $H -ContentType "application/json" -Body $createBody
    $PROJECT_ID = $proj.id
    Write-Host "OK: 專案建立中 (ID: $PROJECT_ID)，等待就緒..." -ForegroundColor Green

    $waited = 0
    $projStatus = ""
    while ($projStatus -ne "ACTIVE_HEALTHY" -and $waited -lt 120) {
        Start-Sleep -Seconds 5
        $waited += 5
        $check = Invoke-RestMethod "https://api.supabase.com/v1/projects/$PROJECT_ID" -Headers $H
        $projStatus = $check.status
        Write-Host "   等待中... $projStatus (${waited}s)" -ForegroundColor Gray
    }
    Write-Host "OK: 專案已就緒" -ForegroundColor Green
}

# Step 4: 取得 API Keys
Write-Host "[4/6] 取得 API Keys..." -ForegroundColor Yellow
$keys = Invoke-RestMethod "https://api.supabase.com/v1/projects/$PROJECT_ID/api-keys" -Headers $H
$SERVICE_KEY = ($keys | Where-Object { $_.name -eq "service_role" }).api_key
$SUPABASE_URL = "https://$PROJECT_ID.supabase.co"
Write-Host "OK: URL = $SUPABASE_URL" -ForegroundColor Green

# Step 5: 套用 Schema
Write-Host "[5/6] 套用資料庫 Schema..." -ForegroundColor Yellow
$schemaFile = Join-Path $PSScriptRoot "server\supabase_schema.sql"
if (Test-Path $schemaFile) {
    $sql = Get-Content $schemaFile -Raw -Encoding UTF8
    $sqlBody = @{ query = $sql } | ConvertTo-Json -Depth 10
    try {
        Invoke-RestMethod "https://api.supabase.com/v1/projects/$PROJECT_ID/database/query" `
            -Method POST -Headers $H -ContentType "application/json" -Body $sqlBody | Out-Null
        Write-Host "OK: Schema 套用成功" -ForegroundColor Green
    }
    catch {
        Write-Host "Warning: Schema 套用失敗 (可能已存在): $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
else {
    Write-Host "Warning: 找不到 schema 檔案，跳過" -ForegroundColor Yellow
}

# Step 6: 設定 Vercel 環境變數並重新部署
Write-Host "[6/6] 設定 Vercel 並重新部署後端..." -ForegroundColor Yellow
$serverDir = Join-Path $PSScriptRoot "server"
Push-Location $serverDir

$env_url = $SUPABASE_URL
$env_key = $SERVICE_KEY

Write-Output $env_url | vercel env add SUPABASE_URL production --yes 2>&1 | Out-Null
Write-Output $env_key | vercel env add SUPABASE_KEY production --yes 2>&1 | Out-Null
Write-Host "OK: 環境變數已設定" -ForegroundColor Green

Write-Host "   部署後端中（約 30 秒）..." -ForegroundColor Gray
$deployOut = vercel --prod --yes 2>&1
$deployOut | ForEach-Object { if ($_ -match "Production:") { Write-Host "   $_" -ForegroundColor Cyan } }

Pop-Location

# 完成
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "   設定完成！所有服務已上線 }" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Supabase: $SUPABASE_URL" -ForegroundColor Cyan
Write-Host "  Dashboard: https://supabase.com/dashboard/project/$PROJECT_ID" -ForegroundColor Gray
Write-Host ""
Write-Host "前端: https://client-five-silk-25.vercel.app" -ForegroundColor Cyan
Write-Host "後端: https://server-five-lemon-76.vercel.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "Webhook Callback URL: https://server-five-lemon-76.vercel.app/webhook" -ForegroundColor White
Write-Host "Verify Token: my_secret_token" -ForegroundColor White
Write-Host ""
