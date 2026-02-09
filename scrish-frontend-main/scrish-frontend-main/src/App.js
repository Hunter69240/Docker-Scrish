import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import InfoPage from './components/InfoPage';
import FileUpload from './components/FileUpload';
import AudioInfo from './components/AudioInfo';
import FilterControls from './components/FilterControls';
import Results from './components/Results';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // landing | info | filter
  const [audioData, setAudioData] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔁 Reset everything
  const resetAppState = () => {
    setAudioData(null);
    setResults(null);
    setError(null);
    setLoading(false);
  };

  // ---------------- LANDING ----------------
  if (currentPage === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => setCurrentPage('filter')}
        onLearnMore={() => setCurrentPage('info')}
      />
    );
  }

  // ---------------- INFO ----------------
  if (currentPage === 'info') {
    return (
      <InfoPage
        onStartFiltering={() => setCurrentPage('filter')}
        onBack={() => {
          resetAppState();
          setCurrentPage('landing');
        }}
      />
    );
  }

  // ---------------- FILTER PAGE ----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 py-8 px-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl p-8">

        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => {
              resetAppState();
              setCurrentPage('landing');
            }}
            className="px-4 py-2 text-primary-600 hover:text-primary-700 font-semibold
              flex items-center gap-2 hover:gap-3 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </button>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">
          Audio Filter – Before & After (Side by Side)
        </h1>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Upload / Sample */}
        <FileUpload
          setAudioData={setAudioData}
          setLoading={setLoading}
          setError={setError}
        />

        {/* Audio Info + Controls */}
        {audioData && (
          <>
            <AudioInfo audioData={audioData} />
            <FilterControls
              audioData={audioData}
              setResults={setResults}
              setLoading={setLoading}
              setError={setError}
            />
          </>
        )}

        {/* Results */}
        {results && <Results results={results} audioData={audioData} />}

        {/* Loading */}
        {loading && <LoadingSpinner />}
      </div>
    </div>
  );
}

export default App;
