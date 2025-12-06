import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, UserCircle, Sparkles, Heart, BookOpen, TrendingUp, Cloud } from 'lucide-react';

// @ts-ignore
import guruMaharajImage from '../utils/Images/Guru_Maharaj_Feet.jpg';
// @ts-ignore
import guruImage from '../utils/Images/OIP.webp';

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
        setError(`Domain Authorization Error. Please add "${domain}" to: Firebase Console > Authentication > Settings > Authorized Domains.`);
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
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-6 md:gap-8 relative z-10 my-8">
        {/* Left Side - Hero Section */}
        <div className="hidden md:flex flex-col justify-center space-y-6 lg:space-y-8 text-center md:text-left px-4">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <Sparkles className="text-orange-600 w-5 h-5" />
              <span className="text-orange-800 font-semibold text-sm">ॐ Om Namo Bhagavate Vasudevaya</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-orange-900 leading-tight">
              Sadhana<br/>
              <span className="text-amber-700">Lifeforce</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-orange-700 font-medium max-w-md">
              Track your spiritual journey with devotion, discipline, and data-driven insights
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:gap-5">
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-5 lg:p-7 shadow-xl hover:shadow-2xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl p-2 inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="text-orange-600 w-6 h-6 lg:w-8 lg:h-8" />
              </div>
              <h3 className="font-bold text-orange-900 mb-2 text-base lg:text-lg">Daily Planning</h3>
              <p className="text-sm lg:text-base text-orange-700 leading-relaxed">Structured sadhana tracking</p>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-5 lg:p-7 shadow-xl hover:shadow-2xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl p-2 inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="text-orange-600 w-6 h-6 lg:w-8 lg:h-8" />
              </div>
              <h3 className="font-bold text-orange-900 mb-2 text-base lg:text-lg">Progress Analytics</h3>
              <p className="text-sm lg:text-base text-orange-700 leading-relaxed">Visual growth insights</p>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-5 lg:p-7 shadow-xl hover:shadow-2xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl p-2 inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                <Heart className="text-orange-600 w-6 h-6 lg:w-8 lg:h-8" />
              </div>
              <h3 className="font-bold text-orange-900 mb-2 text-base lg:text-lg">Devotional Journal</h3>
              <p className="text-sm lg:text-base text-orange-700 leading-relaxed">Record inner feelings</p>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-5 lg:p-7 shadow-xl hover:shadow-2xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl p-2 inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                <Cloud className="text-orange-600 w-6 h-6 lg:w-8 lg:h-8" />
              </div>
              <h3 className="font-bold text-orange-900 mb-2 text-base lg:text-lg">Cloud Sync</h3>
              <p className="text-sm lg:text-base text-orange-700 leading-relaxed">Access anywhere</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden max-w-2xl mx-auto w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 px-6 py-4 text-center relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
            <div className="relative z-10">
              <div className="md:hidden mb-4">
                <h1 className="text-4xl font-serif font-bold text-white">Sadhana Lifeforce</h1>
              </div>
              <p className="text-orange-50 text-xl md:text-2xl font-bold mb-1">Welcome, Dear Devotee</p>
              <p className="text-orange-100 text-xs md:text-sm font-medium">Begin Your Sacred Journey</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="h-1 w-8 bg-yellow-300 rounded-full"></div>
                <Sparkles className="text-yellow-200 w-4 h-4" />
                <div className="h-1 w-8 bg-yellow-300 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-4">
            {/* Dedication Section with Images */}
            <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl p-5 sm:p-6 border-2 border-orange-200 shadow-inner">
              <div className="text-center space-y-3 sm:space-y-4">
                {/* Sacred Mantra */}
                <div className="mb-2">
                  <p className="text-xl sm:text-2xl font-bold text-orange-800 tracking-wide animate-bounce-soft">
                    ఓం శ్రీ గురవే నమః
                  </p>
                  <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-orange-400 to-transparent mx-auto mt-1"></div>
                </div>

                <div className="flex items-center justify-center gap-5 sm:gap-8 flex-wrap">
                  {/* Gurumaharaj Feet Image */}
                  <div className="group relative transform transition-all duration-500 hover:scale-105 hover:-translate-y-1">
                    <div className="absolute -inset-3 bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition duration-500"></div>
                    <div className="relative bg-white rounded-2xl p-4 shadow-2xl ring-4 ring-orange-300 group-hover:ring-orange-400 transition-all duration-300">
                      <img 
                        src={guruMaharajImage} 
                        alt="HH Radhanath Swamy Maharaj's Divine Lotus Feet" 
                        className="w-36 h-36 sm:w-44 sm:h-44 object-contain rounded-xl"
                      />
                      <div className="mt-3 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white text-sm sm:text-base font-bold py-2.5 px-3 rounded-xl shadow-lg text-center group-hover:shadow-xl transition-shadow duration-300">
                        HH Radhanath Swamy
                      </div>
                    </div>
                  </div>

                  {/* Guru Image */}
                  <div className="group relative transform transition-all duration-500 hover:scale-105 hover:-translate-y-1">
                    <div className="absolute -inset-3 bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition duration-500"></div>
                    <div className="relative bg-white rounded-2xl p-4 shadow-2xl ring-4 ring-orange-300 group-hover:ring-orange-400 transition-all duration-300">
                      <img 
                        src={guruImage} 
                        alt="HG Pranavananda Das Prabhuji" 
                        className="w-36 h-36 sm:w-44 sm:h-44 object-contain rounded-xl"
                      />
                      <div className="mt-3 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white text-sm sm:text-base font-bold py-2.5 px-3 rounded-xl shadow-lg text-center group-hover:shadow-xl transition-shadow duration-300">
                        HG Pranavananda Das
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3 px-2">
                  <div className="h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
                  
                  <p className="text-orange-900 font-serif italic text-sm sm:text-base leading-relaxed font-bold">
                    "This humble attempt is made possible only by the causeless mercy,<br className="hidden sm:inline"/>
                    divine grace, and shelter of my most beloved spiritual masters."
                  </p>
                  
                  <p className="text-amber-900 text-xs sm:text-sm leading-relaxed font-semibold">
                    Whatever I am today is solely by Their divine blessings.<br className="hidden sm:inline"/>
                    I am merely an insignificant servant aspiring to serve Their lotus feet.
                  </p>
                  
                  <p className="text-amber-800 text-sm font-bold bg-amber-100 inline-block px-4 py-2 rounded-full shadow-sm">
                    🙏 Eternally surrendered at Their lotus feet 🙏
                  </p>
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm text-left flex items-start gap-3 border-2 border-red-200 shadow-sm">
                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                <div className="break-words w-full">
                  <p className="font-bold mb-1">Access Error</p>
                  <p className="mb-2">{error}</p>
                  <p className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded mt-2">
                    💡 Tip: Use "Guest Mode" below to bypass this
                  </p>
                </div>
              </div>
            )}

            {/* Login Buttons */}
            <div className="space-y-5">
              <button 
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-4 bg-white border-3 border-orange-300 hover:border-orange-500 hover:bg-orange-50 text-stone-900 font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl group disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.03] active:scale-[0.97] min-h-[56px] focus:outline-none focus:ring-4 focus:ring-orange-300"
              >
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  className="w-7 h-7 group-hover:scale-110 transition-transform duration-300"
                />
                <span className="group-hover:text-orange-700 transition-colors text-lg">
                  {isLoading ? 'Signing in...' : 'Sign in with Google'}
                </span>
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t-2 border-orange-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-5 py-1 text-orange-700 font-bold uppercase tracking-wider shadow-sm rounded-full">Or Quick Access</span>
                </div>
              </div>

              <button 
                onClick={handleGuestLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-4 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-700 hover:via-amber-700 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-[0_20px_50px_rgba(234,88,12,0.4)] transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] focus:outline-none focus:ring-4 focus:ring-orange-400"
              >
                <UserCircle size={24} className="group-hover:scale-110 transition-transform duration-300" />
                <span className="text-lg">{isLoading ? 'Loading...' : 'Continue as Guest'}</span>
              </button>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-2xl p-5 border-3 border-amber-300 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-2.5 rounded-xl shadow-md flex-shrink-0">
                  <Cloud className="text-amber-700 w-6 h-6" />
                </div>
                <div className="flex-1 text-sm text-amber-900 space-y-2.5">
                  <p className="font-bold text-base text-orange-800 mb-2">Choose Your Path:</p>
                  <p className="leading-relaxed"><strong className="text-orange-700 text-base">🔐 Google Sign-in:</strong> Cloud sync, access from any device, secure backup</p>
                  <p className="leading-relaxed"><strong className="text-orange-700 text-base">👤 Guest Mode:</strong> Quick start, data stored locally on this device only</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 px-6 py-3 text-center border-t-2 border-orange-200">
            <p className="text-orange-800 text-sm font-serif italic font-semibold mb-1">
              "Elevate your consciousness, one sadhana at a time"
            </p>
            <p className="text-xs text-amber-700">
              Hare Krishna Hare Krishna Krishna Krishna Hare Hare<br/>
              Hare Rama Hare Rama Rama Rama Hare Hare
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;