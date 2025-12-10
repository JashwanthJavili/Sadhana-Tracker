import React, { useEffect, useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NamaskarGreeting: React.FC = () => {
  const { user } = useAuth();
  const [showGreeting, setShowGreeting] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Check if this is a new user (account created recently or first time visiting)
    const userCreatedAt = user.metadata?.creationTime;
    const now = new Date();
    const isRecentlyCreated = userCreatedAt && (now.getTime() - new Date(userCreatedAt).getTime()) < 5 * 60 * 1000; // 5 minutes
    
    // Check localStorage for "has seen namaskar"
    const hasSeenNamaskar = localStorage.getItem(`namaskar_seen_${user.uid}`);
    
    if (isRecentlyCreated && !hasSeenNamaskar) {
      setIsNewUser(true);
      // Show greeting after 1 second delay
      const timer = setTimeout(() => {
        setShowGreeting(true);
        setAnimate(true);
        localStorage.setItem(`namaskar_seen_${user.uid}`, 'true');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(() => setShowGreeting(false), 300);
  };

  if (!showGreeting || !isNewUser) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Greeting Card - Fully Responsive */}
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-500 w-[95%] sm:w-full max-w-sm ${animate ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}
      >
        <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 rounded-2xl sm:rounded-3xl shadow-2xl border-3 sm:border-4 border-orange-300 mx-auto overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-40 h-40 bg-orange-200 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-200 rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-orange-200/50 rounded-full transition-colors z-10"
          >
            <X size={18} className="text-orange-700 sm:w-5 sm:h-5" />
          </button>

          {/* Content with proper padding */}
          <div className="relative z-10 text-center space-y-3 sm:space-y-4 p-6 sm:p-8">
            {/* Monk emoji with animation */}
            <div className="text-6xl sm:text-8xl animate-bounce-slow inline-block">
              🙏
            </div>

            {/* Main greeting */}
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-800 font-serif">
                नमस्कार
              </h1>
              <p className="text-base sm:text-lg text-orange-700 font-semibold">Namaskar</p>
            </div>

            {/* Respectful message */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-orange-200 space-y-2 sm:space-y-3">
              <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                Welcome to <span className="font-bold text-orange-700">Sadhana Sang</span>
              </p>
              <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">
                We are honored by your presence. Your spiritual journey is precious to us.
              </p>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                Let's grow in devotion together with sincere hearts.
              </p>
            </div>

            {/* Closing verse */}
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-orange-200">
              <p className="text-xs sm:text-sm text-orange-900 italic font-serif">
                "Your presence brings joy to our community."
              </p>
            </div>

            {/* Mantra */}
            <div className="space-y-0.5 pt-1 sm:pt-2">
              <p className="text-xs sm:text-sm text-stone-600 font-medium">हरे कृष्ण हरे कृष्ण</p>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">Hare Krishna, Hare Krishna</p>
            </div>

            {/* Call to action */}
            <button
              onClick={handleClose}
              className="mt-4 sm:mt-6 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-full font-bold text-sm hover:from-orange-700 hover:to-amber-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 w-full"
            >
              Begin Your Journey
              <ArrowRight size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
      `}</style>
    </>
  );
};

export default NamaskarGreeting;
