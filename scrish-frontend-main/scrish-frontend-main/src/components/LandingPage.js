import React from 'react';

function LandingPage({ onGetStarted, onLearnMore }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-600 to-secondary-500 flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl mx-auto text-center w-full">
        {/* Logo/Icon */}
        <div className="mb-6 md:mb-8">
          <svg
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto text-white animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 drop-shadow-lg px-4">
          AudioScope
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-3 md:mb-4 font-light px-4">
          Professional Audio Filtering Made Simple
        </p>
        
        <p className="text-base sm:text-lg text-white/80 mb-8 md:mb-12 max-w-2xl mx-auto px-4">
          Transform your audio with precision filters. Apply lowpass, highpass, 
          and bandpass filters with real-time visualization and instant playback.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onGetStarted}
            className="px-10 py-4 bg-white text-primary-600 font-bold text-lg rounded-full
              hover:bg-gray-100 active:transform active:scale-95
              transition-all duration-200 shadow-2xl hover:shadow-3xl
              min-w-[200px]"
          >
            Get Started →
          </button>
          
          <button
            onClick={onLearnMore}
            className="px-10 py-4 bg-transparent border-2 border-white text-white font-bold text-lg rounded-full
              hover:bg-white/10 active:transform active:scale-95
              transition-all duration-200 min-w-[200px]"
          >
            Learn More
          </button>
        </div>

        {/* Features Highlight */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-white px-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6">
            <div className="text-3xl md:text-4xl mb-2 md:mb-3">🎵</div>
            <h3 className="font-bold text-base md:text-lg mb-1 md:mb-2">Multiple Filters</h3>
            <p className="text-xs md:text-sm text-white/80">Lowpass, Highpass & Bandpass</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6">
            <div className="text-3xl md:text-4xl mb-2 md:mb-3">📊</div>
            <h3 className="font-bold text-base md:text-lg mb-1 md:mb-2">Live Visualization</h3>
            <p className="text-xs md:text-sm text-white/80">See before & after waveforms</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6">
            <div className="text-3xl md:text-4xl mb-2 md:mb-3">⚡</div>
            <h3 className="font-bold text-base md:text-lg mb-1 md:mb-2">Instant Processing</h3>
            <p className="text-xs md:text-sm text-white/80">Real-time audio filtering</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
