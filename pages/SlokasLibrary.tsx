import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ref, get, set, push, remove, update } from 'firebase/database';
import { db } from '../services/firebase';
import { BookOpen, Plus, MessageSquare, Trash2, Search, Heart, User, Clock, Languages, GripVertical } from 'lucide-react';
import { translateText, SUPPORTED_LANGUAGES } from '../services/translator';

const ADMIN_EMAIL = 'jashwanthjavili7@gmail.com';

interface Comment {
  id: string;
  text: string;
  userName: string;
  userId: string;
  timestamp: number;
}

interface Sloka {
  id: string;
  title: string;
  mantra: string;
  meaning?: string;
  addedBy: string;
  addedByName: string;
  timestamp: number;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  order?: number;
}

const SlokasLibrary: React.FC = () => {
  const { user } = useAuth();
  const [slokas, setSlokas] = useState<Sloka[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSloka, setNewSloka] = useState({ title: '', mantra: '', meaning: '' });
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [expandedSloka, setExpandedSloka] = useState<string | null>(null);
  const [translating, setTranslating] = useState<{ [key: string]: boolean }>({});
  const [translations, setTranslations] = useState<{ [key: string]: { mantra: string; meaning: string } }>({});
  const [selectedLang, setSelectedLang] = useState<{ [key: string]: string }>({});
  const [showTranslateModal, setShowTranslateModal] = useState<{ [key: string]: boolean }>({});
  const [expandedSlokas, setExpandedSlokas] = useState<{ [key: string]: boolean }>({});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    loadSlokas();
  }, []);

  const loadSlokas = async () => {
    try {
      const slokasRef = ref(db, 'slokas');
      const snapshot = await get(slokasRef);
      
      if (snapshot.exists()) {
        const slokasData: Sloka[] = [];
        snapshot.forEach((child) => {
          slokasData.push({ id: child.key!, ...child.val() });
        });
        // Sort by order field if exists, otherwise by timestamp
        setSlokas(slokasData.sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          return b.timestamp - a.timestamp;
        }));
      }
    } catch (error) {
      console.error('Error loading slokas:', error);
    }
  };

  const handleAddSloka = async () => {
    if (!user || user.uid === 'guest') {
      alert('Please sign in to add slokas');
      return;
    }

    if (!newSloka.title || !newSloka.mantra) {
      alert('Please fill in title and mantra');
      return;
    }

    try {
      const slokasRef = ref(db, 'slokas');
      const newSlokaRef = push(slokasRef);
      
      const slokaData: Sloka = {
        id: newSlokaRef.key!,
        title: newSloka.title,
        mantra: newSloka.mantra,
        meaning: newSloka.meaning,
        addedBy: user.uid,
        addedByName: user.displayName || user.email || 'Anonymous',
        timestamp: Date.now(),
        likes: 0,
        likedBy: [],
        comments: []
      };

      await set(newSlokaRef, slokaData);
      
      setNewSloka({ title: '', mantra: '', meaning: '' });
      setShowAddForm(false);
      loadSlokas();
      alert('✅ Sloka added successfully!');
    } catch (error) {
      console.error('Error adding sloka:', error);
      alert('Failed to add sloka');
    }
  };

  const handleLikeSloka = async (slokaId: string) => {
    if (!user || user.uid === 'guest') {
      alert('Please sign in to like slokas');
      return;
    }

    try {
      const sloka = slokas.find(s => s.id === slokaId);
      if (!sloka) return;

      const hasLiked = sloka.likedBy?.includes(user.uid);
      const updatedLikedBy = hasLiked
        ? sloka.likedBy.filter(id => id !== user.uid)
        : [...(sloka.likedBy || []), user.uid];

      await set(ref(db, `slokas/${slokaId}/likedBy`), updatedLikedBy);
      await set(ref(db, `slokas/${slokaId}/likes`), updatedLikedBy.length);
      
      loadSlokas();
    } catch (error) {
      console.error('Error liking sloka:', error);
    }
  };

  const handleAddComment = async (slokaId: string) => {
    if (!user || user.uid === 'guest') {
      alert('Please sign in to comment');
      return;
    }

    const text = commentText[slokaId]?.trim();
    if (!text) return;

    try {
      const commentsRef = ref(db, `slokas/${slokaId}/comments`);
      const newCommentRef = push(commentsRef);
      
      const comment: Comment = {
        id: newCommentRef.key!,
        text,
        userName: user.displayName || user.email || 'Anonymous',
        userId: user.uid,
        timestamp: Date.now()
      };

      await set(newCommentRef, comment);
      
      setCommentText({ ...commentText, [slokaId]: '' });
      loadSlokas();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteSloka = async (slokaId: string) => {
    if (!confirm('Are you sure you want to delete this sloka?')) return;

    try {
      await remove(ref(db, `slokas/${slokaId}`));
      loadSlokas();
      alert('✅ Sloka deleted');
    } catch (error) {
      console.error('Error deleting sloka:', error);
      alert('Failed to delete sloka');
    }
  };

  const handleTranslate = async (slokaId: string, mantra: string, meaning: string) => {
    const lang = selectedLang[slokaId];
    if (!lang) {
      alert('Please select a language first');
      return;
    }

    setTranslating({ ...translating, [slokaId]: true });

    try {
      const translatedMantra = await translateText(mantra, lang);
      const translatedMeaning = meaning ? await translateText(meaning, lang) : '';

      setTranslations({
        ...translations,
        [slokaId]: {
          mantra: translatedMantra,
          meaning: translatedMeaning
        }
      });
    } catch (error) {
      console.error('Translation error:', error);
      alert('Failed to translate. Please try again.');
    } finally {
      setTranslating({ ...translating, [slokaId]: false });
    }
  };

  const clearTranslation = (slokaId: string) => {
    const newTranslations = { ...translations };
    delete newTranslations[slokaId];
    setTranslations(newTranslations);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newSlokas = [...filteredSlokas];
    const [draggedSloka] = newSlokas.splice(draggedIndex, 1);
    newSlokas.splice(dropIndex, 0, draggedSloka);

    // Update order in Firebase
    try {
      const updates: any = {};
      newSlokas.forEach((sloka, idx) => {
        updates[`slokas/${sloka.id}/order`] = idx;
      });
      await update(ref(db), updates);
      setDraggedIndex(null);
      loadSlokas();
    } catch (error) {
      console.error('Error reordering slokas:', error);
      alert('Failed to reorder slokas');
    }
  };

  const filteredSlokas = slokas.filter(sloka =>
    sloka.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sloka.mantra.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sloka.meaning?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 rounded-2xl p-8 shadow-2xl border-2 border-purple-300">
        <h1 className="text-4xl font-bold text-white mb-2">Slokas & Mantras Library</h1>
        <p className="text-purple-100 text-lg">Community collection of sacred verses and mantras</p>
      </div>

      {/* Search & Add */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
            <input
              type="text"
              placeholder="Search slokas by title, mantra, or meaning..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-bold transition-all shadow-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Add Sloka
          </button>
        </div>
      </div>

      {/* Add Sloka Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-purple-300">
          <h3 className="text-xl font-bold text-stone-800 mb-4">Add New Sloka</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Title *</label>
              <input
                type="text"
                value={newSloka.title}
                onChange={(e) => setNewSloka({ ...newSloka, title: e.target.value })}
                placeholder="e.g., Gayatri Mantra, Guru Vandana"
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Mantra / Sloka *</label>
              <textarea
                value={newSloka.mantra}
                onChange={(e) => setNewSloka({ ...newSloka, mantra: e.target.value })}
                placeholder="Enter the Sanskrit mantra or sloka..."
                rows={6}
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none font-serif text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Meaning (Optional)</label>
              <textarea
                value={newSloka.meaning}
                onChange={(e) => setNewSloka({ ...newSloka, meaning: e.target.value })}
                placeholder="Enter the English translation or meaning..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleAddSloka}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-bold transition-all"
              >
                Submit Sloka
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 bg-stone-300 hover:bg-stone-400 text-stone-700 rounded-lg font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slokas List */}
      <div className="space-y-6">
        {filteredSlokas.length > 0 ? (
          filteredSlokas.map((sloka, index) => (
            <div 
              key={sloka.id} 
              className={`bg-white rounded-xl shadow-xl border-2 border-purple-200 hover:shadow-2xl transition-all overflow-hidden ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
              draggable={user?.email === ADMIN_EMAIL && !searchTerm}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
            >
              {/* Sloka Header - Clickable */}
              <div 
                className="p-6 cursor-pointer hover:bg-purple-50 transition-all"
                onClick={() => setExpandedSlokas({ ...expandedSlokas, [sloka.id]: !expandedSlokas[sloka.id] })}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Drag Handle for Admin */}
                    {user?.email === ADMIN_EMAIL && !searchTerm && (
                      <div 
                        className="cursor-move text-stone-400 hover:text-stone-600"
                        onClick={(e) => e.stopPropagation()}
                        title="Drag to reorder"
                      >
                        <GripVertical size={24} />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-stone-800 mb-2">{sloka.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-stone-600">
                        <span className="flex items-center gap-1">
                          <User size={16} />
                          {sloka.addedByName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          {new Date(sloka.timestamp).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full">
                          <Heart size={14} fill={sloka.likedBy?.includes(user?.uid || '') ? 'red' : 'none'} className="text-red-500" />
                          <span className="font-semibold">{sloka.likes || 0}</span>
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                          <MessageSquare size={14} className="text-blue-600" />
                          <span className="font-semibold">{sloka.comments?.length || 0}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user?.uid === sloka.addedBy && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSloka(sloka.id);
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors p-2"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <div className="text-purple-600 font-bold">
                      {expandedSlokas[sloka.id] ? '▼' : '▶'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedSlokas[sloka.id] && (
                <div className="px-6 pb-6 space-y-4">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border-2 border-amber-200">
                    <p className="text-xl leading-relaxed font-serif text-stone-800 whitespace-pre-wrap">
                      {translations[sloka.id] ? translations[sloka.id].mantra : sloka.mantra}
                    </p>
                  </div>

                  {sloka.meaning && (
                    <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                      <p className="text-sm font-bold text-blue-800 mb-1">Meaning:</p>
                      <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                        {translations[sloka.id] ? translations[sloka.id].meaning : sloka.meaning}
                      </p>
                    </div>
                  )}

                  {/* Translation Controls - Compact */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTranslateModal({ ...showTranslateModal, [sloka.id]: !showTranslateModal[sloka.id] });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 border-2 border-green-300 rounded-lg font-bold hover:bg-green-200 transition-all"
                      title="Translate"
                    >
                      <Languages size={20} />
                      {translations[sloka.id] ? 'Change Translation' : 'Translate'}
                    </button>
                    {translations[sloka.id] && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearTranslation(sloka.id);
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-200 transition-all"
                      >
                        Original
                      </button>
                    )}
                  </div>

                  {/* Translation Modal */}
                  {showTranslateModal[sloka.id] && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                      <div className="flex flex-wrap items-center gap-3">
                        <select
                          value={selectedLang[sloka.id] || ''}
                          onChange={(e) => setSelectedLang({ ...selectedLang, [sloka.id]: e.target.value })}
                          className="flex-1 min-w-[200px] px-3 py-2 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none bg-white"
                        >
                          <option value="">Select Language</option>
                          {SUPPORTED_LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTranslate(sloka.id, sloka.mantra, sloka.meaning || '');
                            setShowTranslateModal({ ...showTranslateModal, [sloka.id]: false });
                          }}
                          disabled={!selectedLang[sloka.id] || translating[sloka.id]}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-bold transition-all"
                        >
                          {translating[sloka.id] ? '⏳ Translating...' : '🌐 Translate'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTranslateModal({ ...showTranslateModal, [sloka.id]: false });
                          }}
                          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-bold transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Like & Comment Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikeSloka(sloka.id);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                        sloka.likedBy?.includes(user?.uid || '')
                          ? 'bg-red-100 text-red-600 border-2 border-red-300'
                          : 'bg-stone-100 text-stone-600 border-2 border-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      <Heart size={20} fill={sloka.likedBy?.includes(user?.uid || '') ? 'currentColor' : 'none'} />
                      {sloka.likes || 0}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedSloka(expandedSloka === sloka.id ? null : sloka.id);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 border-2 border-purple-300 rounded-lg font-bold hover:bg-purple-200 transition-all"
                    >
                      <MessageSquare size={20} />
                      {sloka.comments?.length || 0} Comments
                    </button>
                  </div>

                  {/* Comments Section */}
                  {expandedSloka === sloka.id && (
                    <div className="pt-4 border-t-2 border-stone-200">
                      <h4 className="font-bold text-stone-800 mb-3">Comments</h4>
                      
                      {/* Add Comment */}
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={commentText[sloka.id] || ''}
                          onChange={(e) => setCommentText({ ...commentText, [sloka.id]: e.target.value })}
                          placeholder="Add a comment..."
                          className="flex-1 px-4 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(sloka.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddComment(sloka.id);
                          }}
                          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-all"
                        >
                          Post
                        </button>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-3">
                        {sloka.comments && Object.values(sloka.comments).map((comment: any) => (
                          <div key={comment.id} className="bg-stone-50 rounded-lg p-3 border border-stone-200">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-sm text-stone-800">{comment.userName}</span>
                              <span className="text-xs text-stone-500">
                                {new Date(comment.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-stone-700">{comment.text}</p>
                          </div>
                        ))}
                        {(!sloka.comments || Object.keys(sloka.comments).length === 0) && (
                          <p className="text-center text-stone-500 py-4">No comments yet. Be the first to comment!</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl p-12 text-center border-2 border-stone-200">
            <BookOpen className="mx-auto mb-4 text-stone-400" size={64} />
            <p className="text-xl text-stone-600 mb-2">No slokas found</p>
            <p className="text-stone-500">Be the first to add a sloka to the library!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlokasLibrary;
