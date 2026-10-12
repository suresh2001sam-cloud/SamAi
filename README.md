# Milo AI Buddy 💜

React + Firebase Google login + Firestore realtime one-to-one chat + Groq AI endpoint hosted on Vercel. No local SQL database is required.

## Setup online (recommended for this PC)
1. Create a Firebase project at https://console.firebase.google.com/
2. Authentication > Get started > Sign-in method > enable **Google**.
3. Firestore Database > Create database.
4. Project settings > General > Your apps > add a Web app; copy its config values.
5. Firestore Rules: paste `firestore.rules` and Publish.
6. Create a GitHub repository and upload all project files. Do not upload `.env` or API keys.
7. Import the GitHub repository into https://vercel.com/ and deploy as a Vite app (`npm run build`, output `dist`).
8. Vercel Project > Settings > Environment Variables: add `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` using the Firebase web app config values.
9. Add `GROQ_API_KEY` (from https://console.groq.com/) and optionally `GROQ_MODEL=llama-3.3-70b-versatile` in Vercel Environment Variables. Never put the Groq key in React code or GitHub.
10. Redeploy. In Firebase Authentication > Settings > Authorized domains, add the Vercel domain.
11. Share the website link with friends. Each friend signs in with Google. Click a friend's name to open a private realtime chat. Use `@milo tell me a joke`, `@milo motivate us`, or `@milo tell us a fun fact` to invite Milo.

## Important
- Gmail itself is not a database. Google sign-in authenticates users; Cloud Firestore stores chat and profile data.
- Firebase Spark has free quotas/limits; check current Firebase, Vercel, and Groq pricing/limits before public use.
- Never publish API keys. Keep `GROQ_API_KEY` server-side in Vercel.
- This is a starter project and needs a security review before public production use. The Firestore rules currently permit a signed-in chat member to submit an AI-kind message; for production, move AI message writes to a trusted server endpoint using Firebase Admin authentication so clients cannot spoof bot messages.
- User profiles are visible to signed-in users in this simple starter. Avoid storing sensitive information.
- Optional local development needs Node.js: `npm install`, then `npm run dev`. You can deploy through GitHub + Vercel without installing a local SQL database.
