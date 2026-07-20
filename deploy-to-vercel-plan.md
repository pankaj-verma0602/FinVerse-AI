# Deploy Finverse AI to Vercel — Plan

## Top-Level Overview

Deploy the **Finverse AI** Next.js app to Vercel using the existing GitHub repo
(`pankaj-verma0602/FinVerse-AI`). Three pre-deployment issues must be resolved
first: a placeholder Gemini API key, a localhost app URL, and exposed Firebase
credentials. Once resolved, the app is connected to Vercel via GitHub, all
environment variables are set in the Vercel dashboard, and a production deploy
is triggered.

---

## Sub-Task 1 — Get a Real Gemini API Key

**Status:** [ ] pending

**Intent:**
The current `GEMINI_API_KEY` in `.env.local` is the literal string
`your_gemini_api_key_here`. Without a real key all AI features (Money Mentor,
Document Decoder, Scam Shield, Dictionary) return only stub/demo responses.

**Expected Outcomes:**
- A valid Gemini API key is obtained from Google AI Studio.
- The key is noted down ready to paste into Vercel's environment variable settings.
- The local `.env.local` is updated so local dev also works.

**Todo List:**
1. Open https://aistudio.google.com/app/apikey in a browser.
2. Sign in with a Google account.
3. Click **Create API key** → copy the generated key.
4. In `.env.local` replace `your_gemini_api_key_here` with the real key.

**Relevant Context:**
- `.env.local` line 14: `GEMINI_API_KEY=your_gemini_api_key_here`
- Used server-side in `app/api/gemini/` route only — never exposed to the browser.

---

## Sub-Task 2 — Fix the Production App URL

**Status:** [ ] pending

**Intent:**
`NEXT_PUBLIC_APP_URL` is currently `http://localhost:3000`. This gets baked into
the browser bundle at build time. It must point to the real Vercel domain before
deployment, otherwise any feature that constructs absolute URLs (e.g. OAuth
redirects, share links) will break in production.

**Expected Outcomes:**
- `.env.local` is updated to use the real production URL.
- The correct URL is noted for pasting into Vercel's environment variable settings.

**Todo List:**
1. Decide the production URL. Two options:
   - **Option A (free Vercel domain):** `https://fin-verse-ai.vercel.app` — the
     exact slug Vercel auto-assigns from the repo name; confirm after first deploy.
   - **Option B (custom domain):** your own domain, e.g. `https://finverse.app`.
2. Update `.env.local` line 33:
   `NEXT_PUBLIC_APP_URL=https://<your-vercel-domain>`
3. Note this URL for the Vercel dashboard env var step.

**Relevant Context:**
- `.env.local` line 33: `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- No code in `app/` or `components/` directly references this value as a hardcoded
  string — it is read only through `process.env.NEXT_PUBLIC_APP_URL`.

---

## Sub-Task 3 — Rotate Exposed Firebase Credentials

**Status:** [ ] pending

**Intent:**
The real Firebase API key and related config values are visible in `.env.local`.
Although `.env.local` is listed in `.gitignore` (under `.env*`), if the file was
ever committed and pushed, the secrets are in Git history. Rotating them is the
safe course of action.

**Expected Outcomes:**
- Firebase API key is regenerated from the Firebase Console.
- New values are placed in `.env.local`.
- New values are noted for Vercel's environment variable settings.

**Todo List:**
1. Open https://console.firebase.google.com/ → select project `finverse-ai-5bbf3`.
2. Go to **Project Settings → General → Your apps → Web app**.
3. The `apiKey` shown there can be regenerated: go to
   **Google Cloud Console → APIs & Services → Credentials**,
   find the Browser key tied to this project, and click **Regenerate**.
4. Copy all updated config values (apiKey, authDomain, projectId, storageBucket,
   messagingSenderId, appId, measurementId).
5. Paste new values into `.env.local` (lines 22–28).
6. Note all values for the Vercel dashboard env var step.

**Relevant Context:**
- `.env.local` lines 22–28 contain the currently exposed Firebase config.
- `firebase/config.ts` reads these values from `process.env.NEXT_PUBLIC_FIREBASE_*`.
- Firebase `NEXT_PUBLIC_` keys are intentionally public in the browser bundle —
  only the API key rotation matters for security; the rest are non-secret identifiers.

---

## Sub-Task 4 — Push Latest Code to GitHub

**Status:** [ ] pending

**Intent:**
Vercel deploys from the GitHub repo `pankaj-verma0602/FinVerse-AI`. The working
tree must be clean and all latest changes pushed before connecting to Vercel.

**Expected Outcomes:**
- `git status` shows no uncommitted changes.
- `git push origin main` succeeds.
- GitHub shows the latest commit on the `main` branch.

**Todo List:**
1. Run `git status` — confirm nothing uncommitted (`.env.local` must NOT appear;
   it is covered by `.env*` in `.gitignore`).
2. If any non-env files are modified, stage and commit them:
   `git add . && git commit -m "chore: pre-deploy cleanup"`
3. Run `git push origin main`.

**Relevant Context:**
- Remote: `https://github.com/pankaj-verma0602/FinVerse-AI.git`
- `.gitignore` already excludes `.env*`, so `.env.local` will not be pushed.

---

## Sub-Task 5 — Connect Repo to Vercel and Set Environment Variables

**Status:** [ ] pending

**Intent:**
Create a new Vercel project linked to the GitHub repo and configure all
environment variables so the production build gets the correct secrets.

**Expected Outcomes:**
- Vercel project is created and linked to `pankaj-verma0602/FinVerse-AI`.
- All 9 environment variables are set in the Vercel dashboard for the
  **Production** (and optionally Preview) environment.
- Vercel triggers an initial build automatically.

**Todo List:**
1. Go to https://vercel.com/ → **Add New Project**.
2. Click **Import Git Repository** → connect GitHub if not already connected →
   select `FinVerse-AI`.
3. In the **Configure Project** screen:
   - Framework preset: **Next.js** (auto-detected).
   - Root directory: leave as `/` (default).
   - Build command: leave default (`next build`).
   - Output directory: leave default (`.next`).
4. Expand **Environment Variables** and add all 9 variables:

   | Variable | Value |
   |---|---|
   | `GEMINI_API_KEY` | *(real key from Sub-Task 1)* |
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | *(new value from Sub-Task 3)* |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | *(from Sub-Task 3)* |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | *(from Sub-Task 3)* |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | *(from Sub-Task 3)* |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | *(from Sub-Task 3)* |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | *(from Sub-Task 3)* |
   | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | *(from Sub-Task 3)* |
   | `NEXT_PUBLIC_APP_URL` | *(production URL from Sub-Task 2)* |

5. Click **Deploy**.

**Relevant Context:**
- `.env.example` lists all required variables with documentation.
- `GEMINI_API_KEY` must be set to **Production** environment only (server-side secret).
- `NEXT_PUBLIC_*` variables must be set for **Production** (and Preview if desired).

---

## Sub-Task 6 — Verify the Live Deployment

**Status:** [ ] pending

**Intent:**
Confirm the deployed app is fully functional — auth, AI features, and Firebase
all work correctly on the live Vercel URL.

**Expected Outcomes:**
- App loads at the Vercel URL without errors.
- Login / register works (Firebase Auth).
- At least one AI feature (e.g. Money Mentor) returns a real AI response.
- Browser console shows no critical errors.

**Todo List:**
1. Open the Vercel deployment URL (shown after deploy completes).
2. Test **Register** → create a test account → confirm Firestore user doc created.
3. Test **Money Mentor** → send a message → confirm a real (non-demo) AI reply.
4. Open browser DevTools → Console → check for errors.
5. If `NEXT_PUBLIC_APP_URL` was set before knowing the exact Vercel domain, go back
   to Vercel → **Settings → Environment Variables** → update the value → trigger
   a **Redeploy**.

**Relevant Context:**
- Firebase demo mode check: `firebase/config.ts` → `isFirebaseConfigured()`.
- Gemini demo mode check: `app/api/gemini/` route checks for placeholder key.
