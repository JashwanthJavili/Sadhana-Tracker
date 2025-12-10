import React from 'react';
// @ts-ignore
import iskconLogo from '../utils/Images/Iscon_LOgo-removebg-preview.png';

const LoadingScreen: React.FC = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden">
      <div className="flex flex-col items-center space-y-6 p-8">
        {/* Logo with Loading Spinner Around It */}
        <div className="relative flex items-center justify-center">
          {/* Outer spinning ring */}
          <div className="absolute w-32 h-32 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
          {/* Inner reverse spinning ring */}
          <div className="absolute w-32 h-32 border-4 border-transparent border-r-amber-500 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          {/* Pulsing glow effect */}
          <div className="absolute w-32 h-32 bg-orange-300/20 rounded-full animate-pulse blur-xl"></div>
          
          {/* ISKCON Logo at center */}
          <img 
            src={iskconLogo} 
            alt="ISKCON Logo" 
            className="relative w-20 h-20 object-contain z-10 drop-shadow-lg"
          />
        </div>

        {/* Hare Krishna Mantra */}
        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-orange-800 leading-relaxed">
            Hare Krishna Hare Krishna<br/>
            Krishna Krishna Hare Hare<br/>
            Hare Rama Hare Rama<br/>
            Rama Rama Hare Hare
          </h2>
          
          <p className="text-orange-600 text-sm font-medium animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
