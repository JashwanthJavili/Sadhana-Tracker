import React, { useState } from 'react';
import { X, BookOpen, Tag, FileText, Languages, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { submitSlokaRequest } from '../services/requests';

interface SlokaRequestFormProps {
  onClose: () => void;
}

export default function SlokaRequestForm({ onClose }: SlokaRequestFormProps) {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    sanskrit: '',
    translation: '', // This will be "Bhav" (Meaning)
    category: '',
    purport: '',
  });

  const categories = [
    'Bhagavad Gita',
    'Srimad Bhagavatam',
    'Sri Isopanisad',
    'Prayers',
    'Mantras',
    'Other Scriptures',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || user.uid === 'guest') {
      showError('Please login to submit a request');
      return;
    }

    // Validation
    if (!formData.title.trim()) {
      showError('Please enter sloka title');
      return;
    }
    if (!formData.category) {
      showError('Please select a category');
      return;
    }
    if (!formData.sanskrit.trim()) {
      showError('Please enter the sloka text');
      return;
    }
    if (!formData.translation.trim()) {
      showError('Please enter Bhav (meaning)');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitSlokaRequest({
        title: formData.title.trim(),
        sanskrit: formData.sanskrit.trim(),
        transliteration: '', // Not required anymore
        translation: formData.translation.trim(),
        category: formData.category,
        purport: formData.purport.trim(),
        reference: '',
        requesterId: user.uid,
        requesterName: user.displayName || 'Anonymous',
        requesterEmail: user.email || '',
      });

      showSuccess('Sloka request submitted successfully! Admins will review it soon.');
      onClose();
    } catch (error) {
      console.error('Error submitting sloka request:', error);
      showError('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto pt-20">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Sloka/Mantra</h2>
              <p className="text-sm text-gray-500">Share sacred verses with devotees</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              🙏 Dear Mataji/Prabhuji, kindly share the sloka/mantra here. Please ensure the accuracy of Sanskrit text and translations. We will review and verify it for the spiritual benefit of all devotees. Thank you for enriching our library! Hare Krishna 🌺
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., Maha Mantra"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sloka Text (Sanskrit) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sloka <span className="text-red-500">*</span>
            </label>
            <textarea
              name="sanskrit"
              value={formData.sanskrit}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none font-sanskrit"
              placeholder="हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे..."
              required
            />
          </div>

          {/* Bhav (Meaning) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bhav (Meaning) <span className="text-red-500">*</span>
            </label>
            <textarea
              name="translation"
              value={formData.translation}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Explain the meaning of this sloka..."
              required
            />
          </div>

          {/* Purport (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purport <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              name="purport"
              value={formData.purport}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Add detailed explanation or purport if available..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all font-medium shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Add Sloka'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
