import React, { useEffect, useState, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import OnboardingModal from './components/OnboardingModal';
import GenderSelectionModal from './components/GenderSelectionModal';
import FeedbackPrompt from './components/FeedbackPrompt';
import LoadingScreen from './components/LoadingScreen';
import BackgroundMusic from './components/BackgroundMusic';
import VersionChecker from './components/VersionChecker';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { UserDataProvider, useUserData } from './contexts/UserDataContext';
import { ToastProvider } from './contexts/ToastContext';
import { getSettings, saveSettings, cleanupFakeSeedData } from './services/storage';
import { createUserProfile, setUserOnlineStatus, getUserProfile } from './services/chat';
import { ref, get } from 'firebase/database';
import { db } from './services/firebase';
import { checkForUpdates, markVersionSeen, VERSION_HISTORY } from './utils/version';
import { X, Sparkles } from 'lucide-react';
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
const ConnectionRequests = lazy(() => import('./pages/ConnectionRequests'));

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
  const [showVersionUpdate, setShowVersionUpdate] = useState(false);
  const [versionInfo, setVersionInfo] = useState<any>(null);

  // Check for version updates
  useEffect(() => {
    if (user) {
      const updateInfo = checkForUpdates();
      if (updateInfo.hasUpdate) {
        setVersionInfo(updateInfo);
        setShowVersionUpdate(true);
      }
    }
  }, [user]);
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
      // Check if user dismissed today
      const dismissedRef = ref(db, `users/${userId}/lastFeedbackDismissed`);
      const dismissedSnapshot = await get(dismissedRef);

      if (dismissedSnapshot.exists()) {
        const lastDismissedTime = dismissedSnapshot.val().timestamp;
        const currentTime = Date.now();
        const hoursSinceDismissed = Math.floor((currentTime - lastDismissedTime) / (1000 * 60 * 60));

        // If dismissed in last 24 hours, don't show
        if (hoursSinceDismissed < 24) {
          console.log(`✓ Feedback dismissed ${Math.floor(hoursSinceDismissed)} hour(s) ago. Will prompt tomorrow.`);
          return;
        }
      }

      // Check last feedback submission time
      const feedbackRef = ref(db, `users/${userId}/lastFeedback`);
      const feedbackSnapshot = await get(feedbackRef);

      if (feedbackSnapshot.exists()) {
        const lastFeedbackTime = feedbackSnapshot.val().timestamp;
        const currentTime = Date.now();
        const hoursSinceLastFeedback = Math.floor((currentTime - lastFeedbackTime) / (1000 * 60 * 60));

        // If submitted in last 14 days (336 hours), don't show
        if (hoursSinceLastFeedback < 336) {
          const daysRemaining = Math.ceil((336 - hoursSinceLastFeedback) / 24);
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
      {/* Version Checker - Always active, checks every 60 seconds */}
      <VersionChecker />
      
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
            <Route path="/connection-requests" element={<PrivateRoute><ConnectionRequests /></PrivateRoute>} />
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

      {/* Background Music - Hare Krishna Mantra */}
      {user && <BackgroundMusic autoPlay={true} />}

      {/* Version Update Modal */}
      {showVersionUpdate && versionInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] shadow-2xl border-4 border-green-400 animate-scale-in overflow-hidden flex flex-col">
            {/* Header - Fixed */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 sm:p-6 text-white relative overflow-hidden flex-shrink-0">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Sparkles size={28} className="text-yellow-300 flex-shrink-0" />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">New Version Available!</h2>
                    <p className="text-green-100 text-sm sm:text-base mt-0.5">Version {versionInfo.latestVersion} is here</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    markVersionSeen();
                    setShowVersionUpdate(false);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all flex-shrink-0"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-stone-800 mb-3 flex items-center gap-2 sticky top-0 bg-white pb-2 z-10">
                🎉 What's New
              </h3>
              <ul className="space-y-2 mb-6">
                {versionInfo.latestFeatures.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-stone-700 text-sm sm:text-base">
                    <span className="text-green-600 font-bold mt-0.5 flex-shrink-0">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Version History */}
              <details className="mb-4">
                <summary className="cursor-pointer text-sm font-bold text-stone-600 hover:text-green-600 transition-colors py-2">
                  📜 View Full Version History
                </summary>
                <div className="mt-3 space-y-3 pl-2 sm:pl-4">
                  {VERSION_HISTORY.slice(1).map((version) => {
                    // Filter features based on user role - hide ANY mention of admin
                    const filteredFeatures = version.features.filter(feature => {
                      // If user is not admin, hide admin-related features
                      const isUserAdmin = user?.email === 'jashwanthjavili7@gmail.com';
                      if (!isUserAdmin) {
                        const lowerFeature = feature.toLowerCase();
                        if (
                          lowerFeature.includes('admin') ||
                          lowerFeature.includes('permission') ||
                          lowerFeature.includes('security') ||
                          lowerFeature.includes('database') ||
                          lowerFeature.includes('rule') ||
                          lowerFeature.includes('deploy') ||
                          lowerFeature.includes('backend')
                        ) {
                          return false;
                        }
                      }
                      return true;
                    });

                    // Only show version if it has features for this user type
                    if (filteredFeatures.length === 0) return null;

                    return (
                      <div key={version.version} className="border-l-2 border-stone-200 pl-3 sm:pl-4 py-2">
                        <p className="font-bold text-stone-700 text-sm sm:text-base">
                          Version {version.version} <span className="text-xs text-stone-500">({version.date})</span>
                        </p>
                        <ul className="text-xs sm:text-sm text-stone-600 mt-1 space-y-1">
                          {filteredFeatures.map((feature, idx) => (
                            <li key={idx}>• {feature}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </details>
            </div>

            {/* Footer - Fixed */}
            <div className="p-4 sm:p-6 border-t border-stone-200 bg-gradient-to-br from-green-50 to-emerald-50 flex-shrink-0">
              <button
                onClick={() => {
                  markVersionSeen();
                  setShowVersionUpdate(false);
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all transform hover:scale-105 active:scale-95"
              >
                Got it, Thanks! 🙏
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;