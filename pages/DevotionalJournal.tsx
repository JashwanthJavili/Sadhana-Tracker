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
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 transition-all duration-300">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <Heart className="text-orange-600" size={28} />
              {editingId ? (language === 'en' ? 'Edit Entry' : language === 'hi' ? 'प्रविष्टि संपादित करें' : 'ఎంట్రీని సవరించండి') : (language === 'en' ? 'New Journal Entry' : language === 'hi' ? 'नई डायरी प्रविष्टि' : 'క్రొత్త డైరీ ఎంట్రీ')}
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsWriting(false);
                setEditingId(null);
                setCurrentEntry({ title: '', content: '', mood: 'peaceful', tags: [] });
              }}
              className="text-stone-400 hover:text-stone-600"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                {language === 'en' ? 'Title' : language === 'hi' ? 'शीर्षक' : 'శీర్షిక'}
              </label>
              <input
                type="text"
                value={currentEntry.title}
                onChange={(e) => setCurrentEntry({ ...currentEntry, title: e.target.value })}
                className="w-full p-3 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 hover:border-orange-200"
                placeholder={language === 'en' ? 'Give your entry a title...' : language === 'hi' ? 'अपनी प्रविष्टि को शीर्षक दें...' : 'మీ ఎంట్రీకి శీర్షిక ఇవ్వండి...'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                {language === 'en' ? 'How are you feeling?' : language === 'hi' ? 'आप कैसा महसूस कर रहे हैं?' : 'మీరు ఎలా అనుభూతి చెందుతున్నారు?'}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(moodEmojis) as Array<keyof typeof moodEmojis>).map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setCurrentEntry({ ...currentEntry, mood })}
                    className={`p-3 rounded-lg border-2 transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                      currentEntry.mood === mood
                        ? 'border-orange-600 bg-orange-50 shadow-md'
                        : 'border-stone-300 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}
                  >
                    <div className="text-2xl text-center mb-1">{moodEmojis[mood]}</div>
                    <div className="text-xs text-center">{moodLabels[language][mood]}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                {language === 'en' ? 'Your Devotional Thoughts & Feelings' : language === 'hi' ? 'आपके भक्ति विचार और भावनाएं' : 'మీ భక్తి ఆలోచనలు & భావాలు'}
              </label>
              <textarea
                value={currentEntry.content}
                onChange={(e) => setCurrentEntry({ ...currentEntry, content: e.target.value })}
                className="w-full p-3 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none min-h-[300px] font-serif transition-all duration-300 hover:border-orange-200 resize-y"
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={!currentEntry.title || !currentEntry.content}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <Save size={20} />
              {t.common.save}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsWriting(false);
                setEditingId(null);
                setCurrentEntry({ title: '', content: '', mood: 'peaceful', tags: [] });
              }}
              className="px-6 py-3 border-2 border-stone-300 text-stone-700 rounded-lg font-semibold hover:bg-stone-50 transition-all duration-300 hover:border-stone-400 transform hover:scale-105 active:scale-95"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <Heart className="text-orange-600" size={32} />
            {language === 'en' ? 'Devotional Journal' : language === 'hi' ? 'भक्ति डायरी' : 'భక్తి డైరీ'}
          </h1>
          <p className="text-stone-600 mt-1">
            {language === 'en' ? 'Record your inner devotional feelings and spiritual experiences' : language === 'hi' ? 'अपनी आंतरिक भक्ति भावनाओं और आध्यात्मिक अनुभवों को रिकॉर्ड करें' : 'మీ అంతర్గత భక్తి భావాలు మరియు ఆధ్యాత్మిక అనుభవాలను రికార్డ్ చేయండి'}
          </p>
        </div>
        <button
          onClick={() => setIsWriting(true)}
          className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 w-full sm:w-auto"
        >
          <Plus size={20} />
          {language === 'en' ? 'New Entry' : language === 'hi' ? 'नई प्रविष्टि' : 'క్రొత్త ఎంట్రీ'}
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
          <Heart size={64} className="text-stone-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-stone-700 mb-2">
            {language === 'en' ? 'No journal entries yet' : language === 'hi' ? 'अभी तक कोई डायरी प्रविष्टि नहीं' : 'ఇంకా డైరీ ఎంట్రీలు లేవు'}
          </h3>
          <p className="text-stone-500 mb-6">
            {language === 'en' ? 'Start recording your devotional journey and inner feelings' : language === 'hi' ? 'अपनी भक्ति यात्रा और आंतरिक भावनाओं को रिकॉर्ड करना शुरू करें' : 'మీ భక్తి ప్రయాణం మరియు అంతర్గత భావాలను రికార్డ్ చేయడం ప్రారంభించండి'}
          </p>
          <button
            onClick={() => setIsWriting(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-lg"
          >
            <Plus size={20} />
            {language === 'en' ? 'Write First Entry' : language === 'hi' ? 'पहली प्रविष्टि लिखें' : 'మొదటి ఎంట్రీ వ్రాయండి'}
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-orange-200 transform hover:scale-[1.01]"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{moodEmojis[entry.mood]}</span>
                    <h3 className="text-xl font-serif font-bold text-stone-900">{entry.title}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-stone-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(entry.timestamp)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-2 text-stone-400 hover:text-orange-600 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <p className="text-stone-700 font-serif whitespace-pre-wrap mb-4">{entry.content}</p>

              {entry.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-sm"
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
