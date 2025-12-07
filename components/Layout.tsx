import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PenTool, BarChart2, BookOpen, Menu, X, Settings, User, LogOut, Info, HelpCircle, MessageSquare, Heart, Users, MessageCircle, HelpCircle as QuestionIcon, Shield, Lock, Flame, BookText, Calendar, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { getSettings, trackUsage } from '../services/storage';
import { getTotalUnreadCount } from '../services/chat';
import { UserSettings } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import InteractiveTour from './InteractiveTour';
import FeedbackPrompt from './FeedbackPrompt';
import { useSyncChatProfile } from '../hooks/useSyncChatProfile';

// @ts-ignore
import iskconLogo from '../utils/Images/Iscon_LOgo-removebg-preview.png';

const ADMIN_EMAIL = 'jashwanthjavili7@gmail.com';

interface LayoutProps {
  children: React.ReactNode;
}

// Declare global deferredPrompt
declare global {
  interface Window {
    deferredPrompt: any;
  }
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isNewUser } = useAuth();
  const { userSettings } = useUserData();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set([
    'Sadhana Practice',
    'Knowledge & Learning',
    'Community & Connection',
    'Progress & Insights',
    'Settings'
  ]));
  const location = useLocation();
  const navigate = useNavigate();

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupTitle)) {
        newSet.delete(groupTitle);
      } else {
        newSet.add(groupTitle);
      }
      return newSet;
    });
  };

  // Sync context settings to local state
  useEffect(() => {
    if (userSettings) {
      setSettings(userSettings);
    }
  }, [userSettings]);

  // Sync chat profile for existing users
  useSyncChatProfile();

  // Check if app can be installed
  useEffect(() => {
    const checkInstallable = () => {
      // Check if already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstallButton(false);
        return;
      }
      // Check if install prompt is available
      if (window.deferredPrompt) {
        setShowInstallButton(true);
      }
    };

    checkInstallable();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!window.deferredPrompt) {
      // If no prompt available, show instructions
      alert('To install this app:\n\niOS: Tap Share button, then "Add to Home Screen"\n\nAndroid: Tap menu (⋮), then "Install app" or "Add to Home screen"');
      return;
    }

    window.deferredPrompt.prompt();
    const { outcome } = await window.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    
    window.deferredPrompt = null;
  };

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

    // Listen for user data updates
    const handleDataUpdate = () => {
      console.log('📡 Layout: Received data update event');
      fetchSettings();
    };
    
    window.addEventListener('userDataUpdated', handleDataUpdate);
    return () => window.removeEventListener('userDataUpdated', handleDataUpdate);
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
  
  const navGroups = [
    {
      title: 'Sadhana Practice',
      items: [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard', tourAttr: 'dashboard', guestAllowed: true },
        { to: '/planner', icon: PenTool, label: 'Daily Planner', tourAttr: 'planner', guestAllowed: true },
        { to: '/chanting', icon: Flame, label: 'Japa Counter', tourAttr: 'chanting', guestAllowed: true },
        { to: '/journal', icon: Heart, label: 'Devotional Journal', tourAttr: 'journal', guestAllowed: false, locked: isGuest },
      ]
    },
    {
      title: 'Knowledge & Learning',
      items: [
        { to: '/slokas', icon: BookText, label: 'Mantras & Kirtans', tourAttr: 'slokas', guestAllowed: true },
        { to: '/festivals', icon: Calendar, label: 'Vaishnava Calendar', tourAttr: 'festivals', guestAllowed: true },
        { to: '/questions', icon: QuestionIcon, label: 'Spiritual Forum', tourAttr: 'questions', guestAllowed: false, locked: isGuest },
      ]
    },
    {
      title: 'Community & Connection',
      items: [
        { to: '/community', icon: Users, label: 'Devotee Community', tourAttr: 'community', guestAllowed: false, locked: isGuest },
        { to: '/chats', icon: MessageCircle, label: 'Messages', tourAttr: 'messages', guestAllowed: false, locked: isGuest },
      ]
    },
    {
      title: 'Progress & Insights',
      items: [
        { to: '/analytics', icon: BarChart2, label: 'Analytics', tourAttr: 'analytics', guestAllowed: true },
        { to: '/history', icon: BookOpen, label: 'History', tourAttr: 'history', guestAllowed: true },
      ]
    },
    {
      title: 'Settings',
      items: [
        ...(user?.email === ADMIN_EMAIL ? [{ to: '/admin', icon: Shield, label: 'Admin Panel', tourAttr: 'admin', guestAllowed: false }] : []),
        { to: '/settings', icon: Settings, label: 'Settings', tourAttr: 'settings', guestAllowed: true },
        { to: '/about', icon: Info, label: 'About', guestAllowed: true },
      ]
    },
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
        fixed md:sticky inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-stone-100 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl md:h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
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

        <nav className="p-3 sm:p-4 space-y-4 flex-1 overflow-y-auto">
          {navGroups.map((group, groupIndex) => {
            const isExpanded = expandedGroups.has(group.title);
            
            return (
              <div key={groupIndex} className="space-y-1.5">
                {/* Group Title - Clickable to expand/collapse */}
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-stone-800/50 rounded-lg transition-colors group"
                >
                  <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider group-hover:text-stone-400">
                    {group.title}
                  </h3>
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-stone-500 group-hover:text-stone-400" />
                  ) : (
                    <ChevronRight size={16} className="text-stone-500 group-hover:text-stone-400" />
                  )}
                </button>
                
                {/* Group Items - Show only when expanded */}
                {isExpanded && (
                  <div className="space-y-1.5">
                    {group.items.map((item) => {
                      const isLocked = item.locked === true;
                      
                      // Locked item (not clickable)
                      if (isLocked) {
                        return (
                          <div
                            key={item.to}
                            data-tour={item.tourAttr}
                            className="flex items-center gap-3 px-3 sm:px-4 py-3.5 sm:py-3 rounded-lg transition-colors relative text-stone-500 cursor-not-allowed opacity-60 min-h-[48px] touch-manipulation"
                          >
                            <item.icon size={20} className="flex-shrink-0" />
                            <span className="font-medium text-sm sm:text-base">{item.label}</span>
                            <div className="ml-auto text-orange-500 flex-shrink-0">
                              <Lock size={16} />
                            </div>
                          </div>
                        );
                      }
                      
                      // Active NavLink (clickable)
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setIsSidebarOpen(false)}
                          data-tour={item.tourAttr}
                          className={({ isActive }: any) => {
                            const baseClasses = "flex items-center gap-3 px-3 sm:px-4 py-3.5 sm:py-3 rounded-lg transition-colors relative min-h-[48px] touch-manipulation active:scale-95";
                            const activeClasses = "bg-orange-700 text-white shadow-lg";
                            const inactiveClasses = "text-stone-300 hover:bg-stone-800 hover:text-white";
                            return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
                          }}
                        >
                          <item.icon size={20} className="flex-shrink-0" />
                          <span className="font-medium text-sm sm:text-base">{item.label}</span>
                          {/* Unread badge for Messages */}
                          {item.to === '/chats' && unreadCount > 0 && (
                            <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold min-w-[20px] text-center flex-shrink-0">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer section */}

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-stone-800 bg-stone-900 space-y-2">
          {/* Install App Button */}
          {showInstallButton && (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-4 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl mb-3 active:scale-95"
            >
              <Download size={18} />
              <span>Install App</span>
            </button>
          )}
          
          {/* Help & Feedback Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => setShowTour(true)}
              className="flex items-center justify-center gap-1 text-xs text-stone-400 hover:text-orange-400 hover:bg-stone-800 px-2 py-2 rounded-lg transition-colors"
            >
              <HelpCircle size={14} />
              <span>Tour</span>
            </button>
            <button
              onClick={() => setShowFeedback(true)}
              className="flex items-center justify-center gap-1 text-xs text-stone-400 hover:text-orange-400 hover:bg-stone-800 px-2 py-2 rounded-lg transition-colors"
            >
              <MessageSquare size={14} />
              <span>Feedback</span>
            </button>
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
                className="bg-white text-orange-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-orange-50 transition-colors whitespace-nowrap self-end sm:self-auto active:scale-95"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-stone-50 via-orange-50/20 to-stone-50 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'auto' }}>
          <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-8 pb-24">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-200px)]">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Tour */}
      {showTour && <InteractiveTour onComplete={handleTourComplete} />}

      {/* Feedback Modal */}
      {showFeedback && <FeedbackPrompt onClose={() => setShowFeedback(false)} />}
    </div>
  );
};

export default Layout;