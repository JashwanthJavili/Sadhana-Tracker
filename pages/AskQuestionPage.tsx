import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createQuestion } from '../services/questions';
import { Question } from '../types/questions';
import { ArrowLeft, Save, Tag, Hash } from 'lucide-react';

const AskQuestionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Question['category']>('general');
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories: Array<{ value: Question['category']; label: string; description: string }> = [
    { value: 'spiritual', label: 'Spiritual Guidance', description: 'Devotional practices, meditation, and prayer guidance' },
    { value: 'sadhana', label: 'Sadhana & Practice', description: 'Daily spiritual practices and routines' },
    { value: 'scripture', label: 'Scriptural Studies', description: 'Study of Bhagavad Gita, Srimad Bhagavatam, and Vedic texts' },
    { value: 'lifestyle', label: 'Devotional Life', description: 'Living a conscious, devotional lifestyle' },
    { value: 'general', label: 'Community Discussion', description: 'General spiritual discussions and topics' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !title.trim() || !content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 5); // Limit to 5 tags

      const questionId = await createQuestion(
        user.uid,
        user.displayName || 'Anonymous',
        title.trim(),
        content.trim(),
        category,
        tags,
        user.photoURL || undefined
      );

      navigate(`/questions/${questionId}`);
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Failed to post question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-2xl border-2 border-orange-400 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/questions')}
            className="p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <ArrowLeft className="text-white" size={24} />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white mb-1 sm:mb-2">Ask a Question</h2>
            <p className="text-orange-100 text-lg font-medium">
              Share your question with the community and get helpful answers
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Title */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border-2 border-stone-200 p-4 sm:p-5 md:p-6">
          <label className="block text-lg font-bold text-stone-900 mb-3">
            Question Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., How to maintain focus during japa meditation?"
            maxLength={200}
            className="w-full p-4 border-2 border-stone-300 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 outline-none text-base font-semibold"
            required
          />
          <p className="text-sm text-stone-500 mt-2">
            {title.length}/200 characters • Be specific and clear
          </p>
        </div>

        {/* Category */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-stone-200 p-6">
          <label className="block text-lg font-bold text-stone-900 mb-3">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  category === cat.value
                    ? 'border-orange-600 bg-orange-50 ring-2 ring-orange-200'
                    : 'border-stone-200 hover:border-orange-300 bg-white'
                }`}
              >
                <div className="mb-1">
                  <span className="font-bold text-stone-900 text-lg">{cat.label}</span>
                </div>
                <p className="text-sm text-stone-600">{cat.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-stone-200 p-6">
          <label className="block text-lg font-bold text-stone-900 mb-3">
            Question Details <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Provide details about your question. Include what you've tried, what challenges you're facing, and what kind of guidance you're seeking..."
            rows={8}
            className="w-full p-4 border-2 border-stone-300 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 outline-none text-base resize-none"
            required
          />
          <p className="text-sm text-stone-500 mt-2">
            {content.length} characters • Be descriptive and provide context
          </p>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-stone-200 p-6">
          <label className="block text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
            <Hash size={20} />
            Tags (Optional)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="meditation, japa, focus, concentration (comma-separated, max 5)"
            className="w-full p-4 border-2 border-stone-300 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 outline-none text-base font-semibold"
          />
          <p className="text-sm text-stone-500 mt-2">
            Add up to 5 tags separated by commas to help others find your question
          </p>
          {tagsInput && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tagsInput.split(',').filter(t => t.trim()).slice(0, 5).map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Guidelines */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6">
          <h3 className="font-bold text-stone-900 mb-3">💡 Tips for asking great questions:</h3>
          <ul className="space-y-2 text-sm text-stone-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Be specific and clear in your question title</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Provide context and details about your situation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Choose the most appropriate category</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Use tags to make your question easier to find</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Be respectful and open to different perspectives</span>
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/questions')}
            className="flex-1 px-6 py-4 border-2 border-stone-300 text-stone-700 rounded-xl font-bold hover:bg-stone-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !title.trim() || !content.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-bold hover:from-orange-700 hover:to-amber-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {submitting ? 'Posting...' : 'Post Question'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AskQuestionPage;
