import React from 'react';
import { UserProfile } from '../types/chat';
import { X, Wifi, WifiOff, User, BookOpen, MapPin, Calendar, MessageCircle } from 'lucide-react';

interface UserProfileModalProps {
  profile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onStartChat?: (userId: string) => void;
  showChatButton?: boolean;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onStartChat,
  showChatButton = true,
}) => {
  if (!isOpen || !profile) return null;

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-4 sm:p-4 pt-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border-2 border-orange-200 animate-scale-in overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col my-4 sm:my-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative flex items-start justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <User size={28} />
              Devotee Profile
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
            >
              <X size={24} className="text-white" />
            </button>
          </div>

          {/* Profile Photo & Name */}
          <div className="relative flex flex-col items-center">
            <div className="relative mb-3">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white/30">
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.userName || 'User'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-orange-600">
                    {profile.userName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              {/* Online Indicator */}
              <div
                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${
                  profile.isOnline ? 'bg-green-500' : 'bg-stone-400'
                }`}
              />
            </div>

            <h3 className="text-2xl font-bold text-white text-center mb-1">
              {profile.userName || 'Unknown User'}
            </h3>
            {(profile.showLastSeen !== false) && (
              <p className="text-orange-100 text-sm font-medium flex items-center gap-1">
                {profile.isOnline ? (
                  <>
                    <Wifi size={14} />
                    Online
                  </>
                ) : (
                  <>
                    <WifiOff size={14} />
                    Last seen {getTimeAgo(profile.lastSeen)}
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Bio */}
          {profile.bio && (
            <div>
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                <BookOpen size={14} />
                About
              </h4>
              <p className="text-stone-700 text-base leading-relaxed italic bg-orange-50 p-4 rounded-lg border border-orange-100">
                "{profile.bio}"
              </p>
            </div>
          )}

          {/* Spiritual Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-3">
              Spiritual Information
            </h4>

            {(profile.showGuruName !== false) && (
              <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
                  Spiritual Guide
                </p>
                <p className="text-base font-semibold text-stone-900">
                  {profile.guruName && profile.guruName.toLowerCase() !== 'n/a' ? profile.guruName : 'Not specified'}
                </p>
              </div>
            )}

            {(profile.showIskconCenter !== false) && (
              <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1 flex items-center gap-2">
                  <MapPin size={14} />
                  ISKCON Center
                </p>
                <p className="text-base font-semibold text-stone-900">
                  {profile.iskconCenter && profile.iskconCenter.toLowerCase() !== 'n/a' ? profile.iskconCenter : 'Not specified'}
                </p>
              </div>
            )}

            {(profile.showGuruName === false && profile.showIskconCenter === false) && (
              <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 text-center">
                <p className="text-sm text-stone-500 italic">This devotee has chosen to keep spiritual information private</p>
              </div>
            )}
          </div>

          {/* Member Since */}
          {profile.createdAt && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Calendar size={14} />
                Member Since
              </h4>
              <p className="text-base font-semibold text-stone-700">{formatDate(profile.createdAt)}</p>
            </div>
          )}
        </div>

        {/* Footer - Chat Button */}
        {showChatButton && onStartChat && (
          <div className="p-4 border-t border-stone-200 bg-stone-50 flex-shrink-0">
            <button
              onClick={() => {
                onStartChat(profile.uid);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3 px-4 rounded-xl text-base font-bold hover:from-orange-700 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <MessageCircle size={20} />
              Start Conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;
