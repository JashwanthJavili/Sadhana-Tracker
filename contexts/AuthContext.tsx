import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { setUserOnlineStatus } from '../services/chat';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // If we are already in guest mode, don't overwrite with null
      if (user?.uid === 'guest') return;
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

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
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
      delete: async () => {},
      getIdToken: async () => '',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({}),
      phoneNumber: null,
    } as User;
    
    setUser(guestUser);
    setLoading(false);
  };

  const logout = async () => {
    try {
      if (user?.uid === 'guest') {
        setUser(null);
      } else {
        // Set offline status before signing out
        if (user) {
          await setUserOnlineStatus(user.uid, false);
        }
        await signOut(auth);
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};