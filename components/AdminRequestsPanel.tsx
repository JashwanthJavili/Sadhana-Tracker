import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, Send, Check, X, MessageSquare, Trash2, Eye } from 'lucide-react';
import {
  getAllFestivalRequests,
  getAllSlokaRequests,
  reviewFestivalRequest,
  reviewSlokaRequest,
  FestivalRequest,
  SlokaRequest,
} from '../services/requests';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function AdminRequestsPanel() {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState<'festivals' | 'slokas'>('festivals');
  const [festivalRequests, setFestivalRequests] = useState<FestivalRequest[]>([]);
  const [slokaRequests, setSlokaRequests] = useState<SlokaRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const festivalUnsubscribe = getAllFestivalRequests((requests) => {
      setFestivalRequests(requests);
    });

    const slokaUnsubscribe = getAllSlokaRequests((requests) => {
      setSlokaRequests(requests);
    });

    return () => {
      festivalUnsubscribe();
      slokaUnsubscribe();
    };
  }, []);

  const handleReviewFestival = async (requestId: string, status: 'approved' | 'rejected') => {
    if (!user) return;
    if (!adminComment.trim() && status === 'rejected') {
      showError('Please provide a comment for rejection');
      return;
    }

    setIsProcessing(true);
    try {
      await reviewFestivalRequest(
        requestId,
        status,
        adminComment.trim(),
        user.uid,
        user.displayName || user.email || 'Admin'
      );
      showSuccess(
        `Festival request ${status === 'approved' ? 'approved and published' : 'rejected'}!`
      );
      setAdminComment('');
      setExpandedRequest(null);
    } catch (error) {
      console.error('Error reviewing festival:', error);
      showError('Failed to process request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReviewSloka = async (requestId: string, status: 'approved' | 'rejected') => {
    if (!user) return;
    if (!adminComment.trim() && status === 'rejected') {
      showError('Please provide a comment for rejection');
      return;
    }

    setIsProcessing(true);
    try {
      await reviewSlokaRequest(
        requestId,
        status,
        adminComment.trim(),
        user.uid,
        user.displayName || user.email || 'Admin'
      );
      showSuccess(
        `Sloka request ${status === 'approved' ? 'approved and published' : 'rejected'}!`
      );
      setAdminComment('');
      setExpandedRequest(null);
    } catch (error) {
      console.error('Error reviewing sloka:', error);
      showError('Failed to process request');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredFestivalRequests = festivalRequests.filter((req) =>
    statusFilter === 'all' ? true : req.status === statusFilter
  );

  const filteredSlokaRequests = slokaRequests.filter((req) =>
    statusFilter === 'all' ? true : req.status === statusFilter
  );

  const pendingFestivalsCount = festivalRequests.filter((r) => r.status === 'pending').length;
  const pendingSlokasCount = slokaRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Content Requests</h1>
        <p className="text-orange-100">Review and approve community contributions</p>
        <div className="flex gap-4 mt-4 text-sm">
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <span className="font-bold">{pendingFestivalsCount}</span> pending festivals
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <span className="font-bold">{pendingSlokasCount}</span> pending slokas
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('festivals')}
          className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'festivals'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <Calendar size={18} />
          Festivals
          {pendingFestivalsCount > 0 && (
            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              {pendingFestivalsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('slokas')}
          className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'slokas'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <BookOpen size={18} />
          Slokas/Mantras
          {pendingSlokasCount > 0 && (
            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              {pendingSlokasCount}
            </span>
          )}
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              statusFilter === status
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Festival Requests */}
      {activeTab === 'festivals' && (
        <div className="space-y-4">
          {filteredFestivalRequests.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
              <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No {statusFilter !== 'all' && statusFilter} festival requests</p>
            </div>
          ) : (
            filteredFestivalRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden"
              >
                {/* Request Header */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{request.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(request.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Requested by {request.requesterName}</span>
                        <span>•</span>
                        <span>{new Date(request.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : request.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {request.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-1">Category:</p>
                      <p className="text-gray-600">{request.category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-1">Description:</p>
                      <p className="text-gray-600">{request.description}</p>
                    </div>
                    {request.significance && (
                      <div>
                        <p className="text-sm font-bold text-gray-700 mb-1">Significance:</p>
                        <p className="text-gray-600">{request.significance}</p>
                      </div>
                    )}
                    {request.observances && (
                      <div>
                        <p className="text-sm font-bold text-gray-700 mb-1">Observances:</p>
                        <p className="text-gray-600">{request.observances}</p>
                      </div>
                    )}
                  </div>

                  {/* Admin Comment Display */}
                  {request.adminComment && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-bold text-blue-900 mb-1">Admin Comment:</p>
                      <p className="text-sm text-blue-800">{request.adminComment}</p>
                      {request.reviewedBy && (
                        <p className="text-xs text-blue-600 mt-2">
                          Reviewed by {request.reviewedBy} on{' '}
                          {new Date(request.reviewedAt!).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {request.status === 'pending' && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admin Comment
                        </label>
                        <textarea
                          value={expandedRequest === request.id ? adminComment : ''}
                          onChange={(e) => {
                            setExpandedRequest(request.id!);
                            setAdminComment(e.target.value);
                          }}
                          placeholder="Add a comment (required for rejection)"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleReviewFestival(request.id!, 'approved')}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check size={18} />
                          Approve & Publish
                        </button>
                        <button
                          onClick={() => handleReviewFestival(request.id!, 'rejected')}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X size={18} />
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sloka Requests */}
      {activeTab === 'slokas' && (
        <div className="space-y-4">
          {filteredSlokaRequests.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No {statusFilter !== 'all' && statusFilter} sloka requests</p>
            </div>
          ) : (
            filteredSlokaRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden"
              >
                {/* Request Header */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{request.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Requested by {request.requesterName}</span>
                        <span>•</span>
                        <span>{new Date(request.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : request.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {request.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-1">Category:</p>
                      <p className="text-gray-600">{request.category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-1">Sanskrit:</p>
                      <p className="text-gray-600 font-sanskrit text-lg">{request.sanskrit}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-1">Transliteration:</p>
                      <p className="text-gray-600 italic">{request.transliteration}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-1">Translation:</p>
                      <p className="text-gray-600">{request.translation}</p>
                    </div>
                    {request.purport && (
                      <div>
                        <p className="text-sm font-bold text-gray-700 mb-1">Purport:</p>
                        <p className="text-gray-600">{request.purport}</p>
                      </div>
                    )}
                    {request.reference && (
                      <div>
                        <p className="text-sm font-bold text-gray-700 mb-1">Reference:</p>
                        <p className="text-gray-600">{request.reference}</p>
                      </div>
                    )}
                  </div>

                  {/* Admin Comment Display */}
                  {request.adminComment && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-bold text-blue-900 mb-1">Admin Comment:</p>
                      <p className="text-sm text-blue-800">{request.adminComment}</p>
                      {request.reviewedBy && (
                        <p className="text-xs text-blue-600 mt-2">
                          Reviewed by {request.reviewedBy} on{' '}
                          {new Date(request.reviewedAt!).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {request.status === 'pending' && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admin Comment
                        </label>
                        <textarea
                          value={expandedRequest === request.id ? adminComment : ''}
                          onChange={(e) => {
                            setExpandedRequest(request.id!);
                            setAdminComment(e.target.value);
                          }}
                          placeholder="Add a comment (required for rejection)"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleReviewSloka(request.id!, 'approved')}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check size={18} />
                          Approve & Publish
                        </button>
                        <button
                          onClick={() => handleReviewSloka(request.id!, 'rejected')}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X size={18} />
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
