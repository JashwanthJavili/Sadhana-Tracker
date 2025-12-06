import React, { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../services/storage';
import { UserSettings, Quote } from '../types';
import { Save, Plus, Trash2, User, Globe, Wrench } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuoteSource, setNewQuoteSource] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  useEffect(() => {
    const fetch = async () => {
      if (user) {
        const data = await getSettings(user.uid);
        // If settings are empty, we might want to pre-fill user name from Auth
        if (!data.userName && user.displayName) {
          data.userName = user.displayName;
        }
        // Ensure customQuotes is always an array
        if (!data.customQuotes) {
          data.customQuotes = [];
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



  const addQuote = () => {
    if (settings && newQuoteText && newQuoteSource) {
      const newQuote: Quote = {
        id: Date.now().toString(),
        text: newQuoteText,
        source: newQuoteSource
      };
      setSettings({
        ...settings,
        customQuotes: [...(settings.customQuotes || []), newQuote]
      });
      setNewQuoteText('');
      setNewQuoteSource('');
    }
  };

  const removeQuote = (id: string) => {
    if (settings) {
      setSettings({
        ...settings,
        customQuotes: (settings.customQuotes || []).filter(q => q.id !== id)
      });
    }
  };

  const addCustomField = () => {
    if (settings && newFieldKey && newFieldValue) {
      setSettings({
        ...settings,
        customFields: {
          ...(settings.customFields || {}),
          [newFieldKey]: newFieldValue
        }
      });
      setNewFieldKey('');
      setNewFieldValue('');
    }
  };

  const removeCustomField = (key: string) => {
    if (settings && settings.customFields) {
      const { [key]: _, ...rest } = settings.customFields;
      setSettings({
        ...settings,
        customFields: rest
      });
    }
  };

  if (!settings) return <div className="p-8 text-center text-stone-500">Loading settings...</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-serif font-bold text-stone-900">App Customization</h2>
           <p className="text-stone-500">Personalize your spiritual workspace.</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all shadow-md ${
            saveStatus === 'saved' 
              ? 'bg-green-600 text-white' 
              : 'bg-orange-700 text-white hover:bg-orange-800'
          }`}
        >
          <Save size={18} />
          {saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Identity Section */}
      <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
          <User className="text-orange-600" size={20}/> Identity & Center
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Your Name</label>
            <input
              type="text"
              value={settings.userName}
              onChange={(e) => setSettings({ ...settings, userName: e.target.value })}
              className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">ISKCON Center / Group Name</label>
            <input
              type="text"
              value={settings.iskconCenter}
              onChange={(e) => setSettings({ ...settings, iskconCenter: e.target.value })}
              className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Spiritual Guide Section */}
      <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
          <User className="text-orange-600" size={20}/> Spiritual Guide
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Guided By</label>
            <input
              type="text"
              value={settings.guruName}
              onChange={(e) => setSettings({ ...settings, guruName: e.target.value })}
              className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="e.g. HG Pranavanand Das Prabhu"
            />
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-800 italic">
              "By the mercy of the spiritual master one receives the benediction of Krishna."
            </p>
          </div>
        </div>
      </section>

      {/* Quotes Section */}
      <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h3 className="text-lg font-bold text-stone-800 mb-6">Motivational Quotes</h3>
        
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Quote text..."
            value={newQuoteText}
            onChange={(e) => setNewQuoteText(e.target.value)}
            className="flex-1 p-2 border border-stone-300 rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="Source (e.g. Gita 2.13)"
            value={newQuoteSource}
            onChange={(e) => setNewQuoteSource(e.target.value)}
            className="w-48 p-2 border border-stone-300 rounded-lg text-sm"
          />
          <button 
            onClick={addQuote}
            disabled={!newQuoteText || !newQuoteSource}
            className="bg-stone-900 text-white p-2 rounded-lg disabled:opacity-50 hover:bg-stone-800"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-2">
          {(settings.customQuotes || []).map((quote) => (
            <div key={quote.id} className="flex justify-between items-start p-3 bg-stone-50 rounded-lg group">
              <div>
                <p className="text-stone-800 font-serif text-sm">"{quote.text}"</p>
                <p className="text-stone-500 text-xs mt-1">— {quote.source}</p>
              </div>
              <button 
                onClick={() => removeQuote(quote.id)}
                className="text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {(!settings.customQuotes || settings.customQuotes.length === 0) && (
            <p className="text-stone-400 text-sm text-center py-4">No quotes added yet.</p>
          )}
        </div>
      </section>

      {/* Language Preference */}
      <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
          <Globe className="text-orange-600" size={20}/> Language Preference
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { code: 'en' as const, name: 'English', native: 'English' },
            { code: 'hi' as const, name: 'Hindi', native: 'हिंदी' },
            { code: 'te' as const, name: 'Telugu', native: 'తెలుగు' }
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSettings({ ...settings!, language: lang.code })}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.language === lang.code
                  ? 'border-orange-600 bg-orange-50 text-orange-900'
                  : 'border-stone-300 hover:border-orange-300'
              }`}
            >
              <div className="text-center">
                <div className="font-medium">{lang.name}</div>
                <div className="text-sm text-stone-500">{lang.native}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Custom Fields */}
      <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
          <Wrench className="text-orange-600" size={20}/> Custom Fields
        </h3>
        
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Field name (e.g. Temple Service)"
            value={newFieldKey}
            onChange={(e) => setNewFieldKey(e.target.value)}
            className="flex-1 p-2 border border-stone-300 rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="Value"
            value={newFieldValue}
            onChange={(e) => setNewFieldValue(e.target.value)}
            className="flex-1 p-2 border border-stone-300 rounded-lg text-sm"
          />
          <button 
            onClick={addCustomField}
            disabled={!newFieldKey || !newFieldValue}
            className="bg-stone-900 text-white p-2 rounded-lg disabled:opacity-50 hover:bg-stone-800"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-2">
          {settings.customFields && Object.entries(settings.customFields).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center p-3 bg-stone-50 rounded-lg group">
              <div>
                <span className="font-medium text-stone-800">{key}:</span>{' '}
                <span className="text-stone-600">{value}</span>
              </div>
              <button 
                onClick={() => removeCustomField(key)}
                className="text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {(!settings.customFields || Object.keys(settings.customFields).length === 0) && (
            <p className="text-stone-400 text-sm text-center py-4">No custom fields added yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Settings;