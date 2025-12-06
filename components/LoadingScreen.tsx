import React from 'react';

// @ts-ignore
import guruMaharajImage from '../utils/Images/Guru_Maharaj_Feet.jpg';

const LoadingScreen: React.FC = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-8 p-8">
        {/* Sacred Mantra */}
        <div className="text-center mb-4 animate-fadeIn">
          <p className="text-4xl md:text-5xl font-bold text-orange-800 tracking-wide animate-bounce-soft mb-4">
            ఓం శ్రీ గురవే నమః
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-orange-400 to-transparent mx-auto"></div>
        </div>

        {/* Gurumaharaj Feet Image */}
        <div className="group relative animate-fadeIn" style={{animationDelay: '0.3s'}}>
          <div className="absolute -inset-4 bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
          <div className="relative bg-white rounded-3xl p-6 shadow-2xl ring-4 ring-orange-300">
            <img 
              src={guruMaharajImage} 
              alt="HH Radhanath Swamy" 
              className="w-48 h-48 md:w-56 md:h-56 object-contain rounded-2xl"
            />
            <div className="mt-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-base md:text-lg font-bold py-3 px-4 rounded-xl shadow-lg text-center">
              HH Radhanath Swamy
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-3 animate-fadeIn" style={{animationDelay: '0.6s'}}>
          <p className="text-orange-900 font-serif italic text-xl md:text-2xl font-bold">
            Loading with divine grace...
          </p>
          
          {/* Loading Spinner */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>

        {/* Footer Mantra */}
        <div className="text-center animate-fadeIn" style={{animationDelay: '0.9s'}}>
          <p className="text-sm md:text-base text-orange-700 italic font-semibold">
            Hare Krishna Hare Krishna Krishna Krishna Hare Hare<br/>
            Hare Rama Hare Rama Rama Rama Hare Hare
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
