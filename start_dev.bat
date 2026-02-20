@echo off
echo Starting AI Sales Bot...

start "SocialManager Server" cmd /k "cd server && npm start"
start "SocialManager Client" cmd /k "cd client && npm run dev"

echo Services started!
echo Server: http://localhost:3001
echo Client: http://localhost:3000
