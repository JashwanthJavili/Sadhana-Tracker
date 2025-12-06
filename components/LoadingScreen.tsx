import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden">
      <div className="flex flex-col items-center space-y-6 p-8">
        {/* Main Loading Spinner */}
        <div className="relative">
          <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-amber-500 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
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
