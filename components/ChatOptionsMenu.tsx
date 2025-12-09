import React, { useState } from 'react';
import { Trash2, Archive, Bell, BellOff, UserX, Download, MoreVertical, X } from 'lucide-react';

interface ChatOptionsMenuProps {
  chatId: string;
  otherUserId: string;
  otherUserName: string;
  isOpen: boolean;
  onClose: () => void;
  onClearChat: () => void;
  onDeleteChat: () => void;
  onRemoveConnection: () => void;
  onExportChat: () => void;
}

const ChatOptionsMenu: React.FC<ChatOptionsMenuProps> = ({
  chatId,
  otherUserId,
  otherUserName,
  isOpen,
  onClose,
  onClearChat,
  onDeleteChat,
  onRemoveConnection,
  onExportChat,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  if (!isOpen) return null;

  const handleClearChat = () => {
    if (confirm(`Clear all messages with ${otherUserName}? This cannot be undone.`)) {
      onClearChat();
      onClose();
    }
  };

  const handleDeleteChat = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDeleteChat();
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleRemoveConnection = () => {
    setShowRemoveConfirm(true);
  };

  const confirmRemove = () => {
    onRemoveConnection();
    setShowRemoveConfirm(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl border-2 border-stone-200 w-[90vw] max-w-md animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 rounded-t-xl flex items-center justify-between">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <MoreVertical size={20} />
            Chat Options
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Options List */}
        <div className="p-2">
          {/* Export Chat */}
          <button
            onClick={() => {
              onExportChat();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-4 hover:bg-green-50 rounded-xl transition-all text-left group"
          >
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-all">
              <Download size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-bold text-stone-800">Export Chat</p>
              <p className="text-xs text-stone-600">Download chat history as text file</p>
            </div>
          </button>

          {/* Clear Chat */}
          <button
            onClick={handleClearChat}
            className="w-full flex items-center gap-3 p-4 hover:bg-yellow-50 rounded-xl transition-all text-left group"
          >
            <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-all">
              <Archive size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="font-bold text-stone-800">Clear Messages</p>
              <p className="text-xs text-stone-600">Delete all messages in this chat</p>
            </div>
          </button>

          {/* Remove Connection */}
          <button
            onClick={handleRemoveConnection}
            className="w-full flex items-center gap-3 p-4 hover:bg-orange-50 rounded-xl transition-all text-left group"
          >
            <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-all">
              <UserX size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="font-bold text-stone-800">Remove Connection</p>
              <p className="text-xs text-stone-600">Disconnect from {otherUserName}</p>
            </div>
          </button>

          {/* Delete Chat */}
          <button
            onClick={handleDeleteChat}
            className="w-full flex items-center gap-3 p-4 hover:bg-red-50 rounded-xl transition-all text-left group"
          >
            <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-all">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <div>
              <p className="font-bold text-stone-800">Delete Chat</p>
              <p className="text-xs text-stone-600">Permanently delete this conversation</p>
            </div>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-2 border-red-400 animate-scale-in">
            <div className="bg-gradient-to-r from-red-600 to-rose-600 p-4 rounded-t-xl">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Trash2 size={20} />
                Delete Chat?
              </h3>
            </div>
            <div className="p-6">
              <p className="text-stone-700 mb-4">
                Are you sure you want to permanently delete this chat with <strong>{otherUserName}</strong>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-800 font-bold py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Connection Confirmation */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-2 border-orange-400 animate-scale-in">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 rounded-t-xl">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <UserX size={20} />
                Remove Connection?
              </h3>
            </div>
            <div className="p-6">
              <p className="text-stone-700 mb-4">
                Remove <strong>{otherUserName}</strong> from your connections? You can send another connection request later.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmRemove}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-all"
                >
                  Remove
                </button>
                <button
                  onClick={() => setShowRemoveConfirm(false)}
                  className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-800 font-bold py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatOptionsMenu;
