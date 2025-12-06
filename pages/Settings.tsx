import React, { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../services/storage';
import { UserSettings } from '../types';
import { Save, User, Wrench, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { migrateAllUserProfiles } from '../scripts/migrateUserProfiles';
import { createUserProfile } from '../services/chat';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isEditing, setIsEditing] = useState(false);
  const [editedSettings, setEditedSettings] = useState<UserSettings | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  
  // Admin email - only this user has admin privileges
  const ADMIN_EMAIL = 'jashwanthjavili7@gmail.com';
  const isAdmin = user?.email === ADMIN_EMAIL;

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
        
        // Save settings to database
        await saveSettings(user.uid, editedSettings);
        
        // Update chat profile with new settings
        if (editedSettings.userName && editedSettings.guruName && editedSettings.iskconCenter) {
          const profileData: any = {
            userName: editedSettings.userName,
            guruName: editedSettings.guruName,
            iskconCenter: editedSettings.iskconCenter,
          };
          
          if (user.photoURL) profileData.photoURL = user.photoURL;
          
          await createUserProfile(user.uid, profileData);
          console.log('✅ Chat profile updated with new settings');
        }
        
        setSettings(editedSettings);
        setSaveStatus('saved');
        setIsEditing(false);
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

  if (!settings) return <div className="flex items-center justify-center min-h-[400px]"><div className="text-center"><div className="inline-block w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div><p className="text-stone-600 font-medium text-lg">Loading settings...</p></div></div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      <div className="bg-gradient-to-r from-orange-700 via-amber-600 to-orange-700 rounded-2xl p-8 shadow-2xl border-2 border-orange-400">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-serif font-bold text-white mb-2 flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <Wrench className="text-white" size={36} />
              </div>
              App Customization
            </h2>
            <p className="text-orange-100 text-lg font-medium">Personalize your spiritual workspace</p>
          </div>
        </div>
      </div>

      {/* Identity Section */}
      <section className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-3 border-blue-300 p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
              <User className="text-white" size={28}/>
            </div>
            Identity & Center
          </h3>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all"
            >
              <Wrench size={20} />
              Edit
            </button>
          )}
        </div>
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Save size={24} />
              {saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg bg-stone-300 text-stone-700 hover:bg-stone-400 transition-all shadow-xl transform hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
          </div>
        )}
      </section>

      {/* Spiritual Guide Section */}
      <section className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border-3 border-purple-300 p-8">
        <h3 className="text-2xl font-bold text-stone-900 mb-8 flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg">
            <User className="text-white" size={28}/>
          </div>
          Spiritual Guide
        </h3>
        <div className="space-y-6">
          {isEditing ? (
            <div>
              <label className="block text-base font-bold text-stone-800 mb-3">Guided By</label>
              <input
                type="text"
                value={editedSettings?.guruName || ''}
                onChange={(e) => setEditedSettings({ ...editedSettings!, guruName: e.target.value })}
                className="w-full p-4 border-3 border-stone-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 outline-none text-base font-semibold shadow-md hover:border-purple-300 transition-all"
                placeholder="e.g. HG Pranavanand Das Prabhu"
              />
            </div>
          ) : (
            <div>
              <label className="block text-base font-bold text-stone-800 mb-3">Guided By</label>
              <div className="w-full p-4 bg-white border-3 border-purple-200 rounded-xl text-base font-semibold shadow-md">
                {settings.guruName || 'Not set'}
              </div>
            </div>
          )}
          <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-6 rounded-2xl shadow-md border-2 border-orange-300">
            <p className="text-base text-orange-900 italic font-serif font-semibold leading-relaxed">
              "By the mercy of the spiritual master one receives the benediction of Krishna."
            </p>
          </div>
        </div>
      </section>

      {/* Admin Tools Section - Only visible to admin */}
      {isAdmin && (
        <section className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl border-3 border-indigo-300 p-8">
          <h3 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <Users className="text-white" size={28}/>
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
    </div>
  );
};

export default Settings;