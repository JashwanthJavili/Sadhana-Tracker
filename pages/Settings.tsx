import React, { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../services/storage';
import { UserSettings } from '../types';
import { Save, User, Wrench, Users, Trash2, RefreshCw, Shield, Lock, Eye, Download, Database, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { migrateAllUserProfiles } from '../scripts/migrateUserProfiles';
import { createUserProfile } from '../services/chat';
import { ref, remove } from 'firebase/database';
import { db } from '../services/firebase';

// Declare global deferredPrompt
declare global {
  interface Window {
    deferredPrompt: any;
  }
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { userSettings: contextSettings, updateUserSettings, refreshUserData } = useUserData();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isEditing, setIsEditing] = useState(false);
  const [editedSettings, setEditedSettings] = useState<UserSettings | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [clearDataStatus, setClearDataStatus] = useState<'idle' | 'clearing' | 'success' | 'error'>('idle');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['profile']));
  const [showInstallButton, setShowInstallButton] = useState(false);
  
  // Admin email - only this user has admin privileges
  const ADMIN_EMAIL = 'jashwanthjavili7@gmail.com';
  const isAdmin = user?.email === ADMIN_EMAIL;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Check if app can be installed
  useEffect(() => {
    const checkInstallable = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstallButton(false);
        return;
      }
      if (window.deferredPrompt) {
        setShowInstallButton(true);
      }
    };

    checkInstallable();

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!window.deferredPrompt) {
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
    if (contextSettings) {
      setSettings(contextSettings);
    }
  }, [contextSettings]);

  useEffect(() => {
    const fetch = async () => {
      if (user) {
        const data = await getSettings(user.uid);
        // If settings are empty, we might want to pre-fill user name from Auth
        if (!data.userName && user.displayName) {
          data.userName = user.displayName;
        }
        setSettings(data);
      }
    };
    fetch();
  }, [user]);

  const handleSave = async () => {
    if (settings && user) {
      try {
        setSaveStatus('saving');
        await saveSettings(user.uid, settings);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings. Please try again.');
        setSaveStatus('idle');
      }
    }
  };

  const handleEdit = () => {
    setEditedSettings({ ...settings! });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (editedSettings && user) {
      try {
        setSaveStatus('saving');
        
        // Use context's optimistic update - instant UI, background sync
        await updateUserSettings({
          userName: editedSettings.userName,
          guruName: editedSettings.guruName,
          iskconCenter: editedSettings.iskconCenter,
        });
        
        setSettings(editedSettings);
        setSaveStatus('saved');
        setIsEditing(false);
        
        // Notify other components to refresh
        window.dispatchEvent(new CustomEvent('userDataUpdated'));
        
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings. Please try again.');
        setSaveStatus('idle');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditedSettings(null);
    setIsEditing(false);
  };

  const handleMigrateProfiles = async () => {
    // Admin-only feature
    if (!isAdmin) {
      alert('⛔ Access Denied: Only the admin can perform this action.');
      return;
    }
    
    if (!confirm('This will create chat profiles for all existing users from their settings. Continue?')) {
      return;
    }

    try {
      setMigrationStatus('running');
      const result = await migrateAllUserProfiles();
      setMigrationStatus('success');
      alert(`✅ Migration complete!\n${result.migratedCount} profiles created\n${result.skippedCount} skipped\n${result.errorCount} errors`);
      setTimeout(() => setMigrationStatus('idle'), 3000);
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationStatus('error');
      alert('❌ Migration failed. Check console for details.');
      setTimeout(() => setMigrationStatus('idle'), 3000);
    }
  };

  const handleClearMyData = async () => {
    if (!user || user.uid === 'guest') {
      alert('⛔ Cannot clear data for guest user');
      return;
    }

    const confirmed = confirm(
      '⚠️ WARNING: This will permanently delete ALL your data including:\n\n' +
      '• Daily entries and history\n' +
      '• Settings and preferences\n' +
      '• Journal entries\n' +
      '• All saved progress\n\n' +
      'This action CANNOT be undone!\n\n' +
      'Are you absolutely sure you want to proceed?'
    );

    if (!confirmed) return;

    const doubleCheck = confirm(
      '🚨 FINAL WARNING!\n\n' +
      'This is your last chance to cancel.\n\n' +
      'Click OK to PERMANENTLY DELETE all your data.'
    );

    if (!doubleCheck) return;

    try {
      setClearDataStatus('clearing');
      
      // Delete all user data from Firebase
      await remove(ref(db, `users/${user.uid}`));
      
      // Clear localStorage just in case
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sl_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      setClearDataStatus('success');
      alert('✅ All your data has been permanently deleted.\n\nThe page will now reload.');
      
      // Reload the page to show fresh state
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error clearing user data:', error);
      setClearDataStatus('error');
      alert('❌ Failed to clear data. Please try again or contact support.');
      setTimeout(() => setClearDataStatus('idle'), 3000);
    }
  };

  if (!settings) return <div className="flex items-center justify-center min-h-[400px]"><div className="text-center"><div className="inline-block w-12 h-12 border-3 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-3"></div><p className="text-stone-600 font-medium text-sm sm:text-base">Loading settings...</p></div></div>;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto animate-fadeIn">
      <div className="bg-gradient-to-r from-indigo-700 via-purple-600 to-indigo-700 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg sm:shadow-xl border-2 border-indigo-400">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 flex items-center gap-2">
              <Wrench className="text-white" size={20} />
              Settings
            </h2>
            <p className="text-indigo-100 text-xs sm:text-sm">Configure your spiritual practice</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-bold shadow-lg transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <section className="bg-white rounded-lg sm:rounded-xl shadow-lg border-2 border-stone-200 overflow-hidden">
        <button
          onClick={() => toggleSection('profile')}
          className="w-full flex justify-between items-center p-4 sm:p-5 hover:bg-stone-50 transition-colors"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
              <User className="text-white" size={18}/>
            </div>
            <div className="text-left">
              <h3 className="text-base sm:text-lg font-bold text-stone-900">Profile Information</h3>
              <p className="text-xs sm:text-sm text-stone-600">Personal details</p>
            </div>
          </div>
          {expandedSections.has('profile') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
        
        {expandedSections.has('profile') && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50">
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="mb-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all"
              >
                <Wrench size={18} />
                Edit Profile
              </button>
            )}
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-base font-bold text-stone-800 mb-3">Your Name</label>
                  <input
                    type="text"
                    value={editedSettings?.userName || ''}
                    onChange={(e) => setEditedSettings({ ...editedSettings!, userName: e.target.value })}
                    className="w-full p-4 border-3 border-stone-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 outline-none text-base font-semibold shadow-md hover:border-blue-300 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-base font-bold text-stone-800 mb-3">ISKCON Center / Group Name</label>
                  <input
                    type="text"
                    value={editedSettings?.iskconCenter || ''}
                    onChange={(e) => setEditedSettings({ ...editedSettings!, iskconCenter: e.target.value })}
                    className="w-full p-4 border-3 border-stone-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 outline-none text-base font-semibold shadow-md hover:border-blue-300 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-base font-bold text-stone-800 mb-3">Gender</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditedSettings({ ...editedSettings!, gender: 'male' })}
                      className={`flex-1 p-4 rounded-xl font-bold text-base transition-all shadow-md ${
                        editedSettings?.gender === 'male'
                          ? 'bg-blue-600 text-white border-3 border-blue-700'
                          : 'bg-white text-stone-700 border-3 border-stone-300 hover:border-blue-300'
                      }`}
                    >
                      👨 Male (Prabhuji)
                    </button>
                    <button
                      onClick={() => setEditedSettings({ ...editedSettings!, gender: 'female' })}
                      className={`flex-1 p-4 rounded-xl font-bold text-base transition-all shadow-md ${
                        editedSettings?.gender === 'female'
                          ? 'bg-pink-600 text-white border-3 border-pink-700'
                          : 'bg-white text-stone-700 border-3 border-stone-300 hover:border-pink-300'
                      }`}
                    >
                      👩 Female (Mataji)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-base font-bold text-stone-800 mb-3">Your Name</label>
                  <div className="w-full p-4 bg-white border-3 border-blue-200 rounded-xl text-base font-semibold shadow-md">
                    {settings.userName || 'Not set'}
                  </div>
                </div>
                <div>
                  <label className="block text-base font-bold text-stone-800 mb-3">ISKCON Center / Group Name</label>
                  <div className="w-full p-4 bg-white border-3 border-blue-200 rounded-xl text-base font-semibold shadow-md">
                    {settings.iskconCenter || 'Not set'}
                  </div>
                </div>
                <div>
                  <label className="block text-base font-bold text-stone-800 mb-3">Gender</label>
                  <div className="w-full p-4 bg-white border-3 border-blue-200 rounded-xl text-base font-semibold shadow-md">
                    {settings.gender === 'male' ? '👨 Male (Prabhuji)' : settings.gender === 'female' ? '👩 Female (Mataji)' : 'Not set'}
                  </div>
                </div>
              </div>
            )}
            {isEditing && (
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl transform hover:scale-105 active:scale-95 ${
                    saveStatus === 'saved'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                  }`}
                >
                  <Save size={18} />
                  {saveStatus === 'saved' ? 'Saved!' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg font-bold text-sm bg-stone-300 text-stone-700 hover:bg-stone-400 transition-all shadow-lg transform hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Spiritual Guide Section */}
      <section className="bg-gradient-to-br from-white to-purple-50 rounded-lg sm:rounded-xl shadow-lg border-2 border-purple-300 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg shadow-lg">
            <User className="text-white" size={18}/>
          </div>
          Spiritual Guide
        </h3>
        <div className="space-y-4">
          {isEditing ? (
            <div>
              <label className="block text-sm font-bold text-stone-800 mb-2">Guided By</label>
              <input
                type="text"
                value={editedSettings?.guruName || ''}
                onChange={(e) => setEditedSettings({ ...editedSettings!, guruName: e.target.value })}
                className="w-full p-3 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none text-sm font-medium shadow-sm hover:border-purple-300 transition-all"
                placeholder="e.g. HG Pranavanand Das Prabhu"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold text-stone-800 mb-2">Guided By</label>
              <div className="w-full p-3 bg-white border-2 border-purple-200 rounded-lg text-sm font-medium shadow-sm">
                {settings.guruName || 'Not set'}
              </div>
            </div>
          )}
          <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-4 rounded-lg shadow-sm border-2 border-orange-300">
            <p className="text-xs sm:text-sm text-orange-900 italic font-serif font-medium leading-relaxed">
              "By the mercy of the spiritual master one receives the benediction of Krishna."
            </p>
          </div>
        </div>
      </section>

      {/* Privacy & Data Control Section - FAQ Style */}
      <section className="bg-gradient-to-br from-white to-green-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl border-2 sm:border-3 border-green-300 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-stone-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg">
            <Shield className="text-white" size={20}/>
          </div>
          Privacy & Data Control
        </h3>
        
        <div className="space-y-3">
          {/* FAQ 1: What data do we store? */}
          <div className="bg-white rounded-xl border-2 border-green-200 overflow-hidden">
            <button
              onClick={() => toggleSection('privacy-what-store')}
              className="w-full flex justify-between items-center p-4 hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Database className="text-green-600" size={20} />
                <span className="font-bold text-stone-900 text-sm sm:text-base text-left">What data do you store?</span>
              </div>
              {expandedSections.has('privacy-what-store') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            {expandedSections.has('privacy-what-store') && (
              <div className="px-4 pb-4 space-y-2 text-sm text-stone-700">
                <div><strong className="text-green-700">• Personal Information:</strong> Name, Guru Name, ISKCON Center, Email (from Google Sign-In), Profile Photo</div>
                <div><strong className="text-green-700">• Spiritual Practice Data:</strong> Daily commitments, chanting rounds, study hours, discipline scores, mood tracking</div>
                <div><strong className="text-green-700">• Journal Entries:</strong> Your devotional reflections and spiritual insights</div>
                <div><strong className="text-green-700">• Community Data:</strong> Chat messages, questions, answers (in Community section only)</div>
                <div><strong className="text-green-700">• Usage Analytics:</strong> Anonymous usage patterns to improve the app (no personal tracking)</div>
              </div>
            )}
          </div>

          {/* FAQ 2: What can others see? */}
          <div className="bg-white rounded-xl border-2 border-green-200 overflow-hidden">
            <button
              onClick={() => toggleSection('privacy-what-visible')}
              className="w-full flex justify-between items-center p-4 hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Eye className="text-purple-600" size={20} />
                <span className="font-bold text-stone-900 text-sm sm:text-base text-left">What can others see about me?</span>
              </div>
              {expandedSections.has('privacy-what-visible') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            {expandedSections.has('privacy-what-visible') && (
              <div className="px-4 pb-4 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap mt-0.5">PUBLIC</span>
                  <span className="text-stone-700"><strong>Community Profile:</strong> Your name, guru, ISKCON center, profile photo, online status</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap mt-0.5">PUBLIC</span>
                  <span className="text-stone-700"><strong>Community Content:</strong> Questions you ask, answers you provide, chat messages</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap mt-0.5">PRIVATE</span>
                  <span className="text-stone-700"><strong>Daily Planner:</strong> Your commitments, timeline, reflections - completely private</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap mt-0.5">PRIVATE</span>
                  <span className="text-stone-700"><strong>Journal:</strong> All devotional journal entries - completely private</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap mt-0.5">PRIVATE</span>
                  <span className="text-stone-700"><strong>Analytics & Chanting:</strong> All performance metrics, graphs, rounds - completely private</span>
                </div>
              </div>
            )}
          </div>

          {/* FAQ 3: How is my data protected? */}
          <div className="bg-white rounded-xl border-2 border-green-200 overflow-hidden">
            <button
              onClick={() => toggleSection('privacy-protection')}
              className="w-full flex justify-between items-center p-4 hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="text-green-600" size={20} />
                <span className="font-bold text-stone-900 text-sm sm:text-base text-left">How is my data protected?</span>
              </div>
              {expandedSections.has('privacy-protection') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            {expandedSections.has('privacy-protection') && (
              <div className="px-4 pb-4 space-y-2 text-sm text-stone-700">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Encrypted in transit:</strong> All data transfers use secure HTTPS/SSL encryption</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Stored securely:</strong> Hosted on Firebase's enterprise-grade infrastructure</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Private by default:</strong> Only you can access your daily entries, journal, and analytics</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Never shared or sold:</strong> Your data will never be shared with third parties</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>You have control:</strong> Export or delete all your data anytime</span>
                </div>
              </div>
            )}
          </div>

          {/* FAQ 4: Can I export my data? */}
          <div className="bg-white rounded-xl border-2 border-green-200 overflow-hidden">
            <button
              onClick={() => toggleSection('privacy-export')}
              className="w-full flex justify-between items-center p-4 hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="text-blue-600" size={20} />
                <span className="font-bold text-stone-900 text-sm sm:text-base text-left">Can I export my data?</span>
              </div>
              {expandedSections.has('privacy-export') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            {expandedSections.has('privacy-export') && (
              <div className="px-4 pb-4">
                <p className="text-sm text-stone-700 mb-3">
                  Yes! You have complete ownership of your data. Download a complete copy in JSON format including settings, entries, journal, analytics, and community activity.
                </p>
                <button
                  onClick={async () => {
                    if (user) {
                      try {
                        const userData = {
                          exportDate: new Date().toISOString(),
                          userId: user.uid,
                          email: user.email,
                          settings: settings,
                          note: 'This is your complete Sadhana Tracker data export. You have full ownership of this data.'
                        };
                        const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `sadhana-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error('Export error:', error);
                        alert('Failed to export data. Please try again.');
                      }
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all"
                >
                  <Download size={16} />
                  Download My Data
                </button>
              </div>
            )}
          </div>

          {/* FAQ 5: How can I delete my data? */}
          <div className="bg-white rounded-xl border-2 border-green-200 overflow-hidden">
            <button
              onClick={() => toggleSection('privacy-delete')}
              className="w-full flex justify-between items-center p-4 hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="text-red-600" size={20} />
                <span className="font-bold text-stone-900 text-sm sm:text-base text-left">How can I delete my data?</span>
              </div>
              {expandedSections.has('privacy-delete') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            {expandedSections.has('privacy-delete') && (
              <div className="px-4 pb-4 text-sm text-stone-700">
                <p className="mb-2">
                  You can permanently delete all your data anytime using the <strong className="text-red-600">"Clear All My Data"</strong> button in the Danger Zone section below.
                </p>
                <p className="text-xs text-stone-600 italic">
                  Note: This action cannot be undone. All your entries, settings, journal, and progress will be permanently deleted.
                </p>
              </div>
            )}
          </div>

          {/* FAQ 6: Privacy Questions Contact */}
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 border-2 border-green-300">
            <p className="text-sm text-green-900">
              <strong>Have privacy questions?</strong> Contact us at{' '}
              <a href="mailto:jashwanthjavili7@gmail.com" className="text-blue-600 hover:text-blue-800 font-bold underline">
                jashwanthjavili7@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Admin Tools Section - Only visible to admin */}
      {isAdmin && (
        <section className="bg-gradient-to-br from-white to-indigo-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl border-2 sm:border-3 border-indigo-300 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-stone-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg">
              <Users className="text-white" size={20}/>
            </div>
            Admin Tools
            <span className="ml-auto text-sm bg-red-600 text-white px-3 py-1 rounded-full">Admin Only</span>
          </h3>
          
          <div className="space-y-4">
            <div className="bg-indigo-100 border-2 border-indigo-300 rounded-xl p-6">
              <h4 className="text-lg font-bold text-indigo-900 mb-2">Migrate User Profiles</h4>
              <p className="text-indigo-800 mb-4">
                Create chat profiles for all existing users from their settings data. This will make all users visible in the Community page.
              </p>
              <button
                onClick={handleMigrateProfiles}
                disabled={migrationStatus === 'running'}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all ${
                  migrationStatus === 'running' 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : migrationStatus === 'success'
                    ? 'bg-green-600 text-white'
                    : migrationStatus === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                }`}
              >
                <Users size={20} />
                {migrationStatus === 'running' ? 'Migrating...' : 
                 migrationStatus === 'success' ? '✅ Complete!' :
                 migrationStatus === 'error' ? '❌ Failed' :
                 'Migrate All Users'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Install App on Your Mobile Section - Collapsible */}
      <section className="bg-gradient-to-br from-white to-blue-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl border-2 sm:border-3 border-blue-300 p-4 sm:p-6">
        <button
          onClick={() => toggleSection('install-app')}
          className="w-full flex justify-between items-center mb-4"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl shadow-lg">
              <Download className="text-white" size={24}/>
            </div>
            Install App on Your Mobile
          </h3>
          {expandedSections.has('install-app') ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
        </button>
        
        {expandedSections.has('install-app') && (
          <div className="space-y-6">
            {/* Install Benefits */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-4 sm:p-6">
              <h4 className="text-base sm:text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <span className="text-xl sm:text-2xl">📱</span>
                Why Install the App?
              </h4>
              <ul className="space-y-2 sm:space-y-3 text-blue-800 text-xs sm:text-sm">
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-green-600 font-bold text-base sm:text-lg flex-shrink-0">✓</span>
                  <span><strong>Works Offline:</strong> Track your sadhana even without internet connection</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-green-600 font-bold text-base sm:text-lg flex-shrink-0">✓</span>
                  <span><strong>Quick Access:</strong> Launch directly from your home screen like a native app</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-green-600 font-bold text-base sm:text-lg flex-shrink-0">✓</span>
                  <span><strong>Full Screen Experience:</strong> No browser bars, just your spiritual practice</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-green-600 font-bold text-base sm:text-lg flex-shrink-0">✓</span>
                  <span><strong>Faster Performance:</strong> Optimized loading and smooth animations</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-green-600 font-bold text-base sm:text-lg flex-shrink-0">✓</span>
                  <span><strong>Notifications Ready:</strong> Get reminders for your daily sadhana (coming soon)</span>
                </li>
              </ul>
            </div>

            {/* Install Button */}
            {showInstallButton && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 border-2 border-green-400 rounded-xl p-4 sm:p-6 text-center">
                <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">🎉 Ready to Install!</h4>
                <p className="text-green-50 mb-3 sm:mb-5 text-xs sm:text-sm">Click the button below to install Sadhana Sanga on your device</p>
                <button
                  onClick={handleInstallClick}
                  className="inline-flex items-center gap-2 sm:gap-3 bg-white text-green-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 transition-all"
                >
                  <Download size={20} className="sm:w-6 sm:h-6" />
                  <span>Install App Now</span>
                </button>
              </div>
            )}

            {/* Manual Installation Instructions - Collapsible */}
            <div className="bg-white border-2 border-stone-300 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('install-manual')}
                className="w-full flex justify-between items-center p-4 sm:p-6 hover:bg-stone-50 transition-colors"
              >
                <h4 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">📋</span>
                  Manual Installation Instructions
                </h4>
                {expandedSections.has('install-manual') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>
              
              {expandedSections.has('install-manual') && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
                  {/* Android Instructions */}
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 sm:p-5">
                    <h5 className="font-bold text-green-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                      <span className="text-lg sm:text-xl">🤖</span>
                      For Android (Chrome)
                    </h5>
                    <ol className="space-y-2 text-xs sm:text-sm text-green-800 list-decimal list-inside">
                      <li><strong>Tap the menu icon</strong> (three vertical dots ⋮) in the top-right corner</li>
                      <li><strong>Select "Install app"</strong> or <strong>"Add to Home screen"</strong></li>
                      <li><strong>Confirm the installation</strong> when prompted</li>
                      <li><strong>Find the app</strong> on your home screen and tap to open</li>
                    </ol>
                  </div>

                  {/* iOS Instructions */}
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 sm:p-5">
                    <h5 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                      <span className="text-lg sm:text-xl">🍎</span>
                      For iPhone/iPad (Safari)
                    </h5>
                    <ol className="space-y-2 text-xs sm:text-sm text-blue-800 list-decimal list-inside">
                      <li><strong>Tap the Share button</strong> (square with arrow pointing up ⬆️) at the bottom</li>
                      <li><strong>Scroll down</strong> and tap <strong>"Add to Home Screen"</strong></li>
                      <li><strong>Edit the name</strong> if desired, then tap <strong>"Add"</strong></li>
                      <li><strong>Launch the app</strong> from your home screen</li>
                    </ol>
                    <p className="mt-3 text-[10px] sm:text-xs text-blue-700 italic">⚠️ Note: Must use Safari browser on iOS (not Chrome)</p>
                  </div>

                  {/* Desktop Instructions */}
                  <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 sm:p-5">
                    <h5 className="font-bold text-purple-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                      <span className="text-lg sm:text-xl">💻</span>
                      For Desktop (Chrome/Edge)
                    </h5>
                    <ol className="space-y-2 text-xs sm:text-sm text-purple-800 list-decimal list-inside">
                      <li><strong>Look for the install icon</strong> (➕ or ⬇️) in the address bar</li>
                      <li><strong>Click "Install"</strong> when the prompt appears</li>
                      <li><strong>The app will open</strong> in its own window</li>
                      <li><strong>Access anytime</strong> from your taskbar or desktop</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Already Installed Message */}
            {!showInstallButton && (
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-400 rounded-xl p-4 sm:p-6 text-center">
                <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">✅</div>
                <h4 className="text-lg sm:text-xl font-bold text-green-900 mb-2">App Already Installed!</h4>
                <p className="text-green-700 text-xs sm:text-sm">
                  You're either already using the installed app or your browser doesn't support installation.
                  <br className="hidden sm:block" />
                  If you're on iOS, please use Safari browser and follow the manual instructions above.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Danger Zone - Clear All Data */}
      <section className="bg-gradient-to-br from-white to-red-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl border-2 sm:border-3 border-red-300 p-4 sm:p-6">
        <h3 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-3">
          <div className="bg-gradient-to-br from-red-500 to-red-700 p-3 rounded-xl shadow-lg">
            <Trash2 className="text-white" size={28}/>
          </div>
          Danger Zone
          <span className="ml-auto text-sm bg-red-600 text-white px-3 py-1 rounded-full">⚠️ Irreversible</span>
        </h3>
        
        <div className="bg-red-100 border-2 border-red-300 rounded-xl p-6">
          <h4 className="text-lg font-bold text-red-900 mb-2">Clear All My Data</h4>
          <p className="text-red-800 mb-4">
            Permanently delete all your entries, settings, journal, and progress. This action cannot be undone.
          </p>
          <button
            onClick={handleClearMyData}
            disabled={clearDataStatus === 'clearing' || user?.uid === 'guest'}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all ${
              clearDataStatus === 'clearing' 
                ? 'bg-gray-400 cursor-not-allowed' 
                : clearDataStatus === 'success'
                ? 'bg-green-600 text-white'
                : clearDataStatus === 'error'
                ? 'bg-orange-600 text-white'
                : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
            }`}
          >
            <Trash2 size={20} />
            {clearDataStatus === 'clearing' ? 'Clearing...' : 
             clearDataStatus === 'success' ? '✅ Cleared!' :
             clearDataStatus === 'error' ? '❌ Failed' :
             'Clear All My Data'}
          </button>
          {user?.uid === 'guest' && (
            <p className="text-red-600 text-sm mt-2 font-semibold">
              ⓘ Guest users cannot use this feature. Please sign in with Google.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Settings;
