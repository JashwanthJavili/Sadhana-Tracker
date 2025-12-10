import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Question } from '../types/questions';
import { getAllQuestions, searchQuestions, upvoteQuestion } from '../services/questions';
import { HelpCircle, Search, Plus, ThumbsUp, MessageCircle, Eye, TrendingUp, Clock, Filter, X } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

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

  const categories: Array<{ value: Question['category'] | 'all'; label: string; emoji?: string }> = [
    { value: 'all', label: 'All Topics' },
    { value: 'spiritual', label: 'Spiritual Guidance' },
    { value: 'sadhana', label: 'Sadhana & Practice' },
    { value: 'scripture', label: 'Scriptural Studies' },
    { value: 'lifestyle', label: 'Devotional Life' },
    { value: 'general', label: 'Community Discussion' },
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
        <LoadingSpinner message="Loading questions..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl border-2 border-orange-400">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1">
            <h2 className="text-lg sm:text-2xl md:text-3xl font-serif font-bold text-white mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 p-1.5 sm:p-3 rounded-lg sm:rounded-xl">
                <HelpCircle className="text-white" size={20} />
              </div>
              Community Q&A
            </h2>
            <p className="text-orange-100 text-xs sm:text-base md:text-lg font-medium">
              Ask questions, share knowledge, help fellow devotees
            </p>
          </div>
          <button
            onClick={() => navigate('/questions/ask')}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-orange-600 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold hover:bg-orange-50 transition-all shadow-lg transform hover:scale-105 active:scale-95 whitespace-nowrap self-start sm:self-center"
          >
            <Plus size={16} className="sm:w-5 sm:h-5" />
            Ask Question
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 border-2 border-stone-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-500 outline-none text-sm sm:text-base font-medium shadow-sm"
          />
        </div>

        {/* Compact Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-2 sm:p-3 rounded-lg border-2 border-stone-200 shadow-sm">
          {/* Category Dropdown - Full width on mobile */}
          <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-2 sm:py-1.5 rounded-md border border-stone-300 flex-1 sm:flex-initial">
            <Filter size={14} className="text-stone-500 flex-shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Question['category'] | 'all')}
              className="text-xs sm:text-sm font-semibold bg-transparent outline-none cursor-pointer text-stone-700 flex-1"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options - Compact Icons */}
          <div className="flex items-center gap-1.5 sm:gap-1 justify-center">
            <span className="text-xs font-semibold text-stone-500 mr-1">Sort:</span>
            {[
              { value: 'recent' as const, icon: Clock, tooltip: 'Recent' },
              { value: 'popular' as const, icon: TrendingUp, tooltip: 'Popular' },
              { value: 'unanswered' as const, icon: HelpCircle, tooltip: 'Unanswered' },
            ].map((sort) => (
              <button
                key={sort.value}
                onClick={() => setSortBy(sort.value)}
                title={sort.tooltip}
                className={`p-2 rounded-md transition-all flex-1 sm:flex-initial ${
                  sortBy === sort.value
                    ? 'bg-orange-100 text-orange-700 border border-orange-300'
                    : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50'
                }`}
              >
                <sort.icon size={14} className="mx-auto" />
              </button>
            ))}
          </div>
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
        <div className="space-y-6">
          {filteredQuestions.map((question) => (
            <div
              key={question.id}
              onClick={() => navigate(`/questions/${question.id}`)}
              className="bg-white rounded-lg sm:rounded-xl border border-stone-200 shadow-md hover:shadow-xl transition-all cursor-pointer hover:border-orange-300 overflow-hidden transform hover:scale-[1.01]"
            >
              <div className="flex gap-2 sm:gap-4 p-3 sm:p-6">
                {/* Voting Section - Compact on mobile */}
                <div className="flex flex-col items-center gap-1 sm:gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => handleUpvote(question.id, e)}
                    className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                      user && question.upvotes?.includes(user.uid)
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-stone-100 text-stone-600 hover:bg-orange-50'
                    }`}
                  >
                    <ThumbsUp size={16} className="sm:w-5 sm:h-5" />
                  </button>
                  <span className="font-bold text-sm sm:text-lg text-stone-900">{question.upvotes?.length || 0}</span>
                </div>

                {/* Question Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2 sm:mb-3">
                    <h3 className="text-base sm:text-xl font-bold text-stone-900 hover:text-orange-600 transition-colors pr-2 break-words">
                      {question.title}
                    </h3>
                    <span className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold border ${getCategoryColor(question.category)} self-start flex-shrink-0`}>
                      {question.category}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 mb-2 sm:mb-3 line-clamp-2 break-words">{question.content}</p>

                  {/* Tags */}
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      {question.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 sm:px-3 py-0.5 sm:py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                      {question.tags.length > 3 && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                          +{question.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Meta Info - Stack on mobile */}
                  <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1 text-xs sm:text-sm text-stone-500">
                    <span className="flex items-center gap-1 flex-shrink-0">
                      <MessageCircle size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{question.answerCount} {question.answerCount === 1 ? 'answer' : 'answers'}</span>
                      <span className="sm:hidden">{question.answerCount}</span>
                    </span>
                    <span className="flex items-center gap-1 flex-shrink-0">
                      <Eye size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{question.viewCount} views</span>
                      <span className="sm:hidden">{question.viewCount}</span>
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="truncate max-w-[150px] sm:max-w-none">
                      <span className="hidden sm:inline">asked by </span>
                      <span className="font-semibold text-stone-700">{question.userName}</span>
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex-shrink-0">{formatTimeAgo(question.timestamp)}</span>
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
