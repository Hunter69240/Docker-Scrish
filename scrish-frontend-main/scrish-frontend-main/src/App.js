import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearAudio } from "./store/audioSlice";

import LandingPage from "./components/LandingPage";
import InfoPage from "./components/InfoPage";
import FileUpload from "./components/filters/FileUpload";
import AudioInfo from "./components/filters/AudioInfo";
import FilterControls from "./components/filters/FilterControls";
import Results from "./components/filters/Results";
import LoadingSpinner from "./components/LoadingSpinner";
import NoisePage from "./components/noise/NoisePage";
import ModulationPage from "./components/modulation/ModulationPage";
import RecordAudioPage from "./pages/RecordAudioPage";

function App() {
  const dispatch = useDispatch();
  const { uploaded } = useSelector((state) => state.audio);

  const [currentPage, setCurrentPage] = useState("landing");
  const [activeTab, setActiveTab] = useState("filters");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetAppState = () => {
    dispatch(clearAudio());
    setResults(null);
    setError(null);
    setLoading(false);
    setActiveTab("filters");
  };

  // LANDING PAGE
  if (currentPage === "landing") {
    return (
      <LandingPage
        onGetStarted={() => setCurrentPage("filter")}
        onLearnMore={() => setCurrentPage("info")}
      />
    );
  }

  // INFO PAGE
  if (currentPage === "info") {
    return (
      <InfoPage
        onStartFiltering={() => setCurrentPage("filter")}
        onBack={() => {
          resetAppState();
          setCurrentPage("landing");
        }}
      />
    );
  }

  // RECORD PAGE
 if (currentPage === "record") {
  return (
    <RecordAudioPage
      onUploadComplete={() => {
        setCurrentPage("filter");
        setActiveTab("filters");
      }}
      onBack={() => setCurrentPage("filter")}
    />
  );
}


  const tabs = [
    { id: "filters", label: "Filters", icon: "🎚️" },
    { id: "noise", label: "Noise", icon: "🔊" },
    { id: "modulation", label: "Modulation", icon: "🎵" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 py-8 px-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">

        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => {
              resetAppState();
              setCurrentPage("landing");
            }}
            className="px-4 py-2 text-primary-600 font-semibold"
          >
            ← Back to Home
          </button>
        </div>

        <h1 className="text-3xl font-bold text-center mb-6">
          Audio Processing Studio
        </h1>

        {/* Tabs */}
        <div className="mb-8 border-b-2 border-gray-200">
          <div className="flex justify-center gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-semibold border-b-4
                  ${
                    activeTab === tab.id
                      ? "border-primary-600 text-primary-600"
                      : "border-transparent text-gray-500"
                  }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* FILTERS TAB */}
        {activeTab === "filters" && (
          <>
            <FileUpload
              setLoading={setLoading}
              setError={setError}
              resetResults={() => setResults(null)}
              onRecord={() => setCurrentPage("record")}
            />

            {uploaded && (
              <>
                <AudioInfo />
                <FilterControls
                  setResults={setResults}
                  setLoading={setLoading}
                  setError={setError}
                />
                {results && <Results results={results} />}
              </>
            )}
          </>
        )}

        {/* NOISE TAB */}
        {activeTab === "noise" && <NoisePage />}

        {/* MODULATION TAB */}
        {activeTab === "modulation" && (
          <>
            {!uploaded && (
              <div className="bg-yellow-50 p-6 rounded-lg text-center text-yellow-800 font-semibold">
                Upload audio first to use modulation.
              </div>
            )}

            {uploaded && <ModulationPage />}
          </>
        )}

        {loading && <LoadingSpinner />}
      </div>
    </div>
  );
}

export default App;
