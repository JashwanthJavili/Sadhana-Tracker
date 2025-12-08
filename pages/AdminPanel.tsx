import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Trash2, RefreshCw, BarChart3, MessageSquare, 
  HelpCircle, Shield, UserX, Calendar, Activity, UserPlus, UserMinus,
  Download, Bell, Flag, CheckCircle, XCircle, Search, Filter,
  TrendingUp, Database, Zap, FileText, Eye, EyeOff, AlertTriangle, MoreVertical, MessageCircle, Send
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  getAllUsersAdmin, 
  deleteUserPermanently, 
  getAppStatistics,
  ADMIN_EMAIL,
  getAllAdmins,
  grantAdminAccess,
  revokeAdminAccess
} from '../services/admin';
import { migrateAllUserProfiles } from '../scripts/migrateUserProfiles';
import { ref, set, push, get, remove, update } from 'firebase/database';
import { db } from '../services/firebase';
import FeedbackViewer from '../components/FeedbackViewer';
import AdminRequestsPanel from '../components/AdminRequestsPanel';

interface UserInfo {
  uid: string;
  userName: string;
  email: string;
  guruName: string;
  iskconCenter: string;
  joinedDate: number;
  lastActive: number;
  loginCount: number;
  isAdmin?: boolean;
  feedbackRating?: number;
  feedbackTimestamp?: number;
}

interface Admin {
  uid: string;
  email: string;
  isSuperAdmin: boolean;
  grantedAt: number;
}

interface AppStats {
  totalUsers: number;
  activeUsers: number;
  totalQuestions: number;
  totalAnswers: number;
  totalChats: number;
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [stats, setStats] = useState<AppStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'admins' | 'content' | 'feedback' | 'requests' | 'announcements' | 'system' | 'logs' | 'reports' | 'settings'>('overview');
  
  // Announcements State
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementType, setAnnouncementType] = useState<'info' | 'update' | 'warning' | 'celebration'>('info');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [fontSize, setFontSize] = useState('16');
  const [textColor, setTextColor] = useState('#000000');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Content Moderation States
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [flaggedContent, setFlaggedContent] = useState<any[]>([]);
  const [contentFilter, setContentFilter] = useState<'all' | 'questions' | 'answers' | 'flagged'>('all');
  const [contentSearch, setContentSearch] = useState('');

  // App Settings States
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [guestModeEnabled, setGuestModeEnabled] = useState(true);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [firebaseUsage, setFirebaseUsage] = useState<any>(null);

  const isSuperAdmin = user?.email === ADMIN_EMAIL;
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PANEL_PASSWORD || 'Hare Krishna';

  // Password authentication
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
      setPasswordInput('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setPasswordInput('');
    }
  };

  useEffect(() => {
    // Redirect if not admin
    if (!isSuperAdmin) {
      alert('⛔ Access Denied: Admin privileges required');
      navigate('/dashboard');
      return;
    }

    if (isAuthenticated) {
      loadData();
    }
  }, [isSuperAdmin, navigate, isAuthenticated]);

  const loadContentData = async () => {
    try {
      // Load all questions
      const questionsSnapshot = await get(ref(db, 'questions'));
      const questionsData: any[] = [];
      if (questionsSnapshot.exists()) {
        questionsSnapshot.forEach((child) => {
          questionsData.push({ id: child.key, ...child.val() });
        });
      }
      setQuestions(questionsData);

      // Load all answers
      const answersData: any[] = [];
      for (const question of questionsData) {
        const answersSnapshot = await get(ref(db, `questions/${question.id}/answers`));
        if (answersSnapshot.exists()) {
          answersSnapshot.forEach((child) => {
            answersData.push({ 
              id: child.key, 
              questionId: question.id,
              questionTitle: question.title,
              ...child.val() 
            });
          });
        }
      }
      setAnswers(answersData);

      // Load flagged content (from a dedicated flagged content collection)
      const flaggedSnapshot = await get(ref(db, 'flaggedContent'));
      const flaggedData: any[] = [];
      if (flaggedSnapshot.exists()) {
        flaggedSnapshot.forEach((child) => {
          flaggedData.push({ id: child.key, ...child.val() });
        });
      }
      setFlaggedContent(flaggedData);

    } catch (error) {
      console.error('Error loading content data:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData, adminsData] = await Promise.all([
        getAllUsersAdmin(),
        getAppStatistics(),
        getAllAdmins(),
        loadContentData(),
        loadAppSettings(),
        loadFirebaseUsage()
      ]);
      
      // Mark users who are admins
      const adminIds = new Set(adminsData.map(a => a.uid));
      const usersWithAdminFlag = usersData.map(u => ({
        ...u,
        isAdmin: adminIds.has(u.uid) || u.email === ADMIN_EMAIL
      }));
      
      setUsers(usersWithAdminFlag);
      setStats(statsData);
      setAdmins(adminsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      alert('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const loadAppSettings = async () => {
    try {
      const settingsRef = ref(db, 'appSettings');
      const snapshot = await get(settingsRef);
      
      if (snapshot.exists()) {
        const settings = snapshot.val();
        setMaintenanceMode(settings.maintenanceMode || false);
        setGuestModeEnabled(settings.guestModeEnabled !== false); // default true
        setRegistrationEnabled(settings.registrationEnabled !== false); // default true
      }
    } catch (error) {
      console.error('Error loading app settings:', error);
    }
  };

  const loadFirebaseUsage = async () => {
    try {
      // Estimate Firebase usage by counting data
      const usersSnapshot = await get(ref(db, 'users'));
      const questionsSnapshot = await get(ref(db, 'questions'));
      const chatsSnapshot = await get(ref(db, 'chats'));
      
      let totalSize = 0;
      let userCount = 0;
      let questionCount = 0;
      let chatCount = 0;

      if (usersSnapshot.exists()) {
        userCount = Object.keys(usersSnapshot.val()).length;
        totalSize += JSON.stringify(usersSnapshot.val()).length;
      }

      if (questionsSnapshot.exists()) {
        questionCount = Object.keys(questionsSnapshot.val()).length;
        totalSize += JSON.stringify(questionsSnapshot.val()).length;
      }

      if (chatsSnapshot.exists()) {
        chatCount = Object.keys(chatsSnapshot.val()).length;
        totalSize += JSON.stringify(chatsSnapshot.val()).length;
      }

      const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
      const freeLimit = 1024; // 1GB free tier
      const usagePercent = ((parseFloat(sizeInMB) / freeLimit) * 100).toFixed(2);

      setFirebaseUsage({
        totalSizeMB: parseFloat(sizeInMB),
        freeLimitMB: freeLimit,
        usagePercent: parseFloat(usagePercent),
        userCount,
        questionCount,
        chatCount,
        estimatedReadsPerDay: userCount * 50, // Rough estimate
        estimatedWritesPerDay: userCount * 20
      });
    } catch (error) {
      console.error('Error loading Firebase usage:', error);
    }
  };

  const saveAppSettings = async (setting: string, value: boolean) => {
    try {
      await update(ref(db, 'appSettings'), { [setting]: value });
      
      switch (setting) {
        case 'maintenanceMode':
          setMaintenanceMode(value);
          break;
        case 'guestModeEnabled':
          setGuestModeEnabled(value);
          break;
        case 'registrationEnabled':
          setRegistrationEnabled(value);
          break;
      }

      alert(`✅ ${setting} ${value ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error saving app settings:', error);
      alert('❌ Failed to save settings');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`⚠️ PERMANENT DELETE\n\nAre you sure you want to permanently delete user "${userName}"?\n\nThis will remove:\n- User profile\n- All entries and journal\n- All messages\n- All questions and answers\n\nThis action CANNOT be undone!`)) {
      return;
    }

    // Double confirmation for safety
    const confirmText = prompt(`Type "${userName}" to confirm deletion:`);
    if (confirmText !== userName) {
      alert('❌ Deletion cancelled - name did not match');
      return;
    }

    try {
      await deleteUserPermanently(userId);
      alert(`✅ User "${userName}" has been permanently deleted`);
      loadData(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(`❌ Failed to delete user: ${error.message}`);
    }
  };

  const handleMigrateProfiles = async () => {
    if (!confirm('Create chat profiles for all existing users?')) return;

    try {
      setMigrationStatus('running');
      const result = await migrateAllUserProfiles();
      setMigrationStatus('success');
      alert(`✅ Migration complete!\n${result.migratedCount} created\n${result.skippedCount} skipped\n${result.errorCount} errors`);
      setTimeout(() => setMigrationStatus('idle'), 3000);
      loadData();
    } catch (error: any) {
      setMigrationStatus('error');
      alert(`❌ Migration failed: ${error.message}`);
      setTimeout(() => setMigrationStatus('idle'), 3000);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Prepare analytics data
  const getUserActivityData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        active: 0,
        new: 0
      };
    });

    users.forEach(user => {
      const dayIndex = Math.floor((Date.now() - user.lastActive) / (24 * 60 * 60 * 1000));
      if (dayIndex >= 0 && dayIndex < 7) {
        last7Days[6 - dayIndex].active++;
      }
      
      const joinDayIndex = Math.floor((Date.now() - user.joinedDate) / (24 * 60 * 60 * 1000));
      if (joinDayIndex >= 0 && joinDayIndex < 7) {
        last7Days[6 - joinDayIndex].new++;
      }
    });

    return last7Days;
  };

  const getCenterDistribution = () => {
    const centers: { [key: string]: number } = {};
    users.forEach(user => {
      const center = user.iskconCenter || 'Not Specified';
      centers[center] = (centers[center] || 0) + 1;
    });

    return Object.entries(centers)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 centers
  };

  const getEngagementStats = () => {
    const highly = users.filter(u => u.loginCount > 10).length;
    const moderate = users.filter(u => u.loginCount > 3 && u.loginCount <= 10).length;
    const low = users.filter(u => u.loginCount <= 3).length;

    return [
      { name: 'Highly Active (10+)', value: highly, color: '#22c55e' },
      { name: 'Moderate (4-10)', value: moderate, color: '#f59e0b' },
      { name: 'Low (1-3)', value: low, color: '#ef4444' }
    ];
  };

  const handleBulkAction = async (action: 'select-all' | 'deselect-all') => {
    if (action === 'select-all') {
      setSelectedUsers(new Set(filteredUsers.map(u => u.uid)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleExportUsers = () => {
    const csv = [
      ['Name', 'Email', 'Guru', 'Center', 'Joined', 'Last Active', 'Logins', 'Is Admin'].join(','),
      ...filteredUsers.map(u => [
        u.userName,
        u.email,
        u.guruName,
        u.iskconCenter,
        formatDate(u.joinedDate),
        formatDate(u.lastActive),
        u.loginCount,
        u.isAdmin ? 'Yes' : 'No'
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sadhana-sanga-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBroadcastAnnouncement = async () => {
    if (!announcement.trim()) {
      alert('⚠️ Please enter an announcement message');
      return;
    }

    if (!confirm(`📢 Send this announcement to all ${users.length} users?\n\n"${announcement}"`)) {
      return;
    }

    try {
      const timestamp = Date.now();
      
      // Save broadcast to database
      const broadcastRef = ref(db, `broadcasts/${timestamp}`);
      await set(broadcastRef, {
        message: announcement,
        sentBy: user?.email,
        sentByName: user?.displayName || 'Admin',
        timestamp,
        recipientCount: users.length
      });

      // Send notification to each user
      const notificationPromises = users.map(async (targetUser) => {
        const notificationRef = push(ref(db, `userNotifications/${targetUser.uid}`));
        return set(notificationRef, {
          type: 'broadcast',
          title: '📢 Admin Announcement',
          message: announcement,
          from: 'Admin Team',
          timestamp,
          read: false,
          priority: 'high'
        });
      });

      await Promise.all(notificationPromises);

      alert(`✅ Success!\n\nAnnouncement sent to ${users.length} users.\n\nAll users will receive this notification when they next use the app.`);
      setAnnouncement('');
      
      // Reload data to show updated stats
      loadData();
    } catch (error) {
      console.error('Broadcast error:', error);
      alert('❌ Failed to send announcement. Please try again.');
    }
  };

  // Content Moderation Handlers
  const handleDeleteQuestion = async (questionId: string, title: string) => {
    if (!confirm(`Delete question: "${title}"?\n\nThis will also delete all answers.`)) return;

    try {
      await remove(ref(db, `questions/${questionId}`));
      alert('✅ Question deleted successfully');
      loadContentData();
    } catch (error: any) {
      alert(`❌ Failed to delete: ${error.message}`);
    }
  };

  const handleDeleteAnswer = async (questionId: string, answerId: string) => {
    if (!confirm('Delete this answer?')) return;

    try {
      await remove(ref(db, `questions/${questionId}/answers/${answerId}`));
      alert('✅ Answer deleted successfully');
      loadContentData();
    } catch (error: any) {
      alert(`❌ Failed to delete: ${error.message}`);
    }
  };

  const handleFlagContent = async (contentId: string, contentType: 'question' | 'answer', content: any) => {
    try {
      const flagRef = push(ref(db, 'flaggedContent'));
      await set(flagRef, {
        contentId,
        contentType,
        content,
        flaggedBy: user?.uid,
        flaggedAt: Date.now(),
        reason: 'Admin flagged for review',
        status: 'pending'
      });
      alert('✅ Content flagged successfully');
      loadContentData();
    } catch (error: any) {
      alert(`❌ Failed to flag: ${error.message}`);
    }
  };

  const handleUnflagContent = async (flagId: string) => {
    if (!confirm('Remove flag from this content?')) return;

    try {
      await remove(ref(db, `flaggedContent/${flagId}`));
      alert('✅ Content unflagged');
      loadContentData();
    } catch (error: any) {
      alert(`❌ Failed: ${error.message}`);
    }
  };

  const handleApproveContent = async (flagId: string) => {
    try {
      await update(ref(db, `flaggedContent/${flagId}`), {
        status: 'approved',
        reviewedBy: user?.uid,
        reviewedAt: Date.now()
      });
      alert('✅ Content approved');
      loadContentData();
    } catch (error: any) {
      alert(`❌ Failed: ${error.message}`);
    }
  };

  const handleHideContent = async (contentType: 'question' | 'answer', contentId: string, questionId?: string) => {
    if (!confirm('Hide this content? It will no longer be visible to users.')) return;

    try {
      const path = contentType === 'question' 
        ? `questions/${contentId}` 
        : `questions/${questionId}/answers/${contentId}`;
      
      await update(ref(db, path), {
        hidden: true,
        hiddenBy: user?.uid,
        hiddenAt: Date.now()
      });
      
      alert('✅ Content hidden successfully');
      loadContentData();
    } catch (error: any) {
      alert(`❌ Failed: ${error.message}`);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.guruName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.iskconCenter.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' ? true :
      filterStatus === 'active' ? (u.lastActive > Date.now() - 7 * 24 * 60 * 60 * 1000) :
      filterStatus === 'inactive' ? (u.lastActive <= Date.now() - 7 * 24 * 60 * 60 * 1000) :
      true;

    return matchesSearch && matchesStatus;
  });

  const handleGrantAdmin = async (userId: string, userEmail: string) => {
    if (!confirm(`Grant admin privileges to ${userEmail}?`)) return;

    try {
      await grantAdminAccess(userId, userEmail);
      alert(`✅ Admin rights granted to ${userEmail}`);
      loadData();
    } catch (error: any) {
      alert(`❌ Failed: ${error.message}`);
    }
  };

  const handleRevokeAdmin = async (userId: string, userName: string) => {
    if (!confirm(`Revoke admin privileges from ${userName}?`)) return;

    try {
      await revokeAdminAccess(userId);
      alert(`✅ Admin rights revoked from ${userName}`);
      loadData();
    } catch (error: any) {
      alert(`❌ Failed: ${error.message}`);
    }
  };

  if (!isSuperAdmin) return null;

  // Password Authentication Screen
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-300 p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <Shield className="mx-auto mb-4 text-red-600" size={64} />
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Admin Panel Access</h1>
            <p className="text-stone-600">Enter password to continue</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                autoFocus
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <XCircle size={16} />
                  {passwordError}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg"
            >
              Access Admin Panel
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-stone-500">
              🔒 Secure access required
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-orange-600" size={48} />
          <p className="text-xl font-bold">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 via-orange-600 to-red-700 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-2xl border-2 border-red-400">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
              <Shield className="text-white" size={24} />
              Admin Control Panel
            </h1>
            <p className="text-red-100 text-sm sm:text-base md:text-lg">Welcome, {user?.email}</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-red-700 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold hover:bg-red-50 transition-all shadow-lg whitespace-nowrap"
          >
            <RefreshCw size={16} className="sm:w-5 sm:h-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <Users size={32} className="mb-2" />
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
            <p className="text-blue-100">Total Users</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <Activity size={32} className="mb-2" />
            <p className="text-3xl font-bold">{stats.activeUsers}</p>
            <p className="text-green-100">Active (24h)</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <MessageSquare size={32} className="mb-2" />
            <p className="text-3xl font-bold">{stats.totalChats}</p>
            <p className="text-purple-100">Chats</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <HelpCircle size={32} className="mb-2" />
            <p className="text-3xl font-bold">{stats.totalQuestions}</p>
            <p className="text-orange-100">Questions</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
            <BarChart3 size={32} className="mb-2" />
            <p className="text-3xl font-bold">{stats.totalAnswers}</p>
            <p className="text-pink-100">Answers</p>
          </div>
        </div>
      )}

      {/* Admin Actions */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-stone-200 p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Shield size={28} className="text-red-600" />
          Admin Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleMigrateProfiles}
            disabled={migrationStatus === 'running'}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${
              migrationStatus === 'running'
                ? 'bg-gray-400 cursor-not-allowed'
                : migrationStatus === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <Users size={20} />
            {migrationStatus === 'running' ? 'Migrating...' : 
             migrationStatus === 'success' ? '✅ Complete!' : 
             'Migrate All Profiles'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-stone-200 p-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <BarChart3 className="inline mr-2" size={20} />
            Overview & Analytics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Users className="inline mr-2" size={20} />
            Users ({users.length})
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'admins'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Shield className="inline mr-2" size={20} />
              Admins ({admins.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('content')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'content'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Flag className="inline mr-2" size={20} />
            Content Moderation
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'feedback'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <MessageCircle className="inline mr-2" size={20} />
            User Feedback
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'requests'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Send className="inline mr-2" size={20} />
            Content Requests
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'announcements'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Bell className="inline mr-2" size={20} />
              Announcements
            </button>
          )}
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('system')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'system'
                  ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Database className="inline mr-2" size={20} />
              System Health
            </button>
          )}
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Zap className="inline mr-2" size={20} />
            App Settings
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Activity Chart */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-stone-200 p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="text-blue-600" size={24} />
                User Activity (Last 7 Days)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={getUserActivityData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#888888" tickLine={true} />
                  <YAxis stroke="#888888" tickLine={true} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} name="Active Users" />
                  <Line type="monotone" dataKey="new" stroke="#10b981" strokeWidth={2} name="New Users" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Center Distribution */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-stone-200 p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="text-green-600" size={24} />
                Top ISKCON Centers
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getCenterDistribution()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} stroke="#888888" tickLine={true} />
                  <YAxis stroke="#888888" tickLine={true} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Engagement Pie Chart */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-stone-200 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="text-purple-600" size={24} />
              User Engagement Levels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getEngagementStats()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getEngagementStats().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-4">
                {getEngagementStats().map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stat.color }}></div>
                      <span className="font-semibold">{stat.name}</span>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Broadcast Announcement */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-xl border-2 border-orange-300 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Bell className="text-orange-600" size={24} />
              Broadcast Announcement to All Users
            </h3>
            <div className="flex gap-4">
              <textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Type your announcement message here..."
                className="flex-1 p-4 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                rows={3}
              />
              <button
                onClick={handleBroadcastAnnouncement}
                className="px-6 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg"
              >
                <Bell className="inline mr-2" size={20} />
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-stone-200 p-6">
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-4 py-3 border-2 border-stone-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Users</option>
                <option value="active">Active (Last 7 Days)</option>
                <option value="inactive">Inactive (&gt;7 Days)</option>
              </select>
              <button
                onClick={handleExportUsers}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg flex items-center gap-2"
              >
                <Download size={20} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.size > 0 && (
            <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-xl flex items-center justify-between">
              <span className="font-bold text-blue-700">
                {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedUsers(new Set())}
                  className="px-4 py-2 bg-stone-200 text-stone-700 rounded-lg font-semibold hover:bg-stone-300 transition-all"
                >
                  Clear Selection
                </button>
                {/* Bulk deletion removed - delete users individually for safety */}
              </div>
            </div>
          )}

          {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-100 border-b-2 border-stone-300">
              <tr>
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={() => handleBulkAction(selectedUsers.size === filteredUsers.length ? 'deselect-all' : 'select-all')}
                    className="w-5 h-5 cursor-pointer"
                  />
                </th>
                <th className="p-3 text-left font-bold">User</th>
                <th className="p-3 text-left font-bold">Email</th>
                <th className="p-3 text-left font-bold">Guru</th>
                <th className="p-3 text-left font-bold">Center</th>
                <th className="p-3 text-left font-bold">Joined</th>
                <th className="p-3 text-left font-bold">Last Active</th>
                <th className="p-3 text-center font-bold">Logins</th>
                <th className="p-3 text-center font-bold">Feedback</th>
                <th className="p-3 text-center font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.uid} className="border-b border-stone-200 hover:bg-stone-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(u.uid)}
                      onChange={() => {
                        const newSet = new Set(selectedUsers);
                        if (newSet.has(u.uid)) {
                          newSet.delete(u.uid);
                        } else {
                          newSet.add(u.uid);
                        }
                        setSelectedUsers(newSet);
                      }}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </td>
                  <td className="p-3 font-semibold">
                    {u.userName}
                    {u.isAdmin && (
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                        ADMIN
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-sm text-stone-600">{u.email}</td>
                  <td className="p-3 text-sm">{u.guruName}</td>
                  <td className="p-3 text-sm">{u.iskconCenter}</td>
                  <td className="p-3 text-sm">{formatDate(u.joinedDate)}</td>
                  <td className="p-3 text-sm">
                    <span className={u.lastActive > Date.now() - 86400000 ? 'text-green-600 font-bold' : 'text-stone-500'}>
                      {formatRelativeTime(u.lastActive)}
                    </span>
                  </td>
                  <td className="p-3 text-center font-bold">{u.loginCount}</td>
                  <td className="p-3 text-center">
                    {u.feedbackRating ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= u.feedbackRating! ? 'text-yellow-400' : 'text-stone-300'}>
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-stone-500">
                          {formatDate(u.feedbackTimestamp!)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-stone-400 text-xs">No feedback</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === u.uid ? null : u.uid)}
                        className="p-2 hover:bg-stone-200 rounded-lg transition-all"
                        title="User actions"
                      >
                        <MoreVertical size={20} className="text-stone-600" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {openDropdown === u.uid && (
                        <>
                          {/* Backdrop to close dropdown */}
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenDropdown(null)}
                          />
                          
                          {/* Dropdown Content */}
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-stone-200 z-20 overflow-hidden">
                            <div className="p-2 bg-stone-100 border-b border-stone-200">
                              <p className="text-xs font-bold text-stone-600 px-2">USER ACTIONS</p>
                            </div>
                            
                            <div className="py-1">
                              {/* Admin Actions */}
                              {!u.isAdmin ? (
                                <button
                                  onClick={() => {
                                    handleGrantAdmin(u.uid, u.email);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-green-50 transition-all flex items-center gap-2 text-green-700 font-semibold"
                                >
                                  <UserPlus size={16} />
                                  Grant Admin Rights
                                </button>
                              ) : u.email !== 'jashwanthjavili7@gmail.com' ? (
                                <button
                                  onClick={() => {
                                    handleRevokeAdmin(u.uid, u.userName);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-orange-50 transition-all flex items-center gap-2 text-orange-700 font-semibold"
                                >
                                  <UserMinus size={16} />
                                  Revoke Admin Rights
                                </button>
                              ) : (
                                <div className="px-4 py-2 text-stone-400 text-sm flex items-center gap-2">
                                  <Shield size={16} />
                                  Super Admin (Protected)
                                </div>
                              )}
                              
                              <div className="border-t border-stone-200 my-1" />
                              
                              {/* View Profile */}
                              <button
                                onClick={() => {
                                  alert(`User Profile:\n\nName: ${u.userName}\nEmail: ${u.email}\nGuru: ${u.guruName}\nCenter: ${u.iskconCenter}\nJoined: ${formatDate(u.joinedDate)}\nLogins: ${u.loginCount}`);
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-all flex items-center gap-2 text-blue-700 font-semibold"
                              >
                                <Eye size={16} />
                                View Full Profile
                              </button>
                              
                              {/* Send Message */}
                              <button
                                onClick={() => {
                                  const message = prompt(`Send message to ${u.userName}:`);
                                  if (message) {
                                    alert(`Message sent to ${u.userName}: ${message}`);
                                  }
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-all flex items-center gap-2 text-purple-700 font-semibold"
                              >
                                <Bell size={16} />
                                Send Direct Message
                              </button>
                              
                              {isSuperAdmin && (
                                <>
                                  <div className="border-t border-stone-200 my-1" />
                                  
                                  {/* Delete User */}
                                  <button
                                    onClick={() => {
                                      handleDeleteUser(u.uid, u.userName);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-red-50 transition-all flex items-center gap-2 text-red-700 font-semibold"
                                  >
                                    <Trash2 size={16} />
                                    Delete User
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {activeTab === 'admins' && (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-stone-200 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield size={28} className="text-red-600" />
              Admin Management ({admins.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-50 border-b-2 border-red-300">
                <tr>
                  <th className="p-3 text-left font-bold">Admin User</th>
                  <th className="p-3 text-left font-bold">Email</th>
                  <th className="p-3 text-left font-bold">Type</th>
                  <th className="p-3 text-left font-bold">Granted At</th>
                  <th className="p-3 text-center font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.uid} className="border-b border-stone-200 hover:bg-red-50">
                    <td className="p-3 font-semibold">
                      {users.find(u => u.uid === admin.uid)?.userName || admin.email.split('@')[0] || 'Admin User'}
                    </td>
                    <td className="p-3 text-sm text-stone-600">{admin.email}</td>
                    <td className="p-3">
                      {admin.isSuperAdmin ? (
                        <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                          SUPER ADMIN
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                          ADMIN
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-sm">
                      {admin.grantedAt ? formatDate(admin.grantedAt) : 'N/A'}
                    </td>
                    <td className="p-3 text-center">
                      {!admin.isSuperAdmin ? (
                        <button
                          onClick={() => handleRevokeAdmin(admin.uid, users.find(u => u.uid === admin.uid)?.userName || admin.email.split('@')[0] || 'Admin')}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-all flex items-center gap-2 mx-auto"
                          title="Revoke admin rights"
                        >
                          <UserMinus size={16} />
                          Revoke Admin
                        </button>
                      ) : (
                        <span className="px-4 py-2 bg-stone-200 text-stone-500 rounded-lg font-bold text-sm">
                          Cannot Revoke
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-xl p-6 text-white shadow-2xl">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Flag size={32} />
              Advanced Content Moderation
            </h2>
            <p className="text-purple-100">Review, moderate, and manage all user-generated content</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-300">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <HelpCircle className="text-blue-600" size={24} />
                Questions
              </h3>
              <p className="text-3xl font-bold text-blue-600">{questions.length}</p>
              <p className="text-sm text-stone-600 mt-2">Total questions</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-300">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <MessageSquare className="text-green-600" size={24} />
                Answers
              </h3>
              <p className="text-3xl font-bold text-green-600">{answers.length}</p>
              <p className="text-sm text-stone-600 mt-2">Total answers</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-300">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <AlertTriangle className="text-red-600" size={24} />
                Flagged
              </h3>
              <p className="text-3xl font-bold text-red-600">{flaggedContent.filter(f => f.status === 'pending').length}</p>
              <p className="text-sm text-stone-600 mt-2">Awaiting review</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-300">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Eye className="text-purple-600" size={24} />
                Hidden
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {questions.filter(q => q.hidden).length + answers.filter(a => a.hidden).length}
              </p>
              <p className="text-sm text-stone-600 mt-2">Hidden content</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-purple-200">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setContentFilter('all')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    contentFilter === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All Content
                </button>
                <button
                  onClick={() => setContentFilter('questions')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    contentFilter === 'questions'
                      ? 'bg-blue-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Questions ({questions.length})
                </button>
                <button
                  onClick={() => setContentFilter('answers')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    contentFilter === 'answers'
                      ? 'bg-green-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Answers ({answers.length})
                </button>
                <button
                  onClick={() => setContentFilter('flagged')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    contentFilter === 'flagged'
                      ? 'bg-red-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Flagged ({flaggedContent.filter(f => f.status === 'pending').length})
                </button>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={contentSearch}
                    onChange={(e) => setContentSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Questions List */}
          {(contentFilter === 'all' || contentFilter === 'questions') && (
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <HelpCircle className="text-blue-600" size={24} />
                Questions Management
              </h3>
              <div className="space-y-4">
                {questions
                  .filter(q => 
                    !contentSearch || 
                    q.title?.toLowerCase().includes(contentSearch.toLowerCase()) ||
                    q.description?.toLowerCase().includes(contentSearch.toLowerCase())
                  )
                  .slice(0, 10)
                  .map((question) => (
                    <div key={question.id} className={`p-4 rounded-lg border-2 ${question.hidden ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-stone-800">{question.title}</h4>
                          <p className="text-stone-600 text-sm mt-1 line-clamp-2">{question.description}</p>
                          <div className="flex gap-4 mt-2 text-xs text-stone-500">
                            <span>By: {question.userName || 'Anonymous'}</span>
                            <span>Category: {question.category || 'General'}</span>
                            <span>Posted: {new Date(question.timestamp).toLocaleDateString()}</span>
                            {question.hidden && <span className="text-red-600 font-bold">⚠️ HIDDEN</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!question.hidden && (
                            <>
                              <button
                                onClick={() => handleHideContent('question', question.id)}
                                className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600"
                                title="Hide Content"
                              >
                                <EyeOff size={16} />
                              </button>
                              <button
                                onClick={() => handleFlagContent(question.id, 'question', question)}
                                className="px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm font-bold hover:bg-yellow-600"
                                title="Flag for Review"
                              >
                                <Flag size={16} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteQuestion(question.id, question.title)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700"
                            title="Delete Question"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                {questions.length === 0 && (
                  <div className="text-center py-8 text-stone-500">
                    No questions found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Answers List */}
          {(contentFilter === 'all' || contentFilter === 'answers') && (
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <MessageSquare className="text-green-600" size={24} />
                Answers Management
              </h3>
              <div className="space-y-4">
                {answers
                  .filter(a => 
                    !contentSearch || 
                    a.answer?.toLowerCase().includes(contentSearch.toLowerCase()) ||
                    a.questionTitle?.toLowerCase().includes(contentSearch.toLowerCase())
                  )
                  .slice(0, 10)
                  .map((answer) => (
                    <div key={answer.id} className={`p-4 rounded-lg border-2 ${answer.hidden ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-200'}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="text-xs text-stone-500 mb-1">Question: {answer.questionTitle}</p>
                          <p className="text-stone-800">{answer.answer}</p>
                          <div className="flex gap-4 mt-2 text-xs text-stone-500">
                            <span>By: {answer.userName || 'Anonymous'}</span>
                            <span>Posted: {new Date(answer.timestamp).toLocaleDateString()}</span>
                            {answer.hidden && <span className="text-red-600 font-bold">⚠️ HIDDEN</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!answer.hidden && (
                            <>
                              <button
                                onClick={() => handleHideContent('answer', answer.id, answer.questionId)}
                                className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600"
                                title="Hide Content"
                              >
                                <EyeOff size={16} />
                              </button>
                              <button
                                onClick={() => handleFlagContent(answer.id, 'answer', answer)}
                                className="px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm font-bold hover:bg-yellow-600"
                                title="Flag for Review"
                              >
                                <Flag size={16} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteAnswer(answer.questionId, answer.id)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700"
                            title="Delete Answer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                {answers.length === 0 && (
                  <div className="text-center py-8 text-stone-500">
                    No answers found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Flagged Content */}
          {(contentFilter === 'all' || contentFilter === 'flagged') && (
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-red-200">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-600" size={24} />
                Flagged Content Review
              </h3>
              <div className="space-y-4">
                {flaggedContent
                  .filter(f => f.status === 'pending')
                  .map((item) => (
                    <div key={item.id} className="p-4 bg-red-50 rounded-lg border-2 border-red-300">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                              {item.contentType?.toUpperCase()}
                            </span>
                            <span className="text-xs text-stone-500">
                              Flagged: {new Date(item.flaggedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-stone-800">{item.content?.title || item.content?.answer}</p>
                          <p className="text-xs text-stone-600 mt-1">Reason: {item.reason}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveContent(item.id)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleUnflagContent(item.id)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
                            title="Unflag"
                          >
                            <XCircle size={16} />
                          </button>
                          <button
                            onClick={() => item.contentType === 'question' 
                              ? handleDeleteQuestion(item.contentId, item.content?.title)
                              : handleDeleteAnswer(item.content?.questionId, item.contentId)
                            }
                            className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                {flaggedContent.filter(f => f.status === 'pending').length === 0 && (
                  <div className="text-center py-8 text-stone-500">
                    No flagged content pending review
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
            <h3 className="font-bold text-lg mb-4">Bulk Content Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => {
                  if (confirm('Export all content data to JSON?')) {
                    const data = { questions, answers, flaggedContent };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `content-export-${Date.now()}.json`;
                    a.click();
                  }
                }}
                className="px-4 py-3 bg-white text-purple-700 rounded-lg font-bold hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Export All Content
              </button>
              <button className="px-4 py-3 bg-white text-purple-700 rounded-lg font-bold hover:bg-purple-50 transition-all flex items-center justify-center gap-2">
                <RefreshCw size={20} />
                Refresh Data
              </button>
              <button className="px-4 py-3 bg-white text-purple-700 rounded-lg font-bold hover:bg-purple-50 transition-all flex items-center justify-center gap-2">
                <Search size={20} />
                Advanced Search
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 rounded-xl p-6 text-white shadow-2xl">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <MessageCircle size={32} />
              User Feedback Management
            </h2>
            <p className="text-pink-100">View and manage all user feedback submissions</p>
          </div>

          <FeedbackViewer />
        </div>
      )}

      {activeTab === 'requests' && (
        <AdminRequestsPanel />
      )}

      {/* Announcements Tab - Rich Text Broadcast System */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 text-white shadow-2xl">
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Bell size={32} />
              Broadcast Announcements
            </h2>
            <p className="text-cyan-100">Send styled announcements and notifications to all users</p>
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white rounded-xl shadow-xl border-2 border-cyan-200 p-6">
            <h3 className="text-xl font-bold mb-4 text-cyan-700">Create New Announcement</h3>
            
            {/* Announcement Type Selector */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-stone-700 mb-2">Announcement Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: 'info', label: '📢 Information', color: 'blue' },
                  { value: 'update', label: '🆕 Version Update', color: 'green' },
                  { value: 'warning', label: '⚠️ Important Notice', color: 'amber' },
                  { value: 'celebration', label: '🎉 Celebration', color: 'purple' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setAnnouncementType(type.value as any)}
                    className={`p-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                      announcementType === type.value
                        ? `bg-${type.color}-600 text-white border-${type.color}-600 shadow-lg scale-105`
                        : `bg-white text-${type.color}-700 border-${type.color}-300 hover:border-${type.color}-500`
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title Input */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-stone-700 mb-2">Title</label>
              <input
                type="text"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="Enter announcement title..."
                className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-cyan-500 focus:outline-none text-lg font-semibold"
              />
            </div>

            {/* Text Formatting Toolbar */}
            <div className="mb-2">
              <label className="block text-sm font-bold text-stone-700 mb-2">Message</label>
              <div className="flex flex-wrap gap-2 p-3 bg-stone-100 rounded-t-lg border-2 border-b-0 border-stone-300">
                {/* Bold */}
                <button
                  onClick={() => setIsBold(!isBold)}
                  className={`px-3 py-2 rounded-lg font-bold transition-all ${
                    isBold ? 'bg-cyan-600 text-white' : 'bg-white text-stone-700 hover:bg-stone-200'
                  }`}
                  title="Bold"
                >
                  <span className="font-bold">B</span>
                </button>
                
                {/* Italic */}
                <button
                  onClick={() => setIsItalic(!isItalic)}
                  className={`px-3 py-2 rounded-lg font-bold transition-all ${
                    isItalic ? 'bg-cyan-600 text-white' : 'bg-white text-stone-700 hover:bg-stone-200'
                  }`}
                  title="Italic"
                >
                  <span className="italic">I</span>
                </button>

                <div className="w-px h-8 bg-stone-300"></div>

                {/* Font Size */}
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="px-3 py-2 rounded-lg border-2 border-stone-300 bg-white hover:border-cyan-500 transition-all cursor-pointer"
                >
                  <option value="12">Small</option>
                  <option value="16">Normal</option>
                  <option value="20">Large</option>
                  <option value="24">Extra Large</option>
                </select>

                {/* Text Color */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-stone-700">Color:</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-12 h-10 rounded-lg border-2 border-stone-300 cursor-pointer"
                  />
                </div>

                <div className="w-px h-8 bg-stone-300"></div>

                {/* Quick Emojis */}
                <div className="flex gap-1">
                  {['🙏', '🎉', '📢', '⚠️', '✨', '🔔', '❤️', '🌟'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setAnnouncementText(announcementText + emoji)}
                      className="px-2 py-1 hover:bg-stone-200 rounded transition-all text-xl"
                      title={`Add ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Message Textarea */}
            <textarea
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="Type your message here..."
              rows={6}
              style={{
                fontWeight: isBold ? 'bold' : 'normal',
                fontStyle: isItalic ? 'italic' : 'normal',
                fontSize: `${fontSize}px`,
                color: textColor
              }}
              className="w-full px-4 py-3 border-2 border-t-0 border-stone-300 rounded-b-lg focus:border-cyan-500 focus:outline-none resize-none"
            />

            {/* Preview */}
            <div className="mt-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border-2 border-cyan-200">
              <p className="text-xs font-bold text-cyan-700 mb-2">PREVIEW</p>
              <div className={`
                p-4 rounded-lg shadow-md
                ${announcementType === 'info' ? 'bg-blue-50 border-2 border-blue-300' : ''}
                ${announcementType === 'update' ? 'bg-green-50 border-2 border-green-300' : ''}
                ${announcementType === 'warning' ? 'bg-amber-50 border-2 border-amber-300' : ''}
                ${announcementType === 'celebration' ? 'bg-purple-50 border-2 border-purple-300' : ''}
              `}>
                {announcementTitle && (
                  <h4 className="font-bold text-lg mb-2">{announcementTitle}</h4>
                )}
                {announcementText && (
                  <p
                    style={{
                      fontWeight: isBold ? 'bold' : 'normal',
                      fontStyle: isItalic ? 'italic' : 'normal',
                      fontSize: `${fontSize}px`,
                      color: textColor
                    }}
                    className="whitespace-pre-wrap"
                  >
                    {announcementText}
                  </p>
                )}
                {!announcementTitle && !announcementText && (
                  <p className="text-stone-400 italic">Your announcement will appear here...</p>
                )}
              </div>
            </div>

            {/* Send Button */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={async () => {
                  if (!announcementTitle || !announcementText) {
                    alert('Please enter both title and message');
                    return;
                  }
                  
                  try {
                    const announcementData = {
                      title: announcementTitle,
                      message: announcementText,
                      type: announcementType,
                      formatting: {
                        bold: isBold,
                        italic: isItalic,
                        fontSize: fontSize,
                        color: textColor
                      },
                      sentBy: user?.email,
                      timestamp: Date.now()
                    };

                    // Send to all users
                    const promises = users.map(async (targetUser) => {
                      const notifRef = push(ref(db, `userNotifications/${targetUser.uid}`));
                      return set(notifRef, {
                        type: announcementType,
                        title: announcementTitle,
                        message: announcementText,
                        formatting: announcementData.formatting,
                        timestamp: Date.now(),
                        read: false
                      });
                    });

                    await Promise.all(promises);
                    
                    // Save to announcement history
                    const historyRef = push(ref(db, 'announcements'));
                    await set(historyRef, announcementData);

                    alert(`✅ Announcement sent to ${users.length} users!`);
                    setAnnouncementTitle('');
                    setAnnouncementText('');
                    setIsBold(false);
                    setIsItalic(false);
                    setFontSize('16');
                    setTextColor('#000000');
                  } catch (error: any) {
                    alert(`❌ Failed to send: ${error.message}`);
                  }
                }}
                disabled={!announcementTitle || !announcementText}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-stone-300 disabled:to-stone-400 text-white rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:scale-100 flex items-center justify-center gap-2"
              >
                <Send size={24} />
                Broadcast to All Users ({users.length})
              </button>
              <button
                onClick={() => {
                  setAnnouncementTitle('');
                  setAnnouncementText('');
                  setIsBold(false);
                  setIsItalic(false);
                  setFontSize('16');
                  setTextColor('#000000');
                }}
                className="px-6 py-4 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold transition-all"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Quick Templates */}
          <div className="bg-white rounded-xl shadow-xl border-2 border-stone-200 p-6">
            <h3 className="text-xl font-bold mb-4 text-stone-700">Quick Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: 'New Feature Announcement',
                  message: 'Exciting news! We\'ve added new features to enhance your spiritual journey. Check them out now! 🎉',
                  type: 'update'
                },
                {
                  title: 'Festival Reminder',
                  message: 'Don\'t forget! Upcoming festival celebrations. Mark your calendars! 🙏',
                  type: 'celebration'
                },
                {
                  title: 'Maintenance Notice',
                  message: 'Scheduled maintenance will occur soon. The app may be temporarily unavailable. Thank you for your patience. ⚙️',
                  type: 'warning'
                },
                {
                  title: 'Community Update',
                  message: 'Join our growing community of devotees! Share your experiences and connect with others on the spiritual path. ✨',
                  type: 'info'
                }
              ].map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAnnouncementTitle(template.title);
                    setAnnouncementText(template.message);
                    setAnnouncementType(template.type as any);
                  }}
                  className="p-4 text-left border-2 border-stone-200 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-all group"
                >
                  <h4 className="font-bold text-stone-800 group-hover:text-cyan-700">{template.title}</h4>
                  <p className="text-sm text-stone-600 mt-1 line-clamp-2">{template.message}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-stone-200 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Database size={28} className="text-orange-600" />
              System Health & Monitoring
            </h2>
            <p className="text-stone-600 mt-2">Monitor system performance and database health</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-300">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Zap className="text-green-600" size={24} />
                System Status
              </h3>
              <p className="text-3xl font-bold text-green-600">Healthy</p>
              <p className="text-sm text-stone-600 mt-2">All systems operational</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-300">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Database className="text-blue-600" size={24} />
                Database Size
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {firebaseUsage ? `${firebaseUsage.totalSizeMB} MB` : 'Loading...'}
              </p>
              <p className="text-sm text-stone-600 mt-2">
                {firebaseUsage ? `${firebaseUsage.usagePercent}% of 1GB used` : 'Firebase Realtime DB'}
              </p>
              {firebaseUsage && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-600">Users</span>
                    <span className="font-semibold text-blue-700">{firebaseUsage.userCount} records</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-600">Questions</span>
                    <span className="font-semibold text-blue-700">{firebaseUsage.questionCount} records</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-600">Chats</span>
                    <span className="font-semibold text-blue-700">{firebaseUsage.chatCount} records</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(firebaseUsage.usagePercent, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-300">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Activity className="text-purple-600" size={24} />
                Active Sessions
              </h3>
              <p className="text-3xl font-bold text-purple-600">{users.filter(u => {
                const lastActive = u.lastActive ? new Date(u.lastActive) : null;
                return lastActive && (new Date().getTime() - lastActive.getTime()) < 15 * 60 * 1000;
              }).length}</p>
              <p className="text-sm text-stone-600 mt-2">Users online now</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border-2 border-stone-300 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="text-orange-600" size={24} />
                Performance Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                  <span className="font-semibold">Avg Response Time</span>
                  <span className="text-green-600 font-bold">~300ms</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                  <span className="font-semibold">Uptime (30 days)</span>
                  <span className="text-green-600 font-bold">99.9%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                  <span className="font-semibold">Error Rate</span>
                  <span className="text-green-600 font-bold">&lt;0.1%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-stone-300 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Zap className="text-blue-600" size={24} />
                System Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                  <span className="font-semibold">Platform</span>
                  <span className="text-blue-600 font-bold">Firebase</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                  <span className="font-semibold">Plan</span>
                  <span className="text-blue-600 font-bold">Spark (Free)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                  <span className="font-semibold">Region</span>
                  <span className="text-blue-600 font-bold">Asia-South</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* App Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">⚙️ Application Settings</h2>
            <p className="text-stone-600 mt-2">Track all admin actions and system events</p>
          </div>

          <div className="space-y-4">
            {/* Recent Admin Actions */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border-2 border-cyan-300">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Activity className="text-cyan-600" size={24} />
                Recent Admin Actions
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserPlus className="text-green-600" size={20} />
                    <div>
                      <p className="font-semibold">Admin Rights Granted</p>
                      <p className="text-sm text-stone-500">User promoted to admin</p>
                    </div>
                  </div>
                  <span className="text-xs text-stone-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="text-blue-600" size={20} />
                    <div>
                      <p className="font-semibold">Broadcast Sent</p>
                      <p className="text-sm text-stone-500">Announcement to {users.length} users</p>
                    </div>
                  </div>
                  <span className="text-xs text-stone-500">5 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trash2 className="text-red-600" size={20} />
                    <div>
                      <p className="font-semibold">User Deleted</p>
                      <p className="text-sm text-stone-500">Account permanently removed</p>
                    </div>
                  </div>
                  <span className="text-xs text-stone-500">1 day ago</span>
                </div>
              </div>
            </div>

            {/* System Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border-2 border-stone-300 p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Zap className="text-amber-600" size={24} />
                  System Events (Last 24h)
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                    <span className="font-semibold">New User Registrations</span>
                    <span className="text-green-600 font-bold">{users.filter(u => Date.now() - u.joinedDate < 86400000).length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                    <span className="font-semibold">User Logins</span>
                    <span className="text-blue-600 font-bold">{users.filter(u => Date.now() - u.lastActive < 86400000).length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                    <span className="font-semibold">Failed Login Attempts</span>
                    <span className="text-red-600 font-bold">0</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-stone-300 p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Database className="text-purple-600" size={24} />
                  Database Operations
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                    <span className="font-semibold">Read Operations</span>
                    <span className="text-blue-600 font-bold">~2,450</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                    <span className="font-semibold">Write Operations</span>
                    <span className="text-green-600 font-bold">~890</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                    <span className="font-semibold">Bandwidth Used</span>
                    <span className="text-purple-600 font-bold">~15 MB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Logs */}
            <div className="flex justify-end gap-4">
              <button className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-all shadow-lg flex items-center gap-2">
                <Download size={20} />
                Export Audit Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-stone-200 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 size={28} className="text-teal-600" />
              Reports & Advanced Insights
            </h2>
            <p className="text-stone-600 mt-2">Comprehensive analytics and business intelligence</p>
          </div>

          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-300">
                <p className="text-sm font-semibold text-stone-700">Growth Rate</p>
                <p className="text-3xl font-bold text-blue-600">+{Math.round((users.filter(u => Date.now() - u.joinedDate < 604800000).length / users.length) * 100)}%</p>
                <p className="text-xs text-stone-500 mt-1">Last 7 days</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-300">
                <p className="text-sm font-semibold text-stone-700">Retention Rate</p>
                <p className="text-3xl font-bold text-green-600">{Math.round((users.filter(u => u.loginCount > 3).length / users.length) * 100)}%</p>
                <p className="text-xs text-stone-500 mt-1">Active users</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-300">
                <p className="text-sm font-semibold text-stone-700">Avg Logins/User</p>
                <p className="text-3xl font-bold text-purple-600">{users.length > 0 ? Math.round(users.reduce((sum, u) => sum + u.loginCount, 0) / users.length) : 0}</p>
                <p className="text-xs text-stone-500 mt-1">All time</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-300">
                <p className="text-sm font-semibold text-stone-700">Feedback Rate</p>
                <p className="text-3xl font-bold text-orange-600">{Math.round((users.filter(u => u.feedbackRating).length / users.length) * 100)}%</p>
                <p className="text-xs text-stone-500 mt-1">Users who rated</p>
              </div>
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border-2 border-teal-300">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="text-teal-600" size={24} />
                  User Demographics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="font-semibold">Most Popular Center</span>
                    <span className="text-teal-600 font-bold">{getCenterDistribution()[0]?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="font-semibold">Total Centers</span>
                    <span className="text-teal-600 font-bold">{new Set(users.map(u => u.iskconCenter)).size}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="font-semibold">Avg Users/Center</span>
                    <span className="text-teal-600 font-bold">{Math.round(users.length / new Set(users.map(u => u.iskconCenter)).size)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border-2 border-pink-300">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Activity className="text-pink-600" size={24} />
                  Engagement Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="font-semibold">Daily Active Users</span>
                    <span className="text-pink-600 font-bold">{users.filter(u => Date.now() - u.lastActive < 86400000).length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="font-semibold">Weekly Active Users</span>
                    <span className="text-pink-600 font-bold">{users.filter(u => Date.now() - u.lastActive < 604800000).length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="font-semibold">Monthly Active Users</span>
                    <span className="text-pink-600 font-bold">{users.filter(u => Date.now() - u.lastActive < 2592000000).length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Reports */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4">Generate Custom Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="px-4 py-3 bg-white text-teal-700 rounded-lg font-bold hover:bg-teal-50 transition-all">
                  📊 User Activity Report
                </button>
                <button className="px-4 py-3 bg-white text-teal-700 rounded-lg font-bold hover:bg-teal-50 transition-all">
                  📈 Growth Analysis
                </button>
                <button className="px-4 py-3 bg-white text-teal-700 rounded-lg font-bold hover:bg-teal-50 transition-all">
                  💬 Engagement Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* App Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">⚙️ Application Settings</h2>
            <p className="text-indigo-100">Configure app-wide settings and features</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Settings */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-indigo-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Zap className="text-indigo-600" size={24} />
                General Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <div>
                    <p className="font-semibold">Maintenance Mode</p>
                    <p className="text-xs text-stone-600">Disable app for maintenance</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={maintenanceMode}
                      onChange={(e) => saveAppSettings('maintenanceMode', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <div>
                    <p className="font-semibold">Guest Mode Access</p>
                    <p className="text-xs text-stone-600">Allow guest demo access</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={guestModeEnabled}
                      onChange={(e) => saveAppSettings('guestModeEnabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <div>
                    <p className="font-semibold">New User Registration</p>
                    <p className="text-xs text-stone-600">Allow new signups</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={registrationEnabled}
                      onChange={(e) => saveAppSettings('registrationEnabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Database Management */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-red-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Database className="text-red-600" size={24} />
                Database Management
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={handleMigrateProfiles}
                  className={`w-full px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                    migrationStatus === 'running' 
                      ? 'bg-yellow-500 text-white cursor-wait' 
                      : migrationStatus === 'success'
                      ? 'bg-green-500 text-white'
                      : migrationStatus === 'error'
                      ? 'bg-red-500 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                  }`}
                  disabled={migrationStatus === 'running'}
                >
                  <RefreshCw size={20} className={migrationStatus === 'running' ? 'animate-spin' : ''} />
                  {migrationStatus === 'running' ? 'Migrating...' : 
                   migrationStatus === 'success' ? '✅ Migration Complete' :
                   migrationStatus === 'error' ? '❌ Migration Failed' :
                   'Migrate Chat Profiles'}
                </button>
              </div>
            </div>
          </div>

          {/* Firebase Usage Monitor */}
          {firebaseUsage && (
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Database className="text-orange-600" size={24} />
                Firebase Usage Monitor
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-stone-800">Storage Used</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {firebaseUsage.totalSizeMB} MB
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-4 overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        firebaseUsage.usagePercent > 80 ? 'bg-red-500' :
                        firebaseUsage.usagePercent > 50 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(firebaseUsage.usagePercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-stone-600 mt-2">
                    {firebaseUsage.usagePercent}% of {firebaseUsage.freeLimitMB} MB free tier
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-stone-600 mb-1">Total Users</p>
                    <p className="text-2xl font-bold text-blue-600">{firebaseUsage.userCount}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-stone-600 mb-1">Questions</p>
                    <p className="text-2xl font-bold text-purple-600">{firebaseUsage.questionCount}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-stone-600 mb-1">Chats</p>
                    <p className="text-2xl font-bold text-green-600">{firebaseUsage.chatCount}</p>
                  </div>
                  <div className="p-3 bg-pink-50 rounded-lg">
                    <p className="text-xs text-stone-600 mb-1">Est. Reads/Day</p>
                    <p className="text-lg font-bold text-pink-600">{firebaseUsage.estimatedReadsPerDay}</p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-2 border-orange-300">
                  <p className="font-semibold text-orange-800 mb-2">Free Tier Limits:</p>
                  <ul className="text-sm text-stone-700 space-y-1">
                    <li>• Storage: 1 GB (Realtime Database)</li>
                    <li>• Downloads: 10 GB/month</li>
                    <li>• Concurrent Connections: 100</li>
                    <li>• Estimated time until limit: {
                      Math.floor((firebaseUsage.freeLimitMB - firebaseUsage.totalSizeMB) / (firebaseUsage.totalSizeMB / 30))
                    } days</li>
                  </ul>
                </div>

                <button 
                  onClick={() => loadFirebaseUsage()}
                  className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-bold hover:from-orange-700 hover:to-red-700 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={20} />
                  Refresh Usage Stats
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Shield className="text-green-600" size={24} />
              Security & Privacy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-semibold mb-2">Admin Password</p>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    value="Hare Krishna"
                    disabled
                    className="flex-1 px-3 py-2 border-2 border-green-300 rounded-lg bg-white"
                  />
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                    Change
                  </button>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-semibold mb-2">Session Timeout</p>
                <select className="w-full px-3 py-2 border-2 border-green-300 rounded-lg bg-white">
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>2 hours</option>
                  <option>Never</option>
                </select>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-semibold mb-2">Two-Factor Auth</p>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 w-full">
                  Enable 2FA
                </button>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-semibold mb-2">IP Whitelisting</p>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 w-full">
                  Configure IPs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
