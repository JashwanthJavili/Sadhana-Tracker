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

      {/* Privacy & Data Control Section */}
      <section className="bg-gradient-to-br from-white to-green-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl border-2 sm:border-3 border-green-300 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-stone-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg">
            <Shield className="text-white" size={20}/>
          </div>
          Privacy & Data Control
        </h3>
        
        <div className="space-y-6">
          {/* Data Ownership Notice */}
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <Lock className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="text-lg font-bold text-green-900 mb-2">Your Data, Your Rights</h4>
                <p className="text-green-800 text-sm leading-relaxed">
                  You have <strong>complete ownership and control</strong> over all your personal data. 
                  We respect your privacy and ensure your spiritual journey data is:
                </p>
                <ul className="mt-3 space-y-2 text-green-800 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>Private by default</strong> - Only you can access your daily entries, journal, and analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>Encrypted in transit</strong> - All data transfers use secure HTTPS/SSL encryption</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>Stored securely</strong> - Hosted on Firebase's enterprise-grade infrastructure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>Never shared or sold</strong> - Your data will never be shared with third parties</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>Deletable anytime</strong> - You can permanently delete all your data instantly</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* What We Store */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Database className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="text-lg font-bold text-blue-900 mb-2">What We Store</h4>
                <div className="space-y-3 text-blue-800 text-sm">
                  <div>
                    <strong className="block mb-1">Personal Information:</strong>
                    <span className="text-blue-700">Name, Guru Name, ISKCON Center, Email (from Google Sign-In), Profile Photo</span>
                  </div>
                  <div>
                    <strong className="block mb-1">Spiritual Practice Data:</strong>
                    <span className="text-blue-700">Daily commitments, chanting rounds, study hours, discipline scores, mood tracking</span>
                  </div>
                  <div>
                    <strong className="block mb-1">Journal Entries:</strong>
                    <span className="text-blue-700">Your devotional reflections and spiritual insights</span>
                  </div>
                  <div>
                    <strong className="block mb-1">Community Data:</strong>
                    <span className="text-blue-700">Chat messages, questions, answers (in Community section only)</span>
                  </div>
                  <div>
                    <strong className="block mb-1">Usage Analytics:</strong>
                    <span className="text-blue-700">Anonymous usage patterns to improve the app (no personal tracking)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Visibility Controls */}
          <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Eye className="text-purple-600 flex-shrink-0 mt-1" size={24} />
              <div className="w-full">
                <h4 className="text-lg font-bold text-purple-900 mb-3">What Others Can See</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap">PUBLIC</div>
                    <div className="text-sm text-purple-800">
                      <strong>Community Profile:</strong> Your name, guru, ISKCON center, profile photo, online status
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap">PUBLIC</div>
                    <div className="text-sm text-purple-800">
                      <strong>Community Content:</strong> Questions you ask, answers you provide, chat messages
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap">PRIVATE</div>
                    <div className="text-sm text-purple-800">
                      <strong>Daily Planner:</strong> Your commitments, timeline, reflections - <strong>completely private</strong>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap">PRIVATE</div>
                    <div className="text-sm text-purple-800">
                      <strong>Journal:</strong> All devotional journal entries - <strong>completely private</strong>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap">PRIVATE</div>
                    <div className="text-sm text-purple-800">
                      <strong>Analytics:</strong> All performance metrics and graphs - <strong>completely private</strong>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap">PRIVATE</div>
                    <div className="text-sm text-purple-800">
                      <strong>Chanting Counter:</strong> Your rounds, sessions, goals - <strong>completely private</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Export Data Option */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Download className="text-amber-600 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h4 className="text-lg font-bold text-amber-900 mb-2">Export Your Data</h4>
                <p className="text-amber-800 text-sm mb-4">
                  Download a complete copy of all your data in JSON format. This includes everything: settings, entries, journal, analytics, and community activity.
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
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all"
                >
                  <Download size={20} />
                  Download My Data
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Contact */}
          <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6">
            <h4 className="text-base font-bold text-gray-900 mb-2">Privacy Questions?</h4>
            <p className="text-gray-700 text-sm">
              If you have concerns about your data privacy or want to exercise your data rights, contact us at{' '}
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
