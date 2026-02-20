# Vercel Deployment Guide for SocialManager

## 修復的問題 ✅

1. **Server 端問題修復:**
   - 移除了重複的 `app.listen()` 調用
   - 移除了重複的路由處理器
   - 添加了適當的 npm scripts
   - 優化了 vercel.json 配置

2. **Client 端問題修復:**
   - 更新了 Next.js 到 v14 (兼容版本)
   - 更新了 React 到 v18 (穩定版本)
   - 修復了 ESLint 版本衝突

3. **部署配置優化:**
   - 改進了 serverless 函數配置
   - 優化了路由匹配規則
   - 添加了適當的構建腳本

## 手動部署步驟

### 1. 部署 Server (後端)

```bash
cd server

# 安裝依賴
npm install

# 登錄 Vercel (如果尚未登錄)
npx vercel login

# 鏈接項目 (首次部署)
npx vercel link

# 部署到生產環境
npx vercel --prod
```

### 2. 部署 Client (前端)

```bash
cd client

# 安裝依賴
npm install

# 鏈接項目 (首次部署)
npx vercel link

# 部署到生產環境
npx vercel --prod
```

### 3. 環境變量配置

在 Vercel Dashboard 中設置以下環境變量:

**Server 端需要:**
- `NODE_ENV=production`
- `SUPABASE_URL=your_supabase_url`
- `SUPABASE_KEY=your_supabase_key`
- `META_API_TOKEN=your_meta_api_token`

**Client 端需要:**
- `NEXT_PUBLIC_API_URL=your_server_url`

## 測試部署

運行測試腳本來驗證構建:
```powershell
.\test_build.ps1
```

## 常見問題

1. **依賴衝突**: 如果遇到 npm 安裝問題，使用 `npm install --legacy-peer-deps`
2. **構建失敗**: 檢查 Node.js 版本是否兼容 (建議 v18+)
3. **環境變量**: 確保所有必需的環境變量都已正確設置

## 驗證部署

部署完成後:
1. 訪問前端 URL 檢查界面
2. 測試 API 端點是否正常工作
3. 檢查 Vercel Functions 日誌是否有錯誤