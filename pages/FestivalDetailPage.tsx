import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { ref, get } from 'firebase/database';
import { ArrowLeft, Calendar, Heart, Users, BookOpen, Flower2, Star, Languages } from 'lucide-react';
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

const FestivalDetailPage: React.FC = () => {
  const { festivalId } = useParams<{ festivalId: string }>();
  const navigate = useNavigate();
  const [festival, setFestival] = useState<Festival | null>(null);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [selectedLang, setSelectedLang] = useState('');
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<{
    name?: string;
    shortDescription?: string;
    fullDescription?: string;
    significance?: string;
  }>({});

  useEffect(() => {
    loadFestival();
  }, [festivalId]);

  const loadFestival = async () => {
    if (!festivalId) return;

    try {
      const festivalRef = ref(db, `festivals/${festivalId}`);
      const snapshot = await get(festivalRef);
      
      if (snapshot.exists()) {
        setFestival({ id: snapshot.key!, ...snapshot.val() });
      }
    } catch (error) {
      console.error('Error loading festival:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!selectedLang || !festival) {
      alert('Please select a language');
      return;
    }

    setTranslating(true);

    try {
      const translated: any = {};

      if (festival.name) {
        translated.name = await translateText(festival.name, selectedLang);
      }
      if (festival.shortDescription) {
        translated.shortDescription = await translateText(festival.shortDescription, selectedLang);
      }
      if (festival.fullDescription) {
        translated.fullDescription = await translateText(festival.fullDescription, selectedLang);
      }
      if (festival.significance) {
        translated.significance = await translateText(festival.significance, selectedLang);
      }

      setTranslatedContent(translated);
    } catch (error) {
      console.error('Translation error:', error);
      alert('Failed to translate. Please try again.');
    } finally {
      setTranslating(false);
    }
  };

  const clearTranslation = () => {
    setTranslatedContent({});
    setSelectedLang('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
          <p className="text-stone-600 font-medium text-lg">Loading festival details...</p>
        </div>
      </div>
    );
  }

  if (!festival) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-600 text-lg mb-4">Festival not found</p>
        <button
          onClick={() => navigate('/festivals')}
          className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all"
        >
          Back to Festivals
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/festivals')}
        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold transition-all"
      >
        <ArrowLeft size={20} />
        Back to Festivals
      </button>

      {/* Festival Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl p-8 shadow-2xl border-2 border-purple-300 text-white">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3">
              {translatedContent.name || festival.name}
            </h1>
            <p className="text-purple-100 text-lg flex items-center gap-2 mb-2">
              <Calendar size={20} />
              {new Date(festival.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-xl">
              <Heart size={20} fill="white" />
              <span className="font-bold">{festival.likes}</span>
            </div>
          </div>
        </div>
        <p className="text-purple-50 text-lg">
          {translatedContent.shortDescription || festival.shortDescription}
        </p>
      </div>

      {/* Translation Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowTranslateModal(!showTranslateModal)}
          className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 border-2 border-green-300 rounded-lg font-bold hover:bg-green-200 transition-all"
        >
          <Languages size={20} />
          {Object.keys(translatedContent).length > 0 ? 'Change Translation' : 'Translate Festival'}
        </button>
        {Object.keys(translatedContent).length > 0 && (
          <button
            onClick={clearTranslation}
            className="px-4 py-2 bg-gray-100 text-gray-700 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-200 transition-all"
          >
            Show Original
          </button>
        )}
      </div>

      {/* Translation Modal */}
      {showTranslateModal && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 shadow-lg">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Languages size={24} className="text-green-600" />
              <span className="font-bold text-green-800 text-lg">Select Language:</span>
            </div>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none bg-white"
            >
              <option value="">Select Language</option>
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            <button
              onClick={() => {
                handleTranslate();
                setShowTranslateModal(false);
              }}
              disabled={!selectedLang || translating}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-bold transition-all flex items-center gap-2"
            >
              {translating ? '⏳ Translating...' : '🌐 Translate All'}
            </button>
            <button
              onClick={() => setShowTranslateModal(false)}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-bold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Full Description */}
      {festival.fullDescription && (
        <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-purple-200">
          <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-3">
            <BookOpen className="text-purple-600" size={28} />
            About This Festival
          </h2>
          <p className="text-stone-700 text-lg leading-relaxed whitespace-pre-line">
            {translatedContent.fullDescription || festival.fullDescription}
          </p>
        </div>
      )}

      {/* Spiritual Significance */}
      {festival.significance && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 shadow-xl border-2 border-yellow-300">
          <h2 className="text-2xl font-bold text-orange-900 mb-4 flex items-center gap-3">
            <Star className="text-yellow-600" size={28} />
            Spiritual Significance
          </h2>
          <p className="text-orange-900 text-lg leading-relaxed whitespace-pre-line italic">
            {translatedContent.significance || festival.significance}
          </p>
        </div>
      )}

      {/* Offerings */}
      {festival.offerings && festival.offerings.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-xl border-2 border-green-300">
          <h2 className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-3">
            <Flower2 className="text-green-600" size={28} />
            Traditional Offerings
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {festival.offerings.map((offering, index) => (
              <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-green-200">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-stone-800 font-semibold">{offering}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observances */}
      {festival.observances && festival.observances.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-xl border-2 border-blue-300">
          <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-3">
            <Calendar className="text-blue-600" size={28} />
            How to Observe
          </h2>
          <div className="space-y-3">
            {festival.observances.map((observance, index) => (
              <div key={index} className="flex items-start gap-3 bg-white p-4 rounded-xl border-2 border-blue-200">
                <div className="mt-1.5 w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-stone-800 font-semibold flex-1">{observance}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Added By */}
      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
        <div className="flex items-center gap-2 text-stone-600">
          <Users size={16} />
          <span className="text-sm">
            Added by <strong>{festival.addedByName}</strong> on {new Date(festival.timestamp).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FestivalDetailPage;
