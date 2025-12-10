import React, { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../services/storage';
import { UserSettings } from '../types';
import { Save, User, Wrench, Users, Trash2, RefreshCw, Shield, Lock, Eye, Download, Database, ChevronDown, ChevronRight, Smartphone, UserX, Edit2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { migrateAllUserProfiles } from '../scripts/migrateUserProfiles';
import { clearAllChats } from '../scripts/clearAllChats';
import { createUserProfile } from '../services/chat';
import { ref, remove, get } from 'firebase/database';
import { db, auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

// @ts-ignore
import versionData from '../version.json';

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
  const [isEditingPrivacy, setIsEditingPrivacy] = useState(false);
  const [editedSettings, setEditedSettings] = useState<UserSettings | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [clearDataStatus, setClearDataStatus] = useState<'idle' | 'clearing' | 'success' | 'error'>('idle');
  const [deleteAccountStatus, setDeleteAccountStatus] = useState<'idle' | 'deleting' | 'success' | 'error'>('idle');
  const [clearChatsStatus, setClearChatsStatus] = useState<'idle' | 'clearing' | 'success' | 'error'>('idle');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['profile']));
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  
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

  const handleClearAllChats = async () => {
    // Admin-only feature
    if (!isAdmin) {
      alert('⛔ Access Denied: Only the admin can perform this action.');
      return;
    }

    const confirmed = confirm(
      '🚨 WARNING: This will permanently delete ALL chat messages and conversations for ALL users!\n\n' +
      'This action CANNOT be undone!\n\n' +
      'Are you absolutely sure you want to proceed?'
    );

    if (!confirmed) return;

    const doubleCheck = confirm(
      '⚠️ FINAL CONFIRMATION!\n\n' +
      'Click OK to PERMANENTLY DELETE all chats.\n' +
      'Click Cancel to abort.'
    );

    if (!doubleCheck) return;

    try {
      setClearChatsStatus('clearing');
      await clearAllChats();
      setClearChatsStatus('success');
      alert('✅ All chats have been permanently deleted.');
      setTimeout(() => setClearChatsStatus('idle'), 3000);
    } catch (error) {
      console.error('Error clearing chats:', error);
      setClearChatsStatus('error');
      alert('❌ Failed to clear chats. Check console for details.');
      setTimeout(() => setClearChatsStatus('idle'), 3000);
    }
  };

  const handleCheckForUpdates = async () => {
    setCheckingUpdate(true);
    
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Force service worker to check for updates
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          
          // Wait a bit for update check to complete
          setTimeout(() => {
            if (registration.waiting) {
              setUpdateAvailable(true);
              if (confirm('🎉 New version available! Update now?\n\nThe app will reload to apply the update.')) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            } else {
              alert(`✅ You're running the latest version!\n\nVersion: ${versionData.version}\nBuild Date: ${versionData.buildDate}`);
            }
            setCheckingUpdate(false);
          }, 2000);
        } else {
          alert(`ℹ️ Running in browser mode\n\nVersion: ${versionData.version}\nInstall as PWA for automatic updates!`);
          setCheckingUpdate(false);
        }
      } else {
        alert(`ℹ️ Updates are automatic in browser mode\n\nCurrent Version: ${versionData.version}\nJust refresh the page to get latest updates!`);
        setCheckingUpdate(false);
      }
    } catch (error) {
      console.error('Update check failed:', error);
      alert('Failed to check for updates. Please try again.');
      setCheckingUpdate(false);
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
      '• Chat messages and conversations\n' +
      '• Connection requests and connections\n' +
      '• Notifications\n' +
      '• Questions and answers\n' +
      '• All saved progress\n\n' +
      'This action CANNOT be undone!\n\n' +
      'Your account will remain active.\n\n' +
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
      
      const userId = user.uid;
      
      // Delete all user data from Firebase
      await remove(ref(db, `users/${userId}`));
      
      // Delete user profile
      await remove(ref(db, `userProfiles/${userId}`));
      
      // Delete notifications
      await remove(ref(db, `userNotifications/${userId}`));
      
      // Delete connections (both directions)
      const connectionsSnapshot = await get(ref(db, `connections/${userId}`));
      if (connectionsSnapshot.exists()) {
        const connectedUsers = Object.keys(connectionsSnapshot.val());
        for (const connectedUserId of connectedUsers) {
          await remove(ref(db, `connections/${connectedUserId}/${userId}`));
        }
        await remove(ref(db, `connections/${userId}`));
      }
      
      // Delete connection requests (sent and received)
      const requestsSnapshot = await get(ref(db, 'connectionRequests'));
      if (requestsSnapshot.exists()) {
        const deletePromises: Promise<void>[] = [];
        requestsSnapshot.forEach((requestSnapshot) => {
          const request = requestSnapshot.val();
          if (request.fromUserId === userId || request.toUserId === userId) {
            deletePromises.push(remove(ref(db, `connectionRequests/${requestSnapshot.key}`)));
          }
        });
        await Promise.all(deletePromises);
      }
      
      // Delete chats where user is participant
      const chatsSnapshot = await get(ref(db, 'chats'));
      if (chatsSnapshot.exists()) {
        const deleteChatPromises: Promise<void>[] = [];
        chatsSnapshot.forEach((chatSnapshot) => {
          const chat = chatSnapshot.val();
          if (chat.participants?.includes(userId)) {
            deleteChatPromises.push(remove(ref(db, `chats/${chatSnapshot.key}`)));
            deleteChatPromises.push(remove(ref(db, `chatMessages/${chatSnapshot.key}`)));
          }
        });
        await Promise.all(deleteChatPromises);
      }
      
      // Delete questions posted by user
      const questionsSnapshot = await get(ref(db, 'questions'));
      if (questionsSnapshot.exists()) {
        const deleteQuestionPromises: Promise<void>[] = [];
        questionsSnapshot.forEach((questionSnapshot) => {
          const question = questionSnapshot.val();
          if (question.userId === userId) {
            deleteQuestionPromises.push(remove(ref(db, `questions/${questionSnapshot.key}`)));
            deleteQuestionPromises.push(remove(ref(db, `answers/${questionSnapshot.key}`)));
          }
        });
        await Promise.all(deleteQuestionPromises);
      }
      
      // Delete answers posted by user
      const answersSnapshot = await get(ref(db, 'answers'));
      if (answersSnapshot.exists()) {
        const deleteAnswerPromises: Promise<void>[] = [];
        answersSnapshot.forEach((questionAnswersSnapshot) => {
          questionAnswersSnapshot.forEach((answerSnapshot) => {
            const answer = answerSnapshot.val();
            if (answer.userId === userId) {
              deleteAnswerPromises.push(
                remove(ref(db, `answers/${questionAnswersSnapshot.key}/${answerSnapshot.key}`))
              );
            }
          });
        });
        await Promise.all(deleteAnswerPromises);
      }
      
      // Clear localStorage
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

  const handleDeleteMyAccount = async () => {
    if (!user || user.uid === 'guest') {
      alert('⛔ Cannot delete guest account');
      return;
    }

    const confirmed = confirm(
      '🚨 ACCOUNT DELETION WARNING:\n\n' +
      'This will PERMANENTLY DELETE your account and ALL data:\n\n' +
      '• Your account will be completely removed\n' +
      '• All daily entries and history\n' +
      '• Settings and preferences\n' +
      '• Journal entries\n' +
      '• Chat messages and conversations\n' +
      '• Connection requests and connections\n' +
      '• Notifications\n' +
      '• Questions and answers\n' +
      '• Everything associated with your account\n\n' +
      'This action is IRREVERSIBLE!\n' +
      'You will need to create a new account to use the app again.\n\n' +
      'Are you absolutely sure?'
    );

    if (!confirmed) return;

    const finalConfirm = confirm(
      '⚠️ FINAL CONFIRMATION!\n\n' +
      'Type your email to confirm deletion: ' + user.email
    );

    if (!finalConfirm) return;

    const typedEmail = prompt('Type your email to confirm account deletion:');
    if (typedEmail !== user.email) {
      alert('❌ Email does not match. Account deletion cancelled.');
      return;
    }

    try {
      setDeleteAccountStatus('deleting');
      
      const userId = user.uid;
      
      // Delete all user data (same as Clear My Data)
      await remove(ref(db, `users/${userId}`));
      await remove(ref(db, `userProfiles/${userId}`));
      await remove(ref(db, `userNotifications/${userId}`));
      
      // Delete connections
      const connectionsSnapshot = await get(ref(db, `connections/${userId}`));
      if (connectionsSnapshot.exists()) {
        const connectedUsers = Object.keys(connectionsSnapshot.val());
        for (const connectedUserId of connectedUsers) {
          await remove(ref(db, `connections/${connectedUserId}/${userId}`));
        }
        await remove(ref(db, `connections/${userId}`));
      }
      
      // Delete connection requests
      const requestsSnapshot = await get(ref(db, 'connectionRequests'));
      if (requestsSnapshot.exists()) {
        const deletePromises: Promise<void>[] = [];
        requestsSnapshot.forEach((requestSnapshot) => {
          const request = requestSnapshot.val();
          if (request.fromUserId === userId || request.toUserId === userId) {
            deletePromises.push(remove(ref(db, `connectionRequests/${requestSnapshot.key}`)));
          }
        });
        await Promise.all(deletePromises);
      }
      
      // Delete chats
      const chatsSnapshot = await get(ref(db, 'chats'));
      if (chatsSnapshot.exists()) {
        const deleteChatPromises: Promise<void>[] = [];
        chatsSnapshot.forEach((chatSnapshot) => {
          const chat = chatSnapshot.val();
          if (chat.participants?.includes(userId)) {
            deleteChatPromises.push(remove(ref(db, `chats/${chatSnapshot.key}`)));
            deleteChatPromises.push(remove(ref(db, `chatMessages/${chatSnapshot.key}`)));
          }
        });
        await Promise.all(deleteChatPromises);
      }
      
      // Delete questions
      const questionsSnapshot = await get(ref(db, 'questions'));
      if (questionsSnapshot.exists()) {
        const deleteQuestionPromises: Promise<void>[] = [];
        questionsSnapshot.forEach((questionSnapshot) => {
          const question = questionSnapshot.val();
          if (question.userId === userId) {
            deleteQuestionPromises.push(remove(ref(db, `questions/${questionSnapshot.key}`)));
            deleteQuestionPromises.push(remove(ref(db, `answers/${questionSnapshot.key}`)));
          }
        });
        await Promise.all(deleteQuestionPromises);
      }
      
      // Delete answers
      const answersSnapshot = await get(ref(db, 'answers'));
      if (answersSnapshot.exists()) {
        const deleteAnswerPromises: Promise<void>[] = [];
        answersSnapshot.forEach((questionAnswersSnapshot) => {
          questionAnswersSnapshot.forEach((answerSnapshot) => {
            const answer = answerSnapshot.val();
            if (answer.userId === userId) {
              deleteAnswerPromises.push(
                remove(ref(db, `answers/${questionAnswersSnapshot.key}/${answerSnapshot.key}`))
              );
            }
          });
        });
        await Promise.all(deleteAnswerPromises);
      }
      
      // Clear localStorage
      localStorage.clear();
      
      setDeleteAccountStatus('success');
      alert('✅ Your account has been permanently deleted.\n\nYou will now be signed out.');
      
      // Sign out and redirect
      setTimeout(async () => {
        await signOut(auth);
        window.location.href = '/';
      }, 1500);
      
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteAccountStatus('error');
      alert('❌ Failed to delete account. Please try again or contact support.');
      setTimeout(() => setDeleteAccountStatus('idle'), 3000);
    }
  };

  if (!settings) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner message="Loading settings..." size="md" />
    </div>
  );

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

      {/* Privacy Settings Section */}
      <section className="bg-gradient-to-br from-white to-blue-50 rounded-lg sm:rounded-xl shadow-lg border-2 border-blue-300 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-lg">
              <Eye className="text-white" size={18}/>
            </div>
            Privacy Settings
          </h3>
          {!isEditingPrivacy ? (
            <button
              onClick={() => {
                setIsEditingPrivacy(true);
                setEditedSettings({ ...settings! });
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-md flex items-center gap-2 text-sm"
            >
              <Edit2 size={16} />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (editedSettings && user) {
                    try {
                      setSaveStatus('saving');
                      
                      // Ensure all values have defaults to prevent undefined errors
                      const privacyUpdates = {
                        showGuruName: editedSettings.showGuruName ?? settings?.showGuruName ?? true,
                        showIskconCenter: editedSettings.showIskconCenter ?? settings?.showIskconCenter ?? true,
                        showLastSeen: editedSettings.showLastSeen ?? settings?.showLastSeen ?? true,
                        messagingPrivacy: editedSettings.messagingPrivacy ?? settings?.messagingPrivacy ?? 'everyone',
                      };
                      
                      await updateUserSettings(privacyUpdates);
                      setSettings({ ...settings!, ...privacyUpdates });
                      setIsEditingPrivacy(false);
                      setSaveStatus('saved');
                      setTimeout(() => setSaveStatus('idle'), 2000);
                      // Force refresh to update Community page
                      window.location.reload();
                    } catch (error) {
                      console.error('Error saving privacy settings:', error);
                      alert('Failed to save privacy settings. Please try again.');
                      setSaveStatus('idle');
                    }
                  }
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all shadow-md flex items-center gap-2 text-sm"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={() => {
                  setEditedSettings(null);
                  setIsEditingPrivacy(false);
                }}
                className="px-4 py-2 bg-stone-300 hover:bg-stone-400 text-stone-700 rounded-lg font-bold transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900 mb-3 font-medium">
              🔒 Control what other devotees can see about you
            </p>
          </div>

          {/* Show Spiritual Guide */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-stone-200 hover:border-blue-300 transition-all">
            <div className="flex-1">
              <p className="font-bold text-stone-800 text-sm sm:text-base">Show Spiritual Guide</p>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">Allow others to see your spiritual guide</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEditingPrivacy ? (editedSettings?.showGuruName ?? settings?.showGuruName ?? true) : (settings?.showGuruName ?? true)}
                onChange={(e) => {
                  if (isEditingPrivacy) {
                    setEditedSettings({ ...editedSettings!, showGuruName: e.target.checked });
                  }
                }}
                disabled={!isEditingPrivacy}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
            </label>
          </div>

          {/* Show ISKCON Center */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-stone-200 hover:border-blue-300 transition-all">
            <div className="flex-1">
              <p className="font-bold text-stone-800 text-sm sm:text-base">Show ISKCON Center</p>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">Allow others to see your ISKCON center</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEditingPrivacy ? (editedSettings?.showIskconCenter ?? settings?.showIskconCenter ?? true) : (settings?.showIskconCenter ?? true)}
                onChange={(e) => {
                  if (isEditingPrivacy) {
                    setEditedSettings({ ...editedSettings!, showIskconCenter: e.target.checked });
                  }
                }}
                disabled={!isEditingPrivacy}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
            </label>
          </div>

          {/* Show Last Seen */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-stone-200 hover:border-blue-300 transition-all">
            <div className="flex-1">
              <p className="font-bold text-stone-800 text-sm sm:text-base">Show Last Seen</p>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">Allow others to see when you were last active</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEditingPrivacy ? (editedSettings?.showLastSeen ?? settings?.showLastSeen ?? true) : (settings?.showLastSeen ?? true)}
                onChange={(e) => {
                  if (isEditingPrivacy) {
                    setEditedSettings({ ...editedSettings!, showLastSeen: e.target.checked });
                  }
                }}
                disabled={!isEditingPrivacy}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
            </label>
          </div>

          {/* Messaging Privacy */}
          <div className="p-4 bg-white rounded-lg border-2 border-stone-200 hover:border-blue-300 transition-all">
            <div className="mb-3">
              <p className="font-bold text-stone-800 text-sm sm:text-base">Who can message you?</p>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">Control who can send you messages</p>
            </div>
            <div className="space-y-2">
              <label className={`flex items-center gap-3 p-3 bg-stone-50 rounded-lg ${isEditingPrivacy ? 'cursor-pointer hover:bg-stone-100' : 'cursor-not-allowed opacity-60'} transition-colors`}>
                <input
                  type="radio"
                  name="messagingPrivacy"
                  value="everyone"
                  checked={(isEditingPrivacy ? editedSettings?.messagingPrivacy : settings?.messagingPrivacy) === 'everyone'}
                  onChange={() => {
                    if (isEditingPrivacy) {
                      setEditedSettings({ ...editedSettings!, messagingPrivacy: 'everyone' });
                    }
                  }}
                  disabled={!isEditingPrivacy}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="font-semibold text-stone-800 text-sm">Everyone</p>
                  <p className="text-xs text-stone-600">Any devotee can send you messages</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 p-3 bg-stone-50 rounded-lg ${isEditingPrivacy ? 'cursor-pointer hover:bg-stone-100' : 'cursor-not-allowed opacity-60'} transition-colors`}>
                <input
                  type="radio"
                  name="messagingPrivacy"
                  value="connections-only"
                  checked={(isEditingPrivacy ? editedSettings?.messagingPrivacy : settings?.messagingPrivacy) === 'connections-only'}
                  onChange={() => {
                    if (isEditingPrivacy) {
                      setEditedSettings({ ...editedSettings!, messagingPrivacy: 'connections-only' });
                    }
                  }}
                  disabled={!isEditingPrivacy}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="font-semibold text-stone-800 text-sm">Connections Only</p>
                  <p className="text-xs text-stone-600">Only accepted connections can message you</p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-lg shadow-sm border-2 border-green-300">
            <p className="text-xs sm:text-sm text-green-900 italic font-medium leading-relaxed">
              💡 Your privacy matters! These settings control what information other devotees can see about you in the community section and chat.
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

            <div className="bg-red-100 border-2 border-red-300 rounded-xl p-6">
              <h4 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
                <Trash2 size={20} />
                Clear All Chats
              </h4>
              <p className="text-red-800 mb-4">
                <strong>⚠️ DANGER ZONE:</strong> This will permanently delete ALL chat messages and conversations for ALL users. This action cannot be undone!
              </p>
              <button
                onClick={handleClearAllChats}
                disabled={clearChatsStatus === 'clearing'}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all ${
                  clearChatsStatus === 'clearing' 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : clearChatsStatus === 'success'
                    ? 'bg-green-600 text-white'
                    : clearChatsStatus === 'error'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gradient-to-r from-red-600 to-pink-600 text-white'
                }`}
              >
                <Trash2 size={20} />
                {clearChatsStatus === 'clearing' ? 'Clearing...' : 
                 clearChatsStatus === 'success' ? '✅ Cleared!' :
                 clearChatsStatus === 'error' ? '❌ Failed' :
                 'Clear All Chats'}
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

      {/* Danger Zone - Clear All Data & Delete Account */}
      <section className="bg-gradient-to-br from-white to-red-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl border-2 sm:border-3 border-red-300 p-4 sm:p-6">
        <h3 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-3">
          <div className="bg-gradient-to-br from-red-500 to-red-700 p-3 rounded-xl shadow-lg">
            <Trash2 className="text-white" size={28}/>
          </div>
          Danger Zone
          <span className="ml-auto text-sm bg-red-600 text-white px-3 py-1 rounded-full">⚠️ Irreversible</span>
        </h3>
        
        <div className="space-y-4">
          {/* Clear All Data */}
          <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-6">
            <h4 className="text-lg font-bold text-orange-900 mb-2 flex items-center gap-2">
              <Database size={20} />
              Clear All My Data
            </h4>
            <p className="text-orange-800 mb-4 text-sm">
              Permanently delete all your entries, settings, journal, chats, connections, and progress. Your account remains active.
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
                  : 'bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800'
              }`}
            >
              <Trash2 size={20} />
              {clearDataStatus === 'clearing' ? 'Clearing...' : 
               clearDataStatus === 'success' ? '✅ Cleared!' :
               clearDataStatus === 'error' ? '❌ Failed' :
               'Clear All My Data'}
            </button>
            {user?.uid === 'guest' && (
              <p className="text-orange-600 text-sm mt-2 font-semibold">
                ⓘ Guest users cannot use this feature. Please sign in with Google.
              </p>
            )}
          </div>

          {/* Delete Account */}
          <div className="bg-red-100 border-2 border-red-400 rounded-xl p-6">
            <h4 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
              <UserX size={20} />
              Delete My Account Permanently
            </h4>
            <p className="text-red-800 mb-4 text-sm">
              <strong>⚠️ PERMANENT:</strong> Delete your account completely and sign out. You'll need to create a new account to use the app again.
            </p>
            <button
              onClick={handleDeleteMyAccount}
              disabled={deleteAccountStatus === 'deleting' || user?.uid === 'guest'}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all ${
                deleteAccountStatus === 'deleting' 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : deleteAccountStatus === 'success'
                  ? 'bg-green-600 text-white'
                  : deleteAccountStatus === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-gradient-to-r from-red-700 to-red-900 text-white hover:from-red-800 hover:to-red-950'
              }`}
            >
              <UserX size={20} />
              {deleteAccountStatus === 'deleting' ? 'Deleting Account...' : 
               deleteAccountStatus === 'success' ? '✅ Account Deleted!' :
               deleteAccountStatus === 'error' ? '❌ Failed' :
               'Delete My Account'}
            </button>
            {user?.uid === 'guest' && (
              <p className="text-red-600 text-sm mt-2 font-semibold">
                ⓘ Guest users cannot use this feature. Please sign in with Google.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* App Version & Updates */}
      <section className="bg-gradient-to-br from-white to-blue-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl border-2 sm:border-3 border-blue-300 p-4 sm:p-6">
        <h3 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-xl shadow-lg">
            <Smartphone className="text-white" size={28}/>
          </div>
          App Information
        </h3>
        
        <div className="space-y-4">
          {/* Version Info */}
          <div className="bg-white border-2 border-blue-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-stone-900">Current Version</h4>
                <p className="text-blue-600 text-2xl font-bold mt-1">v{versionData.version}</p>
                <p className="text-stone-600 text-sm mt-1">Build Date: {versionData.buildDate}</p>
              </div>
              <div className="text-5xl">🎯</div>
            </div>
            
            {/* Check for Updates Button */}
            <button
              onClick={handleCheckForUpdates}
              disabled={checkingUpdate}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all ${
                checkingUpdate 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : updateAvailable
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
              }`}
            >
              <RefreshCw size={20} className={checkingUpdate ? 'animate-spin' : ''} />
              {checkingUpdate ? 'Checking...' : 
               updateAvailable ? '🎉 Update Available!' :
               'Check for Updates'}
            </button>
          </div>

          {/* Update Info */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <span className="text-lg">ℹ️</span>
              How Updates Work
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Browser:</strong> Updates apply automatically on page refresh</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Installed App:</strong> You'll see a notification when updates are available</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Auto-check:</strong> App checks for updates every 30 minutes when open</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Manual check:</strong> Use the button above anytime to check for new versions</span>
              </li>
            </ul>
          </div>

          {/* Latest Changes */}
          {versionData.changelog && versionData.changelog.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
              <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                <span className="text-lg">✨</span>
                What's New in v{versionData.changelog[0].version}
              </h4>
              <ul className="space-y-1.5 text-sm text-purple-800">
                {versionData.changelog[0].changes.map((change: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold mt-0.5">✓</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Settings;
