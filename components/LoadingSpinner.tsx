import React from 'react';
// @ts-ignore
import iskconLogo from '../utils/Images/Iscon_LOgo-removebg-preview.png';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...', size = 'md' }) => {
  const sizes = {
    sm: { spinner: 'w-16 h-16', logo: 'w-10 h-10', text: 'text-sm' },
    md: { spinner: 'w-24 h-24', logo: 'w-16 h-16', text: 'text-base' },
    lg: { spinner: 'w-32 h-32', logo: 'w-20 h-20', text: 'text-lg' }
  };

  const { spinner, logo, text } = sizes[size];

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Logo with Loading Spinner Around It */}
      <div className="relative flex items-center justify-center">
        {/* Outer spinning ring */}
        <div className={`absolute ${spinner} border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin`}></div>
        {/* Inner reverse spinning ring */}
        <div className={`absolute ${spinner} border-4 border-transparent border-r-amber-500 rounded-full animate-spin`} style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
        {/* Pulsing glow effect */}
        <div className={`absolute ${spinner} bg-orange-300/20 rounded-full animate-pulse blur-xl`}></div>
        
        {/* ISKCON Logo at center */}
        <img 
          src={iskconLogo} 
          alt="ISKCON Logo" 
          className={`relative ${logo} object-contain z-10 drop-shadow-lg`}
        />
      </div>

      {/* Loading Message */}
      <p className={`text-stone-600 font-medium ${text} animate-pulse`}>
        {message}
      </p>
    </div>
  );
};

export default LoadingSpinner;
