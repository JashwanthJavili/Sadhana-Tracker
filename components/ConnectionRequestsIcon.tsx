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
      className="relative w-14 h-14 bg-gradient-to-r from-orange-600 to-orange-700 rounded-full flex items-center justify-center transition-shadow duration-300 shadow-lg hover:shadow-xl"
      aria-label="Connection requests"
      title="Connection Requests"
    >
      <UserPlus size={24} className="text-white" />
      {pendingCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-6 min-w-[22px] flex items-center justify-center border-2 border-orange-600 shadow-lg">
          {pendingCount > 9 ? '9+' : pendingCount}
        </span>
      )}
    </button>
  );
};

export default ConnectionRequestsIcon;
