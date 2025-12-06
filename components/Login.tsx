import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, AlertCircle, UserCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { signInWithGoogle, loginAsGuest } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setError(null);
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
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-8">
        <div className="flex justify-center">
          <div className="bg-orange-100 p-4 rounded-full">
            <Lock className="text-orange-600 w-8 h-8" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-stone-900">Sadhana Lifeforce</h1>
          <p className="text-stone-500">Track your spiritual progress.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm text-left flex items-start gap-3 border border-red-100">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <div className="break-words w-full">
              <p className="font-bold mb-1">Access Error</p>
              <p className="mb-2">{error}</p>
              <p className="text-xs text-red-500">
                Tip: Use "Guest Mode" below to bypass this.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium py-3 px-4 rounded-lg transition-all shadow-sm group"
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              className="w-5 h-5"
            />
            <span className="group-hover:text-orange-700 transition-colors">Sign in with Google</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-stone-500">Or for demo</span>
            </div>
          </div>

          <button 
            onClick={loginAsGuest}
            className="w-full flex items-center justify-center gap-3 bg-stone-900 hover:bg-stone-800 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-lg"
          >
            <UserCircle size={20} />
            <span>Continue as Guest</span>
          </button>
        </div>

        <p className="text-xs text-stone-400">
          Guest data is saved to this device only. <br/>
          Google login syncs data across devices.
        </p>
      </div>
    </div>
  );
};

export default Login;