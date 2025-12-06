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
          <button
            onClick={handleSave}
            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl transform hover:scale-105 active:scale-95 min-h-[58px] ${
              saveStatus === 'saved' 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-white text-orange-700 hover:bg-orange-50'
            }`}
          >
            <Save size={24} />
            {saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Identity Section */}
      <section className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-3 border-blue-300 p-8">
        <h3 className="text-2xl font-bold text-stone-900 mb-8 flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
            <User className="text-white" size={28}/>
          </div>
          Identity & Center
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-bold text-stone-800 mb-3">Your Name</label>
            <input
              type="text"
              value={settings.userName}
              onChange={(e) => setSettings({ ...settings, userName: e.target.value })}
              className="w-full p-4 border-3 border-stone-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 outline-none text-base font-semibold shadow-md hover:border-blue-300 transition-all"
            />
          </div>
          <div>
            <label className="block text-base font-bold text-stone-800 mb-3">ISKCON Center / Group Name</label>
            <input
              type="text"
              value={settings.iskconCenter}
              onChange={(e) => setSettings({ ...settings, iskconCenter: e.target.value })}
              className="w-full p-4 border-3 border-stone-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 outline-none text-base font-semibold shadow-md hover:border-blue-300 transition-all"
            />
          </div>
        </div>
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
          <div>
            <label className="block text-base font-bold text-stone-800 mb-3">Guided By</label>
            <input
              type="text"
              value={settings.guruName}
              onChange={(e) => setSettings({ ...settings, guruName: e.target.value })}
              className="w-full p-4 border-3 border-stone-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 outline-none text-base font-semibold shadow-md hover:border-purple-300 transition-all"
              placeholder="e.g. HG Pranavanand Das Prabhu"
            />
          </div>
          <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-6 rounded-2xl shadow-md border-2 border-orange-300">
            <p className="text-base text-orange-900 italic font-serif font-semibold leading-relaxed">
              "By the mercy of the spiritual master one receives the benediction of Krishna."
            </p>
          </div>
        </div>
      </section>

      {/* Quotes Section */}
      <section className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border-3 border-green-300 p-8">
        <h3 className="text-2xl font-bold text-stone-900 mb-8">Motivational Quotes</h3>
        
        <div className="mb-8 flex gap-3">
          <input
            type="text"
            placeholder="Quote text..."
            value={newQuoteText}
            onChange={(e) => setNewQuoteText(e.target.value)}
            className="flex-1 p-4 border-3 border-stone-300 rounded-xl text-base focus:ring-4 focus:ring-green-300 outline-none shadow-md"
          />
          <input
            type="text"
            placeholder="Source (e.g. Gita 2.13)"
            value={newQuoteSource}
            onChange={(e) => setNewQuoteSource(e.target.value)}
            className="w-56 p-4 border-3 border-stone-300 rounded-xl text-base focus:ring-4 focus:ring-green-300 outline-none shadow-md"
          />
          <button 
            onClick={addQuote}
            disabled={!newQuoteText || !newQuoteSource}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-xl disabled:opacity-50 hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="space-y-3">
          {(settings.customQuotes || []).map((quote) => (
            <div key={quote.id} className="flex justify-between items-start p-5 bg-white rounded-xl group shadow-md hover:shadow-lg transition-all border-2 border-green-200 hover:border-green-400">
              <div className="flex-1">
                <p className="text-stone-800 font-serif text-base leading-relaxed mb-2">"{quote.text}"</p>
                <p className="text-stone-600 text-sm font-semibold">— {quote.source}</p>
              </div>
              <button 
                onClick={() => removeQuote(quote.id)}
                className="text-stone-400 hover:text-red-600 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 p-2"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {(!settings.customQuotes || settings.customQuotes.length === 0) && (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-green-300">
              <p className="text-stone-500 text-base font-medium">No quotes added yet. Add your first inspiring quote above!</p>
            </div>
          )}
        </div>
      </section>

      {/* Language Preference */}
      <section className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-xl border-3 border-amber-300 p-8">
        <h3 className="text-2xl font-bold text-stone-900 mb-8 flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl shadow-lg">
            <Globe className="text-white" size={28}/>
          </div>
          Language Preference
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { code: 'en' as const, name: 'English', native: 'English' },
            { code: 'hi' as const, name: 'Hindi', native: 'हिंदी' },
            { code: 'te' as const, name: 'Telugu', native: 'తెలుగు' }
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSettings({ ...settings!, language: lang.code })}
              className={`p-6 rounded-xl border-3 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
                settings.language === lang.code
                  ? 'border-orange-600 bg-gradient-to-br from-orange-100 to-amber-100 text-orange-900 ring-4 ring-orange-200'
                  : 'border-stone-300 hover:border-orange-400 bg-white hover:bg-orange-50'
              }`}
            >
              <div className="text-center">
                <div className="font-bold text-xl mb-1">{lang.name}</div>
                <div className="text-base text-stone-600 font-semibold">{lang.native}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Custom Fields */}
      <section className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl border-3 border-indigo-300 p-8">
        <h3 className="text-2xl font-bold text-stone-900 mb-8 flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
            <Wrench className="text-white" size={28}/>
          </div>
          Custom Fields
        </h3>
        
        <div className="mb-8 flex gap-3">
          <input
            type="text"
            placeholder="Field name (e.g. Temple Service)"
            value={newFieldKey}
            onChange={(e) => setNewFieldKey(e.target.value)}
            className="flex-1 p-4 border-3 border-stone-300 rounded-xl text-base focus:ring-4 focus:ring-indigo-300 outline-none shadow-md"
          />
          <input
            type="text"
            placeholder="Value"
            value={newFieldValue}
            onChange={(e) => setNewFieldValue(e.target.value)}
            className="flex-1 p-4 border-3 border-stone-300 rounded-xl text-base focus:ring-4 focus:ring-indigo-300 outline-none shadow-md"
          />
          <button 
            onClick={addCustomField}
            disabled={!newFieldKey || !newFieldValue}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl disabled:opacity-50 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="space-y-3">
          {settings.customFields && Object.entries(settings.customFields).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center p-5 bg-white rounded-xl group shadow-md hover:shadow-lg transition-all border-2 border-indigo-200 hover:border-indigo-400">
              <div>
                <span className="font-bold text-stone-900 text-base">{key}:</span>{' '}
                <span className="text-stone-700 text-base">{value}</span>
              </div>
              <button 
                onClick={() => removeCustomField(key)}
                className="text-stone-400 hover:text-red-600 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 p-2"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {(!settings.customFields || Object.keys(settings.customFields).length === 0) && (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-indigo-300">
              <p className="text-stone-500 text-base font-medium">No custom fields added yet. Create your personalized fields above!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Settings;