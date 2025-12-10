import React from 'react';
// @ts-ignore
import iskconLogo from '../utils/Images/Iscon_LOgo-removebg-preview.png';

const LoadingScreen: React.FC = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden">
      <div className="flex items-center justify-center">
        {/* Logo with Loading Spinner Around It - Perfectly Centered */}
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
      </div>
    </div>
  );
};

export default LoadingScreen;
