import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PenTool, BarChart2, BookOpen, Menu, X, Settings, User, LogOut, Info, HelpCircle, MessageSquare, Heart } from 'lucide-react';
import { getSettings, trackUsage, shouldShowFeedback } from '../services/storage';
import { UserSettings } from '../types';
import { useAuth } from '../contexts/AuthContext';
import InteractiveTour from './InteractiveTour';
import FeedbackPrompt from './FeedbackPrompt';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      if (user) {
        const data = await getSettings(user.uid);
        setSettings(data);
      }
    };
    fetchSettings();
  }, [location.pathname, user]);

  useEffect(() => {
    const checkFeedback = async () => {
      if (user) {
        await trackUsage(user.uid);
        const shouldShow = await shouldShowFeedback(user.uid);
        if (shouldShow) {
          setTimeout(() => setShowFeedback(true), 5000); // Show after 5 seconds
        }
      }
    };
    checkFeedback();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', tourAttr: 'dashboard' },
    { to: '/planner', icon: PenTool, label: 'Daily Planner', tourAttr: 'planner' },
    { to: '/analytics', icon: BarChart2, label: 'Analytics', tourAttr: 'analytics' },
    { to: '/journal', icon: Heart, label: 'Devotional Journal', tourAttr: 'journal' },
    { to: '/history', icon: BookOpen, label: 'History', tourAttr: 'history' },
    { to: '/settings', icon: Settings, label: 'Settings', tourAttr: 'settings' },
    { to: '/about', icon: Info, label: 'About' },
  ];

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-orange-700 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
           <svg className="h-8 w-8 text-orange-200 fill-current" viewBox="0 0 24 24">
             <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/> 
           </svg>
          <span className="font-serif font-bold text-lg">Sadhana</span>
        </div>
        <button onClick={toggleSidebar}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-stone-900 text-stone-100 transform transition-transform duration-300 ease-in-out flex flex-col
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Branding Area */}
        <div className="p-6 border-b border-stone-700 flex flex-col items-center text-center gap-4">
           <div className="text-orange-500">
             <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12,2C9,2,2,8,2,12c0,3.5,2.5,8,10,10c7.5-2,10-6.5,10-10C22,8,15,2,12,2z M12,20c-5,0-8-3-8-8c0-3,4-8,8-8s8,5,8,8 C20,17,17,20,12,20z M12,6c-1.5,0-3,1.5-3,3s1.5,3,3,3s3-1.5,3-3S13.5,6,12,6z"/>
             </svg>
           </div>
          
          <div>
            <h1 className="font-serif font-bold text-xl text-orange-50">{settings?.iskconCenter || 'Sadhana Lifeforce'}</h1>
            {settings?.guruName && <p className="text-xs text-stone-400 mt-1">Guided by {settings.guruName}</p>}
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              data-tour={item.tourAttr}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-orange-700 text-white shadow-lg' 
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'}
              `}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

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
              alt={user.displayName || 'User'} 
              className="w-8 h-8 rounded-full bg-stone-700"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.displayName}</p>
              <p className="text-xs text-stone-500 truncate">{user.email}</p>
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
      <main className="flex-1 overflow-y-auto h-screen relative bg-stone-50">
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24">
           {children}
        </div>
      </main>

      {/* Interactive Tour */}
      {showTour && <InteractiveTour onComplete={() => setShowTour(false)} />}
      
      {/* Feedback Prompt */}
      {showFeedback && <FeedbackPrompt onClose={() => setShowFeedback(false)} />}
    </div>
  );
};

export default Layout;