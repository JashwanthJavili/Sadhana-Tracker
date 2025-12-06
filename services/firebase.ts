import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCCU9NqyTeunRO97f-peXIl3hitzXqiXME",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sadhanatracker-92f04.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://sadhanatracker-92f04-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sadhanatracker-92f04",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sadhanatracker-92f04.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "896915994564",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:896915994564:web:bff6033318e5e744675691",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-HW8YWVPYB2"
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