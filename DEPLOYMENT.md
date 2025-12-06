# Deployment Guide

## The Issue: White Screen After Deployment

The white screen happens because **environment variables are missing** in production. Your Firebase config needs to be set on your hosting platform.

---

## Solution: Set Environment Variables

### For GitHub Pages (Static Hosting)

⚠️ **GitHub Pages doesn't support environment variables at runtime.** You need to either:

**Option 1: Use Firebase Hosting (Recommended)**
**Option 2: Hardcode values for production (less secure but works)

---

## Recommended: Deploy to Firebase Hosting

### Step 1: Install Firebase Tools
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase Hosting
```bash
firebase init hosting
```

Select:
- Use existing project: `sadhanatracker-92f04`
- Public directory: `dist`
- Configure as single-page app: **Yes**
- Set up automatic builds: **No**

### Step 4: Build the app
```bash
npm run build
```

### Step 5: Deploy
```bash
firebase deploy --only hosting
```

Your app will be live at: `https://sadhanatracker-92f04.web.app`

---

## Alternative: Vercel Deployment

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
vercel
```

### Step 3: Set Environment Variables in Vercel Dashboard

1. Go to your project settings
2. Add all environment variables from `.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`

3. Redeploy

---

## Alternative: Netlify Deployment

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Build
```bash
npm run build
```

### Step 3: Deploy
```bash
netlify deploy --prod --dir=dist
```

### Step 4: Set Environment Variables

1. Go to Site settings → Environment variables
2. Add all variables from `.env`
3. Redeploy

---

## Quick Fix: Use Production Config File

If you want a quick solution for testing:

1. Create `src/config/firebase.config.ts`:
```typescript
export const firebaseConfig = {
  apiKey: "AIzaSyCCU9NqyTeunRO97f-peXIl3hitzXqiXME",
  authDomain: "sadhanatracker-92f04.firebaseapp.com",
  databaseURL: "https://sadhanatracker-92f04-default-rtdb.firebaseio.com",
  projectId: "sadhanatracker-92f04",
  storageBucket: "sadhanatracker-92f04.firebasestorage.app",
  messagingSenderId: "896915994564",
  appId: "1:896915994564:web:bff6033318e5e744675691",
  measurementId: "G-HW8YWVPYB2"
};
```

2. Update `services/firebase.ts` to import from config file

⚠️ This exposes your config but Firebase API keys are meant to be public (protected by database rules).

---

## Troubleshooting

### White screen persists?
1. Open browser console (F12)
2. Check for errors
3. Verify environment variables are loaded
4. Check if `import.meta.env.VITE_FIREBASE_API_KEY` is undefined

### Can't access Firebase?
1. Ensure database rules are deployed
2. Enable Google authentication in Firebase Console
3. Add your deployment domain to authorized domains in Firebase Auth settings

---

## Recommended Hosting: Firebase Hosting

**Why?**
- ✅ Free tier available
- ✅ Automatic SSL
- ✅ Fast CDN
- ✅ Integrated with Firebase services
- ✅ Easy deployment

Run: `firebase deploy --only hosting`
