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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Single Centered Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-200">
          
          {/* Header with Logo and Mantras */}
          <div className="bg-gradient-to-br from-orange-600 via-amber-600 to-orange-500 p-6 sm:p-7 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
            
            <div className="relative z-10 space-y-3">
              {/* ISKCON Logo */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-2xl shadow-xl">
                  <img 
                    src={iskconLogo} 
                    alt="ISKCON Logo" 
                    className="w-16 h-16 object-contain"
                  />
                </div>
              </div>

              {/* Om Mantra */}
              <p className="text-white text-base sm:text-lg font-bold tracking-wider">
                ॐ Om Namo Bhagavate Vasudevaya
              </p>

              {/* App Name */}
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white drop-shadow-lg">
                Sadhana Sanga
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
            <div className="space-y-4">
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

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t-2 border-orange-300" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 py-1 text-orange-600 font-bold text-xs uppercase tracking-wider">Or</span>
                </div>
              </div>

              <button 
                onClick={handleGuestLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-700 hover:via-amber-700 hover:to-orange-600 text-white font-bold py-3.5 px-5 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-orange-400 group"
              >
                <UserCircle size={22} className="group-hover:scale-110 transition-transform" />
                <span className="text-base sm:text-lg">
                  {isLoading ? 'Loading...' : 'Continue as Guest'}
                </span>
              </button>
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
    </div>
  );
};

export default Login;
