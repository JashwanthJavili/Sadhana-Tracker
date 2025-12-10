import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, UserCircle } from 'lucide-react';

// @ts-ignore
import guruMaharajImage from '../utils/Images/Guru_Maharaj_Feet.jpg';
// @ts-ignore
import guruImage from '../utils/Images/OIP.webp';
// @ts-ignore
import iskconLogo from '../utils/Images/Iscon_LOgo-removebg-preview.png';

const Login: React.FC = () => {
  const { signInWithGoogle, loginAsGuest } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        setError(`Domain Authorization Error. Please add "${domain}" to Firebase Console.`);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled.');
      } else {
        setError(err.message || 'Failed to sign in.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    await loginAsGuest();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100" style={{backgroundSize: '200% 200%', animation: 'gradient-shift 15s ease infinite'}}></div>
      
      {/* Spiritual Falling Om Symbols */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute text-orange-300 opacity-20 font-bold"
            style={{
              left: `${Math.random() * 100}%`,
              fontSize: `${20 + Math.random() * 20}px`,
              animation: `fall-down ${10 + Math.random() * 15}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          >
            ॐ
          </div>
        ))}
      </div>
      
      {/* Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Single Centered Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-200">
          
          {/* Compact Header - Like Mantras Page */}
          <div className="bg-gradient-to-br from-orange-600 via-amber-600 to-orange-500 p-4 sm:p-5 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
            
            <div className="relative z-10 space-y-2">
              {/* ISKCON Logo - Smaller */}
              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-xl shadow-lg">
                  <img 
                    src={iskconLogo} 
                    alt="ISKCON Logo" 
                    className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                  />
                </div>
              </div>

              {/* Om Mantra */}
              <p className="text-white text-sm sm:text-base font-bold tracking-wider">
                ॐ Om Namo Bhagavate Vasudevaya
              </p>

              {/* App Name - Smaller */}
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white drop-shadow-lg">
                Sadhana Sang
              </h1>

              {/* Telugu Guru Pranaam */}
              <p className="text-orange-100 text-sm sm:text-base font-semibold tracking-wide">
                ఓం శ్రీ గురవే నమః
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Guru Images */}
            <div className="bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 rounded-2xl p-5 border-2 border-orange-300 shadow-lg">
              <div className="flex items-center justify-center gap-6">
                {[
                  { img: guruMaharajImage, name: 'HH Radhanath Swamy' },
                  { img: guruImage, name: 'HG Pranavananda Das' }
                ].map((guru, idx) => (
                <div key={idx} className="group text-center">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                    <div className="relative bg-white rounded-xl p-2 shadow-lg ring-1 ring-orange-200 group-hover:ring-orange-400 transition">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg overflow-hidden">
                        <img 
                          src={guru.img} 
                          alt={guru.name} 
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] sm:text-xs font-bold text-orange-800 leading-tight">
                    {guru.name}
                  </p>
                </div>
              ))}
              </div>
            </div>

            {/* Humble Dedication */}
            <div className="bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 rounded-2xl p-5 border-2 border-amber-300 shadow-lg">
              <div className="text-center space-y-3">
                <div className="h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>
                <p className="text-orange-900 font-serif italic text-xs sm:text-sm leading-relaxed font-semibold">
                This website is humbly dedicated at the divine lotus feet of my most beloved spiritual masters. 
                Whatever little service is offered here is only by Their infinite mercy and grace.
              </p>
                <p className="text-amber-800 text-xs font-bold">
                  🙏 Your most insignificant servant 🙏
                </p>
                <div className="h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="shrink-0 text-red-600 mt-0.5" size={18} />
                  <div className="flex-1">
                    <p className="font-bold text-red-900 text-sm mb-1">Access Error</p>
                    <p className="text-red-700 text-xs">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Buttons */}
            <div className="space-y-3">
              <button 
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50 text-stone-900 font-bold py-3.5 px-5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-orange-300 group"
              >
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  className="w-6 h-6 group-hover:scale-110 transition-transform"
                />
                <span className="text-base sm:text-lg">
                  {isLoading ? 'Signing in...' : 'Sign in with Google'}
                </span>
              </button>

              {/* Guest Mode - Small Icon Button */}
              <div className="flex justify-center">
                <button 
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-stone-100 to-stone-200 hover:from-stone-200 hover:to-stone-300 text-stone-700 hover:text-stone-900 font-semibold py-2 px-4 rounded-full transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-stone-400 group text-sm border border-stone-300"
                  title="Try as Guest"
                >
                  <UserCircle size={16} className="group-hover:scale-110 transition-transform" />
                  <span className="text-xs sm:text-sm">
                    {isLoading ? 'Loading...' : 'Try as Guest'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-orange-100 via-amber-100 to-orange-100 px-4 py-3 text-center border-t-2 border-orange-300">
            <p className="text-orange-900 text-sm font-serif italic font-semibold">
              "Hare Krishna • Hare Rama"
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fall-down {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
