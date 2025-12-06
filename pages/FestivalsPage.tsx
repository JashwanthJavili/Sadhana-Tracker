import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { ref, set, get, push, remove } from 'firebase/database';
import { Calendar, Plus, X, Search, Heart, ExternalLink, Users, Trash2, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { translateText, SUPPORTED_LANGUAGES } from '../services/translator';

interface Festival {
  id: string;
  name: string;
  date: string;
  shortDescription: string;
  fullDescription?: string;
  significance?: string;
  offerings?: string[];
  observances?: string[];
  addedBy: string;
  addedByName: string;
  timestamp: number;
  likes: number;
  likedBy: string[];
}

const FestivalsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [translating, setTranslating] = useState<{ [key: string]: boolean }>({});
  const [translations, setTranslations] = useState<{ [key: string]: { name: string; description: string } }>({});
  const [selectedLang, setSelectedLang] = useState<{ [key: string]: string }>({});
  const [showTranslateModal, setShowTranslateModal] = useState<{ [key: string]: boolean }>({});
  const [expandedFestivals, setExpandedFestivals] = useState<{ [key: string]: boolean }>({});
  const [newFestival, setNewFestival] = useState({
    name: '',
    date: '',
    shortDescription: '',
    fullDescription: '',
    significance: '',
    offerings: '',
    observances: ''
  });

  useEffect(() => {
    loadFestivals();
  }, []);

  const loadFestivals = async () => {
    try {
      const festivalsRef = ref(db, 'festivals');
      const snapshot = await get(festivalsRef);
      if (snapshot.exists()) {
        const festivalsData: Festival[] = [];
        snapshot.forEach((child) => {
          festivalsData.push({ id: child.key!, ...child.val() });
        });
        setFestivals(festivalsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      }
    } catch (error) {
      console.error('Error loading festivals:', error);
    }
  };

  const handleAddFestival = async () => {
    if (!user || user.uid === 'guest') {
      alert('Please sign in to add festivals');
      return;
    }

    if (!newFestival.name || !newFestival.date || !newFestival.shortDescription) {
      alert('Please fill in required fields: Name, Date, and Short Description');
      return;
    }

    try {
      const festival: Omit<Festival, 'id'> = {
        name: newFestival.name,
        date: newFestival.date,
        shortDescription: newFestival.shortDescription,
        fullDescription: newFestival.fullDescription || '',
        significance: newFestival.significance || '',
        offerings: newFestival.offerings ? newFestival.offerings.split(',').map(s => s.trim()) : [],
        observances: newFestival.observances ? newFestival.observances.split(',').map(s => s.trim()) : [],
        addedBy: user.uid,
        addedByName: user.displayName || 'Anonymous Devotee',
        timestamp: Date.now(),
        likes: 0,
        likedBy: []
      };

      const festivalsRef = ref(db, 'festivals');
      await push(festivalsRef, festival);

      setNewFestival({
        name: '',
        date: '',
        shortDescription: '',
        fullDescription: '',
        significance: '',
        offerings: '',
        observances: ''
      });
      setShowAddModal(false);
      loadFestivals();
      alert('Festival added successfully! 🎉');
    } catch (error) {
      console.error('Error adding festival:', error);
      alert('Failed to add festival');
    }
  };

  const handleLike = async (festivalId: string) => {
    if (!user || user.uid === 'guest') return;

    try {
      const festival = festivals.find(f => f.id === festivalId);
      if (!festival) return;

      const isLiked = festival.likedBy?.includes(user.uid);
      const festivalRef = ref(db, `festivals/${festivalId}`);

      if (isLiked) {
        await set(festivalRef, {
          ...festival,
          likes: Math.max(0, festival.likes - 1),
          likedBy: festival.likedBy.filter(uid => uid !== user.uid)
        });
      } else {
        await set(festivalRef, {
          ...festival,
          likes: festival.likes + 1,
          likedBy: [...(festival.likedBy || []), user.uid]
        });
      }

      loadFestivals();
    } catch (error) {
      console.error('Error liking festival:', error);
    }
  };

  const handleDelete = async (festivalId: string) => {
    if (!user || user.uid === 'guest') return;

    const festival = festivals.find(f => f.id === festivalId);
    if (!festival || festival.addedBy !== user.uid) {
      alert('You can only delete festivals you added');
      return;
    }

    if (!confirm('Are you sure you want to delete this festival?')) return;

    try {
      const festivalRef = ref(db, `festivals/${festivalId}`);
      await remove(festivalRef);
      loadFestivals();
      alert('Festival deleted successfully');
    } catch (error) {
      console.error('Error deleting festival:', error);
      alert('Failed to delete festival');
    }
  };

  const handleViewDetails = (festivalId: string) => {
    navigate(`/festival/${festivalId}`);
  };

  const handleTranslate = async (festivalId: string, name: string, description: string) => {
    const lang = selectedLang[festivalId];
    if (!lang) {
      alert('Please select a language first');
      return;
    }

    setTranslating({ ...translating, [festivalId]: true });

    try {
      const translatedName = await translateText(name, lang);
      const translatedDescription = await translateText(description, lang);

      setTranslations({
        ...translations,
        [festivalId]: {
          name: translatedName,
          description: translatedDescription
        }
      });
    } catch (error) {
      console.error('Translation error:', error);
      alert('Failed to translate. Please try again.');
    } finally {
      setTranslating({ ...translating, [festivalId]: false });
    }
  };

  const clearTranslation = (festivalId: string) => {
    const newTranslations = { ...translations };
    delete newTranslations[festivalId];
    setTranslations(newTranslations);
  };

  const filteredFestivals = festivals.filter(festival =>
    festival.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    festival.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    festival.date.includes(searchTerm)
  );

  const upcomingFestivals = filteredFestivals.filter(f => new Date(f.date) >= new Date());
  const pastFestivals = filteredFestivals.filter(f => new Date(f.date) < new Date());

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl p-8 shadow-2xl border-2 border-purple-300">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Calendar size={40} />
              Vaishnava Festivals Calendar
            </h1>
            <p className="text-purple-100 text-lg">
              Sacred celebrations and appearance days of the Supreme Lord and His devotees
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-all shadow-lg"
          >
            <Plus size={20} />
            Add Festival
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-stone-200">
        <div className="flex items-center gap-3">
          <Search className="text-stone-400" size={24} />
          <input
            type="text"
            placeholder="Search festivals by name, date, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-3 border-0 focus:outline-none text-lg"
          />
        </div>
      </div>

      {/* Add Festival Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-stone-800">Add New Festival</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X size={24} className="text-stone-500 hover:text-stone-700" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-2 text-stone-700">Festival Name *</label>
                <input
                  type="text"
                  value={newFestival.name}
                  onChange={(e) => setNewFestival({ ...newFestival, name: e.target.value })}
                  placeholder="e.g., Janmashtami, Gaura Purnima"
                  className="w-full p-3 border-2 border-stone-300 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold mb-2 text-stone-700">Date *</label>
                <input
                  type="date"
                  value={newFestival.date}
                  onChange={(e) => setNewFestival({ ...newFestival, date: e.target.value })}
                  className="w-full p-3 border-2 border-stone-300 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold mb-2 text-stone-700">Short Description *</label>
                <input
                  type="text"
                  value={newFestival.shortDescription}
                  onChange={(e) => setNewFestival({ ...newFestival, shortDescription: e.target.value })}
                  placeholder="Brief description (1-2 sentences)"
                  className="w-full p-3 border-2 border-stone-300 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold mb-2 text-stone-700">Full Description</label>
                <textarea
                  value={newFestival.fullDescription}
                  onChange={(e) => setNewFestival({ ...newFestival, fullDescription: e.target.value })}
                  placeholder="Detailed description of the festival"
                  rows={4}
                  className="w-full p-3 border-2 border-stone-300 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold mb-2 text-stone-700">Spiritual Significance</label>
                <textarea
                  value={newFestival.significance}
                  onChange={(e) => setNewFestival({ ...newFestival, significance: e.target.value })}
                  placeholder="Why this festival is celebrated"
                  rows={3}
                  className="w-full p-3 border-2 border-stone-300 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold mb-2 text-stone-700">Traditional Offerings</label>
                <input
                  type="text"
                  value={newFestival.offerings}
                  onChange={(e) => setNewFestival({ ...newFestival, offerings: e.target.value })}
                  placeholder="Comma-separated: Panchamrita, Fruits, Flowers"
                  className="w-full p-3 border-2 border-stone-300 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold mb-2 text-stone-700">Observances</label>
                <input
                  type="text"
                  value={newFestival.observances}
                  onChange={(e) => setNewFestival({ ...newFestival, observances: e.target.value })}
                  placeholder="Comma-separated: Fasting, Kirtan, Abhishek"
                  className="w-full p-3 border-2 border-stone-300 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={handleAddFestival}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Add Festival
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Festivals */}
      {upcomingFestivals.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-stone-800 mb-4">Upcoming Festivals</h2>
          <div className="grid gap-6">
            {upcomingFestivals.map((festival) => (
              <div
                key={festival.id}
                className="bg-white hover-lift rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-200 shadow-md hover:shadow-xl transition-all"
              >
                {/* Festival Header */}
                <div className="mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-purple-900 mb-2">
                    {translations[festival.id] ? translations[festival.id].name : festival.name}
                  </h3>
                  <p className="text-sm sm:text-base text-purple-700 font-semibold mb-3">
                    {new Date(festival.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm sm:text-base text-stone-700 mb-4">
                    {translations[festival.id] ? translations[festival.id].description : festival.shortDescription}
                  </p>
                </div>

                {/* Always Visible Controls */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(festival.id);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      festival.likedBy?.includes(user?.uid || '') 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white text-red-500 border-2 border-red-500'
                    }`}
                  >
                    <Heart size={16} fill={festival.likedBy?.includes(user?.uid || '') ? 'white' : 'none'} />
                    {festival.likes}
                  </button>

                  {/* Translation Controls */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTranslateModal({ ...showTranslateModal, [festival.id]: !showTranslateModal[festival.id] });
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 text-green-700 border-2 border-green-300 rounded-lg font-bold hover:bg-green-200 transition-all"
                    title="Translate"
                  >
                    <Languages size={16} />
                    {translations[festival.id] ? 'Change' : 'Translate'}
                  </button>
                  {translations[festival.id] && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearTranslation(festival.id);
                      }}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-200 transition-all"
                    >
                      Original
                    </button>
                  )}

                  {/* View Details Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(festival.id);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
                    title="View full details"
                  >
                    <ExternalLink size={16} />
                    Details
                  </button>

                  {festival.addedBy === user?.uid && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(festival.id);
                      }}
                      className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Translation Modal */}
                {showTranslateModal[festival.id] && (
                  <div 
                    className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-3 border-2 border-green-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={selectedLang[festival.id] || ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          setSelectedLang({ ...selectedLang, [festival.id]: e.target.value });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 min-w-[150px] px-2 py-1 text-sm border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none bg-white"
                      >
                        <option value="">Select Language</option>
                        {SUPPORTED_LANGUAGES.map(lang => (
                          <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTranslate(festival.id, festival.name, festival.shortDescription);
                          setShowTranslateModal({ ...showTranslateModal, [festival.id]: false });
                        }}
                        disabled={!selectedLang[festival.id] || translating[festival.id]}
                        className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-bold transition-all"
                      >
                        {translating[festival.id] ? '⏳' : '🌐'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTranslateModal({ ...showTranslateModal, [festival.id]: false });
                        }}
                        className="px-3 py-1 text-sm bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-bold transition-all"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Added By Info */}
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <Users size={16} />
                  <span>Added by {festival.addedByName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Festivals */}
      {pastFestivals.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-stone-800 mb-4">Past Festivals</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {pastFestivals.map((festival) => (
              <div
                key={festival.id}
                className="bg-white rounded-xl p-4 border-2 border-stone-200 hover:border-purple-300 transition-all cursor-pointer opacity-75 hover:opacity-100"
                onClick={() => handleViewDetails(festival.id)}
              >
                <h3 className="text-lg font-bold text-stone-800 mb-1">{festival.name}</h3>
                <p className="text-sm text-stone-600 mb-2">
                  {new Date(festival.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-stone-700">{festival.shortDescription}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredFestivals.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-stone-300">
          <Calendar size={48} className="mx-auto text-stone-400 mb-4" />
          <p className="text-stone-500 text-lg">No festivals found. Add the first one!</p>
        </div>
      )}
    </div>
  );
};

export default FestivalsPage;
