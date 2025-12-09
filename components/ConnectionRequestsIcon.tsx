import React, { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPendingRequests } from '../services/connections';

const ConnectionRequestsIcon: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;

    // Subscribe to pending requests updates
    const unsubscribe = getPendingRequests(user.uid, (requests) => {
      setPendingCount(requests.length);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const handleClick = () => {
    navigate('/connection-requests');
  };

  // Don't render if no pending requests
  if (pendingCount === 0) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className="relative p-2 md:p-3 hover:bg-white/10 md:hover:bg-orange-500/90 md:bg-orange-600 rounded-lg md:rounded-full transition-all active:scale-95 md:shadow-xl md:hover:shadow-2xl md:hover:scale-110"
      aria-label="Connection requests"
      title="Connection Requests"
    >
      <UserPlus size={20} className="text-white" />
      {pendingCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1 shadow-lg border-2 border-white animate-pulse">
          {pendingCount > 9 ? '9+' : pendingCount}
        </span>
      )}
    </button>
  );
};

export default ConnectionRequestsIcon;
