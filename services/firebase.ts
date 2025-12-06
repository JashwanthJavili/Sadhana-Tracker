import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

// Fallback configuration for production builds
const fallbackConfig = {
  apiKey: "AIzaSyCCU9NqyTeunRO97f-peXIl3hitzXqiXME",
  authDomain: "sadhanatracker-92f04.firebaseapp.com",
  databaseURL: "https://sadhanatracker-92f04-default-rtdb.firebaseio.com",
  projectId: "sadhanatracker-92f04",
  storageBucket: "sadhanatracker-92f04.firebasestorage.app",
  messagingSenderId: "896915994564",
  appId: "1:896915994564:web:bff6033318e5e744675691",
  measurementId: "G-HW8YWVPYB2"
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || fallbackConfig.databaseURL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || fallbackConfig.measurementId
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

// Initialize analytics only if supported (prevents errors in some environments)
let analytics = null;
isSupported().then(yes => {
  if (yes) {
    analytics = getAnalytics(app);
  }
}).catch(err => console.warn("Analytics not supported:", err));

export { auth, db, googleProvider, analytics };