import React, { useState } from 'react';
import { X, Calendar, Tag, FileText, Sparkles, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { submitFestivalRequest } from '../services/requests';

interface FestivalRequestFormProps {
  onClose: () => void;
}

export default function FestivalRequestForm({ onClose }: FestivalRequestFormProps) {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    category: '',
    description: '',
    significance: '',
    observances: '',
  });

  const categories = [
    'Lord Krishna',
    'Lord Rama',
    'Lord Narasimha',
    'Radha Rani',
    'Other Deities',
    'Vaishnava Acharyas',
    'Holy Days',
    'Ekadashi',
    'Other',
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
    if (!formData.name.trim()) {
      showError('Please enter festival name');
      return;
    }
    if (!formData.date) {
      showError('Please select a date');
      return;
    }
    if (!formData.category) {
      showError('Please select a category');
      return;
    }
    if (!formData.description.trim()) {
      showError('Please enter a description');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitFestivalRequest({
        name: formData.name.trim(),
        date: formData.date,
        category: formData.category,
        description: formData.description.trim(),
        significance: formData.significance.trim(),
        observances: formData.observances.trim(),
        requesterId: user.uid,
        requesterName: user.displayName || user.email || 'Anonymous',
        requesterEmail: user.email || '',
      });

      showSuccess('Festival request submitted successfully! Admins will review it soon.');
      onClose();
    } catch (error) {
      console.error('Error submitting festival request:', error);
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
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Festival</h2>
              <p className="text-sm text-gray-500">Share a festival with our community</p>
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
              🙏 Dear Mataji/Prabhuji, kindly share the festival details here. For the best devotional experience, we will verify and approve it with care. Thank you for your patience and contribution to our spiritual community! Hare Krishna 🌺
            </p>
          </div>

          {/* Festival Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Festival Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., Janmashtami"
                required
              />
            </div>
          </div>

          {/* Date and Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder="Brief description of the festival..."
                required
              />
            </div>
          </div>

          {/* Significance (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Significance <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <textarea
              name="significance"
              value={formData.significance}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Spiritual significance and importance..."
            />
          </div>

          {/* Observances (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observances <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <textarea
              name="observances"
              value={formData.observances}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="How this festival is observed (fasting, ceremonies, etc.)..."
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
              {isSubmitting ? 'Submitting...' : 'Add Festival'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
