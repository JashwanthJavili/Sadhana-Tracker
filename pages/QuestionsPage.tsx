import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Question } from '../types/questions';
import { getAllQuestions, searchQuestions, upvoteQuestion } from '../services/questions';
import { HelpCircle, Search, Plus, ThumbsUp, MessageCircle, Eye, TrendingUp, Clock, Filter, X } from 'lucide-react';

const QuestionsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Question['category'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unanswered'>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories: Array<{ value: Question['category'] | 'all'; label: string; emoji: string }> = [
    { value: 'all', label: 'All Questions', emoji: '📚' },
    { value: 'spiritual', label: 'Spiritual Practice', emoji: '🙏' },
    { value: 'sadhana', label: 'Sadhana', emoji: '📿' },
    { value: 'scripture', label: 'Scripture Study', emoji: '📖' },
    { value: 'lifestyle', label: 'Lifestyle', emoji: '🌱' },
    { value: 'general', label: 'General', emoji: '💬' },
  ];

  useEffect(() => {
    const unsubscribe = getAllQuestions((fetchedQuestions) => {
      setQuestions(fetchedQuestions);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = [...questions];

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        return b.timestamp - a.timestamp;
      } else if (sortBy === 'popular') {
        return (b.upvotes.length + b.viewCount) - (a.upvotes.length + a.viewCount);
      } else { // unanswered
        if (a.answerCount === 0 && b.answerCount > 0) return -1;
        if (a.answerCount > 0 && b.answerCount === 0) return 1;
        return b.timestamp - a.timestamp;
      }
    });

    setFilteredQuestions(filtered);
  }, [questions, searchTerm, selectedCategory, sortBy]);

  const handleUpvote = async (questionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    await upvoteQuestion(questionId, user.uid);
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getCategoryColor = (category: Question['category']) => {
    const colors = {
      spiritual: 'bg-purple-100 text-purple-700 border-purple-300',
      sadhana: 'bg-orange-100 text-orange-700 border-orange-300',
      scripture: 'bg-blue-100 text-blue-700 border-blue-300',
      lifestyle: 'bg-green-100 text-green-700 border-green-300',
      general: 'bg-stone-100 text-stone-700 border-stone-300',
    };
    return colors[category];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
          <p className="text-stone-600 font-medium text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 rounded-2xl p-8 shadow-2xl border-2 border-orange-400">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-serif font-bold text-white mb-2 flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <HelpCircle className="text-white" size={36} />
              </div>
              Community Q&A
            </h2>
            <p className="text-orange-100 text-lg font-medium">
              Ask questions, share knowledge, help fellow devotees
            </p>
          </div>
          <button
            onClick={() => navigate('/questions/ask')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-all shadow-lg transform hover:scale-105 active:scale-95"
          >
            <Plus size={20} />
            Ask Question
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400" size={24} />
          <input
            type="text"
            placeholder="Search questions by title, content, tags, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-4 py-4 border-3 border-stone-300 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 outline-none text-base font-semibold shadow-md"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                selectedCategory === cat.value
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-white border-2 border-stone-200 text-stone-700 hover:border-orange-300'
              }`}
            >
              <span className="mr-2">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-bold text-stone-600">Sort by:</span>
          {[
            { value: 'recent' as const, label: 'Recent', icon: Clock },
            { value: 'popular' as const, label: 'Popular', icon: TrendingUp },
            { value: 'unanswered' as const, label: 'Unanswered', icon: HelpCircle },
          ].map((sort) => (
            <button
              key={sort.value}
              onClick={() => setSortBy(sort.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                sortBy === sort.value
                  ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                  : 'bg-white border-2 border-stone-200 text-stone-600 hover:border-stone-300'
              }`}
            >
              <sort.icon size={16} />
              {sort.label}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-stone-300">
          <HelpCircle className="mx-auto mb-4 text-stone-400" size={64} />
          <p className="text-stone-600 text-lg font-medium mb-2">
            {searchTerm || selectedCategory !== 'all' ? 'No questions found' : 'No questions yet'}
          </p>
          <p className="text-stone-400 mb-4">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Be the first to ask a question!'}
          </p>
          <button
            onClick={() => navigate('/questions/ask')}
            className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-lg font-bold hover:from-orange-700 hover:to-amber-700 transition-all shadow-lg transform hover:scale-105 active:scale-95"
          >
            Ask First Question
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <div
              key={question.id}
              onClick={() => navigate(`/questions/${question.id}`)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-stone-200 hover:border-orange-300 p-6 transform hover:scale-[1.01]"
            >
              <div className="flex gap-4">
                {/* Voting Section */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={(e) => handleUpvote(question.id, e)}
                    className={`p-2 rounded-lg transition-all ${
                      user && question.upvotes?.includes(user.uid)
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-stone-100 text-stone-600 hover:bg-orange-50'
                    }`}
                  >
                    <ThumbsUp size={20} />
                  </button>
                  <span className="font-bold text-lg text-stone-900">{question.upvotes?.length || 0}</span>
                </div>

                {/* Question Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-stone-900 hover:text-orange-600 transition-colors">
                      {question.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getCategoryColor(question.category)}`}>
                      {categories.find(c => c.value === question.category)?.emoji} {question.category}
                    </span>
                  </div>

                  <p className="text-stone-700 mb-3 line-clamp-2">{question.content}</p>

                  {/* Tags */}
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {question.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-sm font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-stone-500">
                    <span className="flex items-center gap-1">
                      <MessageCircle size={16} />
                      {question.answerCount} {question.answerCount === 1 ? 'answer' : 'answers'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={16} />
                      {question.viewCount} views
                    </span>
                    <span>•</span>
                    <span>
                      asked by <span className="font-semibold text-stone-700">{question.userName}</span>
                    </span>
                    <span>•</span>
                    <span>{formatTimeAgo(question.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionsPage;
