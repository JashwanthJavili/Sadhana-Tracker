import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PenTool, BarChart2, BookOpen, Menu, X, Settings, User, LogOut, Info, HelpCircle, MessageSquare, Heart, Users, MessageCircle, HelpCircle as QuestionIcon, Shield, Lock, Flame, BookText, Calendar } from 'lucide-react';
import { getSettings, trackUsage } from '../services/storage';
import { getTotalUnreadCount } from '../services/chat';
import { UserSettings } from '../types';
import { useAuth } from '../contexts/AuthContext';
import InteractiveTour from './InteractiveTour';
import { useSyncChatProfile } from '../hooks/useSyncChatProfile';

// @ts-ignore
import iskconLogo from '../utils/Images/Iscon_LOgo-removebg-preview.png';

const ADMIN_EMAIL = 'jashwanthjavili7@gmail.com';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isNewUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Sync chat profile for existing users
  useSyncChatProfile();

  useEffect(() => {
    const fetchSettings = async () => {
      if (user) {
        const data = await getSettings(user.uid);
        setSettings(data);
        
        // Auto-show tour only for new users who have completed profile setup
        // Check if user has filled userName, guruName, and iskconCenter
        const hasCompletedProfile = data?.userName && data?.guruName && data?.iskconCenter;
        const shouldShowTour = isNewUser && !data?.tourCompleted && hasCompletedProfile;
        
        if (shouldShowTour) {
          setTimeout(() => setShowTour(true), 1000);
        }
      }
    };
    fetchSettings();
  }, [location.pathname, user, isNewUser]);

  // Load unread messages count
  useEffect(() => {
    if (!user || user.uid === 'guest') return;
    
    const loadUnread = async () => {
      try {
        const count = await getTotalUnreadCount(user.uid);
        setUnreadCount(count);
      } catch (error) {
        console.warn('Unable to load unread count:', error);
        setUnreadCount(0); // Set to 0 instead of throwing
      }
    };
    
    loadUnread();
    const interval = setInterval(loadUnread, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleTourComplete = async () => {
    setShowTour(false);
    if (user && settings) {
      // Mark tour as completed
      const { saveSettings } = await import('../services/storage');
      await saveSettings(user.uid, { ...settings, tourCompleted: true });
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const isGuest = user?.uid === 'guest';
  
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', tourAttr: 'dashboard', guestAllowed: true },
    { to: '/planner', icon: PenTool, label: 'Daily Planner', tourAttr: 'planner', guestAllowed: true },
    { to: '/analytics', icon: BarChart2, label: 'Analytics', tourAttr: 'analytics', guestAllowed: true },
    { to: '/chanting', icon: Flame, label: 'Japa Counter', tourAttr: 'chanting', guestAllowed: true },
    { to: '/slokas', icon: BookText, label: 'Slokas Library', tourAttr: 'slokas', guestAllowed: true },
    { to: '/festivals', icon: Calendar, label: 'Festivals', tourAttr: 'festivals', guestAllowed: true },
    { to: '/journal', icon: Heart, label: 'Devotional Journal', tourAttr: 'journal', guestAllowed: false, locked: isGuest },
    { to: '/history', icon: BookOpen, label: 'History', tourAttr: 'history', guestAllowed: true },
    { to: '/community', icon: Users, label: 'Community', tourAttr: 'community', guestAllowed: false, locked: isGuest },
    { to: '/chats', icon: MessageCircle, label: 'Messages', tourAttr: 'messages', guestAllowed: false, locked: isGuest },
    { to: '/questions', icon: QuestionIcon, label: 'Q&A Forum', tourAttr: 'questions', guestAllowed: false, locked: isGuest },
    ...(user?.email === ADMIN_EMAIL ? [{ to: '/admin', icon: Shield, label: 'Admin Panel', tourAttr: 'admin', guestAllowed: false }] : []),
    { to: '/settings', icon: Settings, label: 'Settings', tourAttr: 'settings', guestAllowed: true },
    { to: '/about', icon: Info, label: 'About', guestAllowed: true },
  ];

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col md:flex-row font-sans">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Mobile Header */}
      <div className="md:hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img 
            src={iskconLogo} 
            alt="ISKCON Logo" 
            className="h-10 w-10 object-contain bg-white/90 rounded-lg p-1"
          />
          <span className="font-serif font-bold text-xl">Sadhana Sanga</span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors active:scale-95"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-stone-100 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Branding Area */}
        <div className="p-6 border-b border-stone-700/50 flex flex-col items-center text-center gap-4 bg-gradient-to-br from-orange-900/20 to-transparent">
          {/* ISKCON Logo */}
          <div className="bg-white/95 p-3 rounded-2xl shadow-xl ring-2 ring-orange-500/30">
            <img 
              src={iskconLogo} 
              alt="ISKCON Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          
          <div>
            <h1 className="font-serif font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-amber-200 to-orange-300">
              Sadhana Sanga
            </h1>
            {settings?.iskconCenter && settings.iskconCenter.toLowerCase() !== 'n/a' && (
              <p className="text-xs text-orange-300/80 mt-1 font-semibold">{settings.iskconCenter}</p>
            )}
            {settings?.guruName && settings.guruName.toLowerCase() !== 'n/a' && (
              <p className="text-xs text-stone-400 mt-0.5">Guided by {settings.guruName}</p>
            )}
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isLocked = item.locked === true;
            const NavComponent = isLocked ? 'div' : NavLink;
            
            return (
              <NavComponent
                key={item.to}
                {...(!isLocked && {
                  to: item.to,
                  onClick: () => setIsSidebarOpen(false)
                })}
                data-tour={item.tourAttr}
                className={isLocked 
                  ? 'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative text-stone-500 cursor-not-allowed opacity-60'
                  : ({ isActive }: any) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative
                    ${isActive 
                      ? 'bg-orange-700 text-white shadow-lg' 
                      : 'text-stone-300 hover:bg-stone-800 hover:text-white'}
                  `
                }
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
                {isLocked && (
                  <Lock size={16} className="ml-auto text-orange-500" title="Sign in to unlock" />
                )}
                {/* Unread badge for Messages */}
                {item.to === '/chats' && unreadCount > 0 && !isLocked && (
                  <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold min-w-[20px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </NavComponent>
            );
          })}
        </nav>

        {/* Footer section */}

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-stone-800 bg-stone-900 space-y-2">
          {/* Help & Feedback Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => setShowTour(true)}
              className="flex items-center justify-center gap-1 text-xs text-stone-400 hover:text-orange-400 hover:bg-stone-800 px-2 py-2 rounded-lg transition-colors"
            >
              <HelpCircle size={14} />
              <span>Tour</span>
            </button>
            <a
              href="https://forms.zohopublic.in/jashwanthjashu684gm1/form/SadhanaTracerFeedbackForm/formperma/KOoeajQ20c3B6YQ6Bmmy76hxc3xkOC9-BAc-Lu7GEjU"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 text-xs text-stone-400 hover:text-orange-400 hover:bg-stone-800 px-2 py-2 rounded-lg transition-colors"
            >
              <MessageSquare size={14} />
              <span>Feedback</span>
            </a>
          </div>

          <div className="flex items-center gap-3 mb-4 px-2">
            <img 
              src={user.photoURL || ''} 
              alt={settings?.userName || user.displayName || 'User'} 
              className="w-8 h-8 rounded-full bg-stone-700"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{settings?.userName || user.displayName || 'Devotee'}</p>
              <p className="text-xs text-stone-500 truncate">{user.uid === 'guest' ? 'Guest Mode' : 'Signed In'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-stone-400 hover:text-white hover:bg-stone-800 px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen md:h-screen overflow-hidden relative bg-stone-50">
        {/* Guest Mode Banner */}
        {isGuest && (
          <div className="sticky top-0 z-30 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white px-4 py-3 shadow-lg">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-3">
                <Lock size={20} className="flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-bold">Guest Demo Mode</p>
                  <p className="text-xs text-orange-100">
                    Sign in to unlock: Devotional Journal, Community, Messages, Q&A Forum
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white text-orange-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-orange-50 transition-colors whitespace-nowrap self-end sm:self-auto"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-stone-50 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
          <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-8 pb-24">
            {children}
          </div>
        </div>
      </main>

      {/* Interactive Tour */}
      {showTour && <InteractiveTour onComplete={handleTourComplete} />}
    </div>
  );
};

export default Layout;