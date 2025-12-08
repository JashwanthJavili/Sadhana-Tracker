import React, { useEffect, useState, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import OnboardingModal from './components/OnboardingModal';
import GenderSelectionModal from './components/GenderSelectionModal';
import FeedbackPrompt from './components/FeedbackPrompt';
import LoadingScreen from './components/LoadingScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { UserDataProvider, useUserData } from './contexts/UserDataContext';
import { ToastProvider } from './contexts/ToastContext';
import { getSettings, saveSettings, cleanupFakeSeedData } from './services/storage';
import { createUserProfile, setUserOnlineStatus, getUserProfile } from './services/chat';
import { ref, get } from 'firebase/database';
import { db } from './services/firebase';

// Lazy load heavy pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DailyPlanner = lazy(() => import('./pages/DailyPlanner'));
const Analytics = lazy(() => import('./pages/Analytics'));
const History = lazy(() => import('./pages/History'));
const Settings = lazy(() => import('./pages/Settings'));
const About = lazy(() => import('./pages/About'));
const DevotionalJournal = lazy(() => import('./pages/DevotionalJournal'));
const Community = lazy(() => import('./pages/Community'));
const ChatsList = lazy(() => import('./pages/ChatsList'));
const ChatWindow = lazy(() => import('./pages/ChatWindow'));
const QuestionsPage = lazy(() => import('./pages/QuestionsPage'));
const AskQuestionPage = lazy(() => import('./pages/AskQuestionPage'));
const QuestionDetailPage = lazy(() => import('./pages/QuestionDetailPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const ChantingCounter = lazy(() => import('./pages/ChantingCounter'));
const SlokasLibrary = lazy(() => import('./pages/SlokasLibrary'));
const FestivalsPage = lazy(() => import('./pages/FestivalsPage'));
const FestivalDetailPage = lazy(() => import('./pages/FestivalDetailPage'));

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Catch-all redirect based on auth status
const DefaultRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  // If logged in, go to dashboard; otherwise go to login
  return <Navigate to={user ? "/" : "/login"} replace />;
};

function App() {
  return (
    <AuthProvider>
      <UserDataProvider>
        <ToastProvider>
          <LanguageProvider>
            <HashRouter>
              <AppContent />
            </HashRouter>
          </LanguageProvider>
        </ToastProvider>
      </UserDataProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGenderSelection, setShowGenderSelection] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // CRITICAL: Clear localStorage immediately for authenticated users
  useEffect(() => {
    if (user && user.uid !== 'guest') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sl_')) {
          keysToRemove.push(key);
        }
      }
      if (keysToRemove.length > 0) {
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log(`🧹 [App.tsx] Cleared ${keysToRemove.length} localStorage items for authenticated user ${user.uid}`);
      }
    }
  }, [user]);

  useEffect(() => {
    const checkFirstTime = async () => {
      if (user && user.uid !== 'guest') {
        // AUTOMATIC CLEANUP: Remove fake seed data from old version
        const removedCount = await cleanupFakeSeedData(user.uid);
        if (removedCount > 0) {
          console.log(`✅ Automatically removed ${removedCount} fake entries`);
        }

        const settings = await getSettings(user.uid);

        // Check if user needs to select gender (existing users without gender)
        if (!settings.isFirstTime && !settings.gender) {
          setShowGenderSelection(true);
        } else if (settings.isFirstTime) {
          setShowOnboarding(true);
        }

        // ONCE-PER-DAY CHECK: Check if user should see feedback prompt
        checkFeedbackEligibility(user.uid, settings);
      }
    };
    checkFirstTime();
  }, [user]);

  // Check if user is eligible for feedback (once per week if not submitted)
  const checkFeedbackEligibility = async (userId: string, settings: any) => {
    try {
      // Check last feedback submission time
      const feedbackRef = ref(db, `users/${userId}/lastFeedback`);
      const feedbackSnapshot = await get(feedbackRef);

      if (feedbackSnapshot.exists()) {
        const lastFeedbackTime = feedbackSnapshot.val().timestamp;
        const currentTime = Date.now();
        const hoursSinceLastFeedback = Math.floor((currentTime - lastFeedbackTime) / (1000 * 60 * 60));

        // If submitted in last 7 days (168 hours), don't show
        if (hoursSinceLastFeedback < 168) {
          const daysRemaining = Math.ceil((168 - hoursSinceLastFeedback) / 24);
          console.log(`✓ Feedback already submitted ${Math.floor(hoursSinceLastFeedback / 24)} day(s) ago. Next prompt in ${daysRemaining} day(s).`);
          return;
        }
      }

      // Get user creation time (registration date)
      const userCreatedAt = user?.metadata?.creationTime;
      if (!userCreatedAt) {
        console.log('⚠️ Cannot determine user creation time');
        return;
      }

      const createdDate = new Date(userCreatedAt);
      const currentDate = new Date();
      const daysSinceRegistration = Math.floor((currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

      console.log(`📅 Days since registration: ${daysSinceRegistration}`);

      // Show feedback after 2+ days
      if (daysSinceRegistration >= 2) {
        console.log('✅ User eligible for feedback prompt');
        // Delay showing by 5 seconds to let app load
        setTimeout(() => {
          setShowFeedback(true);
        }, 5000);
      } else {
        console.log(`⏳ User needs ${2 - daysSinceRegistration} more day(s) before feedback`);
      }
    } catch (error) {
      console.error('Error checking feedback eligibility:', error);
    }
  };

  const handleOnboardingComplete = async (data: { userName: string; gender: 'male' | 'female'; guruName: string; iskconCenter: string }) => {
    if (user) {
      const settings = await getSettings(user.uid);
      await saveSettings(user.uid, {
        ...settings,
        userName: data.userName,
        gender: data.gender,
        guruName: data.guruName,
        iskconCenter: data.iskconCenter,
        language: 'en', // Default to English
        isFirstTime: false,
        tourCompleted: false, // Enable tour for new users
      });

      // Create user profile for chat system
      try {
        const existingProfile = await getUserProfile(user.uid);
        if (!existingProfile) {
          await createUserProfile(user.uid, {
            userName: data.userName,
            guruName: data.guruName,
            iskconCenter: data.iskconCenter,
            photoURL: user.photoURL || undefined,
          });
        }
      } catch (error) {
        console.error('Error creating user profile:', error);
      }

      setShowOnboarding(false);

      // SMART UPDATE: Trigger context refresh and navigate to dashboard
      console.log('✅ Onboarding complete - updating app state and navigating to dashboard');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('userDataUpdated'));
        window.location.href = '/'; // Navigate to dashboard
      }, 300);
    }
  };

  const handleGenderSelection = async (gender: 'male' | 'female') => {
    if (user) {
      const settings = await getSettings(user.uid);
      await saveSettings(user.uid, {
        ...settings,
        gender: gender,
      });

      setShowGenderSelection(false);

      // SMART UPDATE: Trigger context refresh
      console.log('✅ Gender updated - updating app state');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('userDataUpdated'));
      }, 300);
    }
  };

  // Show loading screen while authentication is being checked
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Layout>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />

            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/planner" element={<PrivateRoute><DailyPlanner /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
            <Route path="/journal" element={<PrivateRoute><DevotionalJournal /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/about" element={<PrivateRoute><About /></PrivateRoute>} />
            <Route path="/community" element={<PrivateRoute><Community /></PrivateRoute>} />
            <Route path="/chats" element={<PrivateRoute><ChatsList /></PrivateRoute>} />
            <Route path="/chat/:chatId" element={<PrivateRoute><ChatWindow /></PrivateRoute>} />
            <Route path="/questions" element={<PrivateRoute><QuestionsPage /></PrivateRoute>} />
            <Route path="/questions/ask" element={<PrivateRoute><AskQuestionPage /></PrivateRoute>} />
            <Route path="/questions/:questionId" element={<PrivateRoute><QuestionDetailPage /></PrivateRoute>} />
            <Route path="/chanting" element={<PrivateRoute><ChantingCounter /></PrivateRoute>} />
            <Route path="/slokas" element={<PrivateRoute><SlokasLibrary /></PrivateRoute>} />
            <Route path="/festivals" element={<PrivateRoute><FestivalsPage /></PrivateRoute>} />
            <Route path="/festival/:festivalId" element={<PrivateRoute><FestivalDetailPage /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />

            {/* Catch-all: redirect to dashboard if logged in, login if not */}
            <Route path="*" element={<DefaultRedirect />} />
          </Routes>
        </Suspense>
      </Layout>

      <OnboardingModal isOpen={showOnboarding} onComplete={handleOnboardingComplete} />
      <GenderSelectionModal isOpen={showGenderSelection} onComplete={handleGenderSelection} />

      {/* Feedback Prompt - Shows after 2+ days */}
      {showFeedback && <FeedbackPrompt onClose={() => setShowFeedback(false)} />}
    </>
  );
}

export default App;