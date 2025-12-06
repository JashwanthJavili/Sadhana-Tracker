import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DailyPlanner from './pages/DailyPlanner';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Settings from './pages/Settings';
import About from './pages/About';
import DevotionalJournal from './pages/DevotionalJournal';
import Community from './pages/Community';
import ChatsList from './pages/ChatsList';
import ChatWindow from './pages/ChatWindow';
import QuestionsPage from './pages/QuestionsPage';
import AskQuestionPage from './pages/AskQuestionPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import Login from './components/Login';
import OnboardingModal from './components/OnboardingModal';
import LoadingScreen from './components/LoadingScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { getSettings, saveSettings } from './services/storage';
import { createUserProfile, setUserOnlineStatus, getUserProfile } from './services/chat';

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

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkFirstTime = async () => {
      if (user && user.uid !== 'guest') {
        console.log('Checking first time for user:', user.uid);
        const settings = await getSettings(user.uid);
        console.log('User settings:', settings);
        console.log('Is first time?', settings.isFirstTime);
        if (settings.isFirstTime) {
          console.log('Showing onboarding modal');
          setShowOnboarding(true);
        }
      }
    };
    checkFirstTime();
  }, [user]);

  const handleOnboardingComplete = async (data: { userName: string; guruName: string; iskconCenter: string }) => {
    if (user) {
      const settings = await getSettings(user.uid);
      await saveSettings(user.uid, {
        ...settings,
        userName: data.userName,
        guruName: data.guruName,
        iskconCenter: data.iskconCenter,
        language: 'en', // Default to English
        isFirstTime: false,
        showTour: true, // Enable tour for new users
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
      // Tour will be shown automatically by InteractiveTour component
    }
  };

  return (
    <>
      <Layout>
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
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>

      <OnboardingModal isOpen={showOnboarding} onComplete={handleOnboardingComplete} />
    </>
  );
}

export default App;