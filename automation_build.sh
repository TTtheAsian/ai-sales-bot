#!/bin/bash
# 自動化專案構建腳本

echo "Step 1: Initializing Next.js Frontend..."
# Added --use-npm and --yes for non-interactive mode
npx create-next-app@latest client --tailwind --eslint --app --use-npm --yes

echo "Step 2: Initializing Express Backend..."
mkdir -p server && cd server
npm init -y
npm install express axios dotenv @supabase/supabase-js cors
# Create empty files
touch index.js 
# Create .env with default values
cat <<EOT >> .env
PORT=3001
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
VERIFY_TOKEN=my_secret_token
EOT

echo "Step 3: Launching local tunnel for testing available at localhost:4040..."
# 啟動 ngrok 並將 URL 輸出. 
# Note: This might require manual termination or running in a separate terminal.
ngrok http 3001 > /dev/null &
sleep 5
# Check if jq is installed, otherwise just print a message
if command -v jq &> /dev/null; then
    curl -s http://127.0.0.1:4040/api/tunnels | jq ".tunnels[0].public_url"
else
    echo "jq not found. Please check http://127.0.0.1:4040/api/tunnels manually for the URL."
fi
