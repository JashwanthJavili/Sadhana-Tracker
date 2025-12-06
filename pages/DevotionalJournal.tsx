import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Heart, Plus, Trash2, Edit2, Save, X, Calendar, Clock } from 'lucide-react';
import { getJournalEntries, saveJournalEntry, deleteJournalEntry } from '../services/storage';

interface JournalEntry {
  id: string;
  date: string;
  timestamp: number;
  title: string;
  content: string;
  mood: 'peaceful' | 'joyful' | 'contemplative' | 'struggling' | 'grateful';
  tags: string[];
}

const DevotionalJournal: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({
    title: '',
    content: '',
    mood: 'peaceful',
    tags: []
  });
  const [newTag, setNewTag] = useState('');

  const moodEmojis = {
    peaceful: '🕉️',
    joyful: '😊',
    contemplative: '🤔',
    struggling: '😔',
    grateful: '🙏'
  };

  const moodLabels = {
    en: {
      peaceful: 'Peaceful',
      joyful: 'Joyful',
      contemplative: 'Contemplative',
      struggling: 'Struggling',
      grateful: 'Grateful'
    },
    hi: {
      peaceful: 'शांत',
      joyful: 'आनंदमय',
      contemplative: 'चिंतनशील',
      struggling: 'संघर्षरत',
      grateful: 'कृतज्ञ'
    },
    te: {
      peaceful: 'శాంతియుతం',
      joyful: 'ఆనందకరం',
      contemplative: 'ఆలోచనాత్మకం',
      struggling: 'కష్టపడుతున్నాను',
      grateful: 'కృతజ్ఞత'
    }
  };

  useEffect(() => {
    const fetchEntries = async () => {
      if (user) {
        const data = await getJournalEntries(user.uid);
        setEntries(data);
      }
    };
    fetchEntries();
  }, [user]);

  const handleSave = async () => {
    if (user && currentEntry.title && currentEntry.content) {
      try {
        const entry: JournalEntry = {
          id: editingId || Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          timestamp: Date.now(),
          title: currentEntry.title!,
          content: currentEntry.content!,
          mood: currentEntry.mood || 'peaceful',
          tags: currentEntry.tags || []
        };

        await saveJournalEntry(user.uid, entry);
        const updated = await getJournalEntries(user.uid);
        setEntries(updated);
        
        setIsWriting(false);
        setEditingId(null);
        setCurrentEntry({ title: '', content: '', mood: 'peaceful', tags: [] });
      } catch (error) {
        console.error('Error saving journal entry:', error);
        alert('Failed to save entry. Please try again.');
      }
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setEditingId(entry.id);
    setIsWriting(true);
  };

  const handleDelete = async (id: string) => {
    if (user && confirm('Delete this journal entry?')) {
      await deleteJournalEntry(user.uid, id);
      const updated = await getJournalEntries(user.uid);
      setEntries(updated);
    }
  };

  const addTag = () => {
    if (newTag && !currentEntry.tags?.includes(newTag)) {
      setCurrentEntry({
        ...currentEntry,
        tags: [...(currentEntry.tags || []), newTag]
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setCurrentEntry({
      ...currentEntry,
      tags: currentEntry.tags?.filter(t => t !== tag)
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'te-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'te-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isWriting) {
    return (
      <div className="max-w-4xl mx-auto animate-fadeIn">
        <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-2xl border-3 border-orange-300 p-8 space-y-8 transition-all duration-300">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-serif font-bold text-stone-900 flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-3 rounded-xl shadow-lg">
                <Heart className="text-white" size={32} />
              </div>
              {editingId ? (language === 'en' ? 'Edit Entry' : language === 'hi' ? 'प्रविष्टि संपादित करें' : 'ఎంట్రీని సవరించండి') : (language === 'en' ? 'New Journal Entry' : language === 'hi' ? 'नई डायरी प्रविष्टि' : 'క్రొత్త డైరీ ఎంట్రీ')}
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsWriting(false);
                setEditingId(null);
                setCurrentEntry({ title: '', content: '', mood: 'peaceful', tags: [] });
              }}
              className="text-stone-400 hover:text-red-600 transition-all transform hover:scale-110 active:scale-95 p-2 hover:bg-red-50 rounded-lg"
            >
              <X size={28} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-base font-bold text-stone-800 mb-3">
                {language === 'en' ? 'Title' : language === 'hi' ? 'शीर्षक' : 'శీర్షిక'}
              </label>
              <input
                type="text"
                value={currentEntry.title}
                onChange={(e) => setCurrentEntry({ ...currentEntry, title: e.target.value })}
                className="w-full p-4 border-3 border-stone-300 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 outline-none transition-all duration-300 hover:border-orange-300 text-lg font-semibold shadow-md"
                placeholder={language === 'en' ? 'Give your entry a title...' : language === 'hi' ? 'अपनी प्रविष्टि को शीर्षक दें...' : 'మీ ఎంట్రీకి శీర్షిక ఇవ్వండి...'}
              />
            </div>

            <div>
              <label className="block text-base font-bold text-stone-800 mb-3">
                {language === 'en' ? 'How are you feeling?' : language === 'hi' ? 'आप कैसा महसूस कर रहे हैं?' : 'మీరు ఎలా అనుభూతి చెందుతున్నారు?'}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {(Object.keys(moodEmojis) as Array<keyof typeof moodEmojis>).map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setCurrentEntry({ ...currentEntry, mood })}
                    className={`p-4 rounded-xl border-3 transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md hover:shadow-xl ${
                      currentEntry.mood === mood
                        ? 'border-orange-600 bg-gradient-to-br from-orange-100 to-amber-100 shadow-lg ring-4 ring-orange-200'
                        : 'border-stone-300 hover:border-orange-400 hover:bg-orange-50/50 bg-white'
                    }`}
                  >
                    <div className="text-3xl text-center mb-2">{moodEmojis[mood]}</div>
                    <div className="text-sm text-center font-semibold text-stone-800">{moodLabels[language][mood]}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-base font-bold text-stone-800 mb-3">
                {language === 'en' ? 'Your Devotional Thoughts & Feelings' : language === 'hi' ? 'आपके भक्ति विचार और भावनाएं' : 'మీ భక్తి ఆలోచనలు & భావాలు'}
              </label>
              <textarea
                value={currentEntry.content}
                onChange={(e) => setCurrentEntry({ ...currentEntry, content: e.target.value })}
                className="w-full p-5 border-3 border-stone-300 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 outline-none min-h-[350px] font-serif text-lg transition-all duration-300 hover:border-orange-300 resize-y leading-relaxed shadow-md bg-white"
                placeholder={language === 'en' ? 'Pour your heart out... Share your realizations, struggles, gratitude, or any devotional feelings...' : language === 'hi' ? 'अपना दिल खोलें... अपनी अनुभूतियां, संघर्ष, कृतज्ञता, या कोई भी भक्ति भावनाएं साझा करें...' : 'మీ హృదయాన్ని పంచుకోండి... మీ అవగాహనలు, కష్టాలు, కృతజ్ఞత లేదా ఏదైనా భక్తి భావాలను పంచుకోండి...'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                {language === 'en' ? 'Tags (Optional)' : language === 'hi' ? 'टैग (वैकल्पिक)' : 'ట్యాగ్‌లు (ఐచ్ఛికం)'}
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1 p-2 border border-stone-300 rounded-lg text-sm"
                  placeholder={language === 'en' ? 'Add a tag...' : language === 'hi' ? 'एक टैग जोड़ें...' : 'ట్యాగ్ జోడించండి...'}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentEntry.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-orange-900">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t-2 border-orange-200">
            <button
              type="button"
              onClick={handleSave}
              disabled={!currentEntry.title || !currentEntry.content}
              className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-orange-700 hover:via-amber-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 min-h-[58px]"
            >
              <Save size={24} />
              {t.common.save}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsWriting(false);
                setEditingId(null);
                setCurrentEntry({ title: '', content: '', mood: 'peaceful', tags: [] });
              }}
              className="px-8 py-4 border-3 border-stone-300 text-stone-700 rounded-xl font-bold text-lg hover:bg-stone-100 transition-all duration-300 hover:border-stone-400 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg min-h-[58px]"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-gradient-to-r from-orange-700 via-amber-600 to-orange-700 rounded-2xl p-8 shadow-2xl border-2 border-orange-400">
        <div>
          <h1 className="text-4xl font-serif font-bold text-white flex items-center gap-3">
            <Heart className="text-yellow-200" size={40} />
            {language === 'en' ? 'Devotional Journal' : language === 'hi' ? 'भक्ति डायरी' : 'భక్తి డైరీ'}
          </h1>
          <p className="text-orange-100 mt-2 text-lg font-medium">
            {language === 'en' ? 'Record your inner devotional feelings and spiritual experiences' : language === 'hi' ? 'अपनी आंतरिक भक्ति भावनाओं और आध्यात्मिक अनुभवों को रिकॉर्ड करें' : 'మీ అంతర్గత భక్తి భావాలు మరియు ఆధ్యాత్మిక అనుభవాలను రికార్డ్ చేయండి'}
          </p>
        </div>
        <button
          onClick={() => setIsWriting(true)}
          className="flex items-center gap-3 px-8 py-4 bg-white text-orange-700 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 w-full sm:w-auto min-h-[58px]"
        >
          <Plus size={24} />
          {language === 'en' ? 'New Entry' : language === 'hi' ? 'नई प्रविष्टि' : 'క్రొత్త ఎంట్రీ'}
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-xl border-3 border-orange-200 p-16 text-center">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 mb-6 shadow-lg">
            <Heart size={64} className="text-orange-500" />
          </div>
          <h3 className="text-2xl font-bold text-stone-800 mb-3">
            {language === 'en' ? 'No journal entries yet' : language === 'hi' ? 'अभी तक कोई डायरी प्रविष्टि नहीं' : 'ఇంకా డైరీ ఎంట్రీలు లేవు'}
          </h3>
          <p className="text-stone-600 mb-8 text-lg max-w-md mx-auto">
            {language === 'en' ? 'Start recording your devotional journey and inner feelings' : language === 'hi' ? 'अपनी भक्ति यात्रा और आंतरिक भावनाओं को रिकॉर्ड करना शुरू करें' : 'మీ భక్తి ప్రయాణం మరియు అంతర్గత భావాలను రికార్డ్ చేయడం ప్రారంభించండి'}
          </p>
          <button
            onClick={() => setIsWriting(true)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-orange-700 hover:via-amber-700 hover:to-orange-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
          >
            <Plus size={24} />
            {language === 'en' ? 'Write First Entry' : language === 'hi' ? 'पहली प्रविष्टि लिखें' : 'మొదటి ఎంట్రీ వ్రాయండి'}
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="group bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-xl border-3 border-orange-200 p-8 hover:shadow-2xl transition-all duration-300 hover:border-orange-400 transform hover:scale-[1.02] hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-4xl">{moodEmojis[entry.mood]}</span>
                    <h3 className="text-2xl font-serif font-bold text-stone-900">{entry.title}</h3>
                  </div>
                  <div className="flex items-center gap-5 text-sm text-stone-600 font-medium">
                    <span className="flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-lg">
                      <Calendar size={16} />
                      {formatDate(entry.timestamp)}
                    </span>
                    <span className="flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-lg">
                      <Clock size={16} />
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-3 text-stone-400 hover:text-orange-600 transition-all transform hover:scale-110 active:scale-95 bg-white rounded-xl shadow-md hover:shadow-lg"
                  >
                    <Edit2 size={22} />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-3 text-stone-400 hover:text-red-600 transition-all transform hover:scale-110 active:scale-95 bg-white rounded-xl shadow-md hover:shadow-lg"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>
              </div>

              <p className="text-stone-800 font-serif whitespace-pre-wrap mb-6 text-lg leading-relaxed bg-white p-6 rounded-xl shadow-inner border border-stone-200">{entry.content}</p>

              {entry.tags?.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 rounded-xl text-sm font-semibold shadow-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DevotionalJournal;
