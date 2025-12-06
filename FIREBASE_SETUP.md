# Firebase Setup Instructions

## Database Structure

Your Firebase Realtime Database is now configured to store data with the following structure:

```
sadhanatracker-92f04-default-rtdb/
└── users/
    └── {userId}/
        ├── entries/
        │   └── {dateString}/
        │       ├── id: string
        │       ├── date: string
        │       ├── commitments: array
        │       ├── reasonNotCompleted: string
        │       ├── timeline: array
        │       ├── metrics: object
        │       ├── reflections: object
        │       └── lastUpdated: number
        └── settings/
            ├── devoteeType: string
            ├── mainPractice: string
            ├── dailyGoal: string
            └── wakeUpTime: string
```

## Key Features Implemented

### ✅ 1. Google Authentication
- **File**: `services/firebase.ts` - Configured Google Auth provider
- **File**: `contexts/AuthContext.tsx` - Implements `signInWithGoogle()` method
- Users can sign in with their Google account
- Each user gets a unique `userId` (Firebase UID)

### ✅ 2. Data Separation
- **File**: `services/storage.ts` - All data operations use user-specific paths
- Each user's data is stored under `/users/{userId}/`
- Users can only access their own data
- Guest mode stores data in localStorage

### ✅ 3. Realtime Database Integration
- Database URL: `https://sadhanatracker-92f04-default-rtdb.firebaseio.com`
- All entries are saved to `/users/{userId}/entries/{dateString}`
- Settings are saved to `/users/{userId}/settings`
- Data syncs in real-time across devices

### ✅ 4. Security Rules
- **File**: `database.rules.json` - Contains security rules
- Users can only read/write their own data
- Authentication required for all operations
- Data validation for entries and settings

## Setup Steps

### Step 1: Deploy Database Rules to Firebase

1. Install Firebase CLI (if not already installed):
   ```powershell
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```powershell
   firebase login
   ```

3. Initialize Firebase in your project:
   ```powershell
   firebase init
   ```
   - Select "Realtime Database"
   - Choose your existing project: `sadhanatracker-92f04`
   - Use `database.rules.json` as your rules file

4. Deploy the rules:
   ```powershell
   firebase deploy --only database
   ```

### Step 2: Enable Google Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `sadhanatracker-92f04`
3. Go to **Authentication** → **Sign-in method**
4. Enable **Google** as a sign-in provider
5. Add your authorized domains (localhost is already included)

### Step 3: Test Your Application

1. Start your development server:
   ```powershell
   npm run dev
   ```

2. Click "Sign in with Google" button
3. Complete the Google authentication
4. Your data will now be saved to Firebase Realtime Database under your unique user ID

## Data Flow

### When a user signs in:
1. User clicks "Sign in with Google"
2. `signInWithGoogle()` is called from `AuthContext`
3. Google popup appears for authentication
4. Upon success, user object is set with unique `userId`
5. All subsequent operations use this `userId` for data paths

### When saving data:
1. Any change to entries/settings triggers `saveEntry()` or `saveSettings()`
2. Data is saved to `/users/{userId}/entries/{date}` or `/users/{userId}/settings`
3. Firebase validates the data using security rules
4. Data is stored and synced in real-time

### When reading data:
1. App calls `getEntry()`, `getAllEntries()`, or `getSettings()`
2. Firebase fetches from `/users/{userId}/...`
3. Only the authenticated user's data is returned
4. Data is cached locally and synced automatically

## Important Notes

- **Guest Mode**: Guest users store data in localStorage (not Firebase)
- **Data Privacy**: Each user's data is completely isolated
- **Offline Support**: Firebase caches data locally for offline access
- **Real-time Sync**: Changes sync automatically across all devices

## Troubleshooting

### If Google Sign-In doesn't work:
1. Ensure you've enabled Google auth in Firebase Console
2. Check browser console for errors
3. Verify `authDomain` in firebase config matches your Firebase project

### If data doesn't save:
1. Check that database rules are deployed
2. Verify user is authenticated (check `auth.currentUser`)
3. Check browser console for permission errors

### If you get permission denied:
1. Ensure database rules are deployed correctly
2. Verify user is signed in
3. Check that the data path matches the rules structure
