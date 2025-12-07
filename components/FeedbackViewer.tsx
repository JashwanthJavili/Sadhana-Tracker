import React, { useState, useEffect } from 'react';
import { MessageCircle, Star, Filter, Search, Calendar, User, Mail, MapPin, Award, CheckCircle, Clock, AlertCircle, Download, X } from 'lucide-react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../services/firebase';

interface Feedback {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  category: string;
  message: string;
  timestamp: number;
  status: 'new' | 'reviewed' | 'resolved';
  language: string;
}

const FeedbackViewer: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    // Listen to all users' feedback from users/{userId}/feedbacks path
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      const feedbackList: Feedback[] = [];
      
      if (usersData) {
        // Iterate through all users
        Object.entries(usersData).forEach(([userId, userData]: [string, any]) => {
          if (userData.feedbacks) {
            // Iterate through each user's feedback
            Object.entries(userData.feedbacks).forEach(([feedbackId, feedback]: [string, any]) => {
              feedbackList.push({
                id: `${userId}_${feedbackId}`,
                userId,
                ...feedback,
              });
            });
          }
        });
        
        // Sort by timestamp (newest first)
        feedbackList.sort((a, b) => b.timestamp - a.timestamp);
        setFeedbacks(feedbackList);
        setFilteredFeedbacks(feedbackList);
      } else {
        setFeedbacks([]);
        setFilteredFeedbacks([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...feedbacks];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(f => 
        f.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(f => f.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(f => f.category === categoryFilter);
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter(f => f.rating === rating);
    }

    setFilteredFeedbacks(filtered);
  }, [feedbacks, searchTerm, statusFilter, categoryFilter, ratingFilter]);

  const updateFeedbackStatus = async (feedbackId: string, newStatus: 'new' | 'reviewed' | 'resolved') => {
    try {
      // feedbackId is in format: userId_feedbackKey
      const [userId, feedbackKey] = feedbackId.split('_');
      const feedbackRef = ref(db, `users/${userId}/feedbacks/${feedbackKey}`);
      await update(feedbackRef, { status: newStatus });
      console.log(`✅ Feedback ${feedbackId} marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating feedback status:', error);
    }
  };

  const exportFeedback = () => {
    const dataStr = JSON.stringify(filteredFeedbacks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedback-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      feature: 'bg-blue-100 text-blue-700 border-blue-300',
      bug: 'bg-red-100 text-red-700 border-red-300',
      general: 'bg-green-100 text-green-700 border-green-300',
      spiritual: 'bg-purple-100 text-purple-700 border-purple-300',
      usability: 'bg-amber-100 text-amber-700 border-amber-300',
      other: 'bg-stone-100 text-stone-700 border-stone-300',
    };
    return colors[category] || colors.other;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case 'reviewed': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return null;
    }
  };

  const stats = {
    total: feedbacks.length,
    new: feedbacks.filter(f => f.status === 'new').length,
    reviewed: feedbacks.filter(f => f.status === 'reviewed').length,
    resolved: feedbacks.filter(f => f.status === 'resolved').length,
    avgRating: feedbacks.length > 0 
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : '0.0',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-stone-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-semibold">Total</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <MessageCircle className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-semibold">New</p>
              <p className="text-3xl font-bold text-green-900">{stats.new}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border-2 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-semibold">Reviewed</p>
              <p className="text-3xl font-bold text-amber-900">{stats.reviewed}</p>
            </div>
            <Clock className="w-10 h-10 text-amber-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-semibold">Resolved</p>
              <p className="text-3xl font-bold text-purple-900">{stats.resolved}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border-2 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-semibold">Avg Rating</p>
              <p className="text-3xl font-bold text-orange-900">{stats.avgRating} ★</p>
            </div>
            <Award className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-stone-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              <Search className="inline w-4 h-4 mr-1" /> Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, message..."
              className="w-full px-4 py-2 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              <Filter className="inline w-4 h-4 mr-1" /> Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Categories</option>
              <option value="feature">Feature Request</option>
              <option value="bug">Bug Report</option>
              <option value="general">General</option>
              <option value="spiritual">Spiritual</option>
              <option value="usability">Usability</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ (5)</option>
              <option value="4">⭐⭐⭐⭐ (4)</option>
              <option value="3">⭐⭐⭐ (3)</option>
              <option value="2">⭐⭐ (2)</option>
              <option value="1">⭐ (1)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-stone-600">
            Showing <span className="font-bold text-orange-600">{filteredFeedbacks.length}</span> of {feedbacks.length} feedback items
          </p>
          <button
            onClick={exportFeedback}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedbacks.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-lg border-2 border-stone-200 text-center">
            <MessageCircle className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-xl text-stone-600 font-semibold">No feedback found</p>
            <p className="text-stone-500 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          filteredFeedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="bg-white p-6 rounded-xl shadow-lg border-2 border-stone-200 hover:border-orange-300 transition-all cursor-pointer"
              onClick={() => setSelectedFeedback(feedback)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-stone-600" />
                      <span className="font-bold text-stone-900">{feedback.userName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <Mail className="w-4 h-4" />
                      {feedback.userEmail}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(feedback.timestamp).toLocaleString()}
                    </div>
                  </div>

                  {/* Rating & Category */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < feedback.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getCategoryColor(feedback.category)}`}>
                      {feedback.category.charAt(0).toUpperCase() + feedback.category.slice(1)}
                    </span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(feedback.status)}
                      <span className="text-sm font-semibold capitalize">{feedback.status}</span>
                    </div>
                  </div>

                  {/* Message Preview */}
                  {feedback.message && (
                    <p className="text-stone-700 leading-relaxed line-clamp-2">
                      {feedback.message}
                    </p>
                  )}
                </div>

                {/* Status Actions */}
                <div className="flex flex-col gap-2">
                  {feedback.status === 'new' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateFeedbackStatus(feedback.id, 'reviewed');
                      }}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg font-semibold transition-colors"
                    >
                      Mark Reviewed
                    </button>
                  )}
                  {feedback.status === 'reviewed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateFeedbackStatus(feedback.id, 'resolved');
                      }}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-semibold transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detailed Feedback Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100000] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 rounded-t-3xl flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Feedback Details</h3>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="text-white w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="space-y-2">
                <p className="text-sm text-stone-600 font-semibold">User Information</p>
                <div className="bg-stone-50 p-4 rounded-lg space-y-2">
                  <p><User className="inline w-4 h-4 mr-2" /><strong>Name:</strong> {selectedFeedback.userName}</p>
                  <p><Mail className="inline w-4 h-4 mr-2" /><strong>Email:</strong> {selectedFeedback.userEmail}</p>
                  <p><Calendar className="inline w-4 h-4 mr-2" /><strong>Date:</strong> {new Date(selectedFeedback.timestamp).toLocaleString()}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <p className="text-sm text-stone-600 font-semibold">Rating</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-8 h-8 ${
                        i < selectedFeedback.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-lg font-bold text-stone-900">
                    {selectedFeedback.rating}/5
                  </span>
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-stone-600 font-semibold">Category</p>
                  <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold border-2 ${getCategoryColor(selectedFeedback.category)}`}>
                    {selectedFeedback.category.charAt(0).toUpperCase() + selectedFeedback.category.slice(1)}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-stone-600 font-semibold">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedFeedback.status)}
                    <span className="font-semibold capitalize">{selectedFeedback.status}</span>
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedFeedback.message && (
                <div className="space-y-2">
                  <p className="text-sm text-stone-600 font-semibold">Message</p>
                  <div className="bg-stone-50 p-4 rounded-lg">
                    <p className="text-stone-900 leading-relaxed whitespace-pre-wrap">
                      {selectedFeedback.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t-2 border-stone-200">
                {selectedFeedback.status === 'new' && (
                  <button
                    onClick={() => {
                      updateFeedbackStatus(selectedFeedback.id, 'reviewed');
                      setSelectedFeedback(null);
                    }}
                    className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Mark as Reviewed
                  </button>
                )}
                {selectedFeedback.status === 'reviewed' && (
                  <button
                    onClick={() => {
                      updateFeedbackStatus(selectedFeedback.id, 'resolved');
                      setSelectedFeedback(null);
                    }}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Mark as Resolved
                  </button>
                )}
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="px-6 py-3 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackViewer;
