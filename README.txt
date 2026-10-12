SAM AI Cute Robot Update

Replace these files in your existing GitHub repository:
1. src/App.jsx
2. src/style.css
3. index.html

Keep your existing src/main.jsx and api/chat.js.
Then commit the changes in GitHub. Vercel should redeploy automatically.

This update changes the interface to a cute animated SAM robot and keeps the frontend
calling POST /api/chat with { messages: [{ role, content }] }.

If the AI reply still fails, the issue is in the serverless API/key setup, not the mascot design.
