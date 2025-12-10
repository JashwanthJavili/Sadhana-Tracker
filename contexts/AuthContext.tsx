import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, db } from '../services/firebase';
import { ref, update } from 'firebase/database';
import { setUserOnlineStatus } from '../services/chat';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isNewUser: boolean;
  signInWithGoogle: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // If we are already in guest mode, don't overwrite with null
      if (user?.uid === 'guest') return;

      // CRITICAL: Clear ALL localStorage data for authenticated users
      if (currentUser && currentUser.uid !== 'guest') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sl_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log(`🧹 Cleared ${keysToRemove.length} localStorage items for authenticated user`);
      }

      setUser(currentUser);
      setLoading(false);

      // Set online status when user logs in
      if (currentUser && currentUser.uid !== 'guest') {
        try {
          await setUserOnlineStatus(currentUser.uid, true);
        } catch (error) {
          console.error('Error setting online status:', error);
        }
      }
    });

    // Set offline status when component unmounts or user changes
    return () => {
      if (user && user.uid !== 'guest') {
        setUserOnlineStatus(user.uid, false).catch(console.error);
      }
      unsubscribe();
    };
  }, [user]);

  // CRITICAL SECURITY: Continuous monitoring to prevent ANY localStorage for authenticated users
  // This protects against browser extensions, third-party scripts, or any unauthorized access
  useEffect(() => {
    if (!user || user.uid === 'guest') return;

    // Aggressive cleanup every 3 seconds
    const monitoringInterval = setInterval(() => {
      const unauthorizedKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sl_')) {
          unauthorizedKeys.push(key);
        }
      }

      if (unauthorizedKeys.length > 0) {
        console.error(`🚨 SECURITY ALERT: Detected ${unauthorizedKeys.length} unauthorized localStorage items for authenticated user ${user.uid}:`, unauthorizedKeys);
        unauthorizedKeys.forEach(key => {
          console.error(`🗑️ Removing unauthorized key: ${key}`);
          localStorage.removeItem(key);
        });
        console.log('✅ Unauthorized localStorage cleaned');
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(monitoringInterval);
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      // CRITICAL: Clear ALL guest data from localStorage when a real user signs in
      // This prevents guest data from contaminating authenticated user data
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sl_guest_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      const result = await signInWithPopup(auth, googleProvider);

      // Save user email to database for admin access
      if (result.user.email) {
        const userRef = ref(db, `users/${result.user.uid}`);
        await update(userRef, {
          email: result.user.email,
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || ''
        });
      }

      // Check if this is a new user
      const isNew = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
      setIsNewUser(isNew);
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const loginAsGuest = () => {
    // Create a mock user object for guest mode
    const guestUser = {
      uid: 'guest',
      displayName: 'Guest Devotee',
      email: 'guest@example.com',
      photoURL: null,
      emailVerified: true,
      isAnonymous: true,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => { },
      getIdToken: async () => '',
      getIdTokenResult: async () => ({} as any),
      reload: async () => { },
      toJSON: () => ({}),
      phoneNumber: null,
    } as User;

    setUser(guestUser);
    setIsNewUser(true); // Guest users always see the tour
    setLoading(false);
  };

  const logout = async () => {
    try {
      if (user?.uid === 'guest') {
        setUser(null);
        setIsNewUser(false);
        return;
      }

      // For authenticated users: set offline, sign out and clear user state
      if (user) {
        try {
          await setUserOnlineStatus(user.uid, false);
        } catch (err) {
          console.warn('Failed to set offline status during logout:', err);
        }
      }

      await signOut(auth);
      setUser(null);
      setIsNewUser(false);
    } catch (error) {
      console.error("Error signing out:", error);
      // swallow error; caller can decide navigation
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isNewUser, signInWithGoogle, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};