import React from 'react';

function InfoPage({ onStartFiltering, onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 py-12 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-8 md:p-12">

        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 text-primary-600 hover:text-primary-700 font-semibold
            flex items-center gap-2 hover:gap-3 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            How AudioScope Works
          </h1>
          <p className="text-xl text-gray-600">
            Learn about all the features before you start filtering
          </p>
        </div>

        {/* Features */}
        <div className="space-y-8 mb-10">

          {/* Feature 1 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold mb-3">1️⃣ File Upload</h2>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
              <li>Upload <strong>.wav</strong> files (up to 200MB)</li>
              <li>Stereo files are automatically converted to mono</li>
              <li>Displays duration, sample rate, and total samples</li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border-l-4 border-green-500">
            <h2 className="text-2xl font-bold mb-3">2️⃣ Filter Scope</h2>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
              <li><strong>Whole Audio:</strong> Applies filter to entire file</li>
              <li><strong>Selected Segment:</strong> Applies filter to chosen time range</li>
              <li>Segment times are specified in seconds</li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold mb-3">3️⃣ Filter Type</h2>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
              <li><strong>None:</strong> No filtering (baseline comparison)</li>
              <li><strong>Lowpass:</strong> Removes high frequencies (warmer sound)</li>
              <li><strong>Highpass:</strong> Removes low frequencies (removes rumble)</li>
              <li><strong>Bandpass:</strong> Keeps only a selected frequency range</li>
              <li>
                <strong>Hann (Hanning):</strong> Smooths the waveform using a Hann
                window (gentle smoothing)
              </li>
              <li>
                <strong>Blackman:</strong> Stronger waveform smoothing using a
                Blackman window (very clean, less detail)
              </li>
            </ul>
          </div>

          {/* Feature 4 */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border-l-4 border-orange-500">
            <h2 className="text-2xl font-bold mb-3">4️⃣ Cutoff Frequency</h2>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
              <li>Range: <strong>100 Hz – 10,000 Hz</strong></li>
              <li>Frequency 1 is required for frequency-based filters</li>
              <li>Frequency 2 is used only for bandpass filters</li>
              <li>Lower = bass, Higher = treble</li>
            </ul>
          </div>

          {/* Feature 5 */}
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border-l-4 border-red-500">
            <h2 className="text-2xl font-bold mb-3">5️⃣ Filter Slope (dB/oct)</h2>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
              <li>Controls how sharp the cutoff is</li>
              <li>Range: <strong>6 dB/oct – 60 dB/oct</strong></li>
              <li>Higher slope = more aggressive filtering</li>
              <li>Default: <strong>24 dB/oct</strong> (order 4)</li>
            </ul>
          </div>

          {/* Feature 6: Hann */}
          <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl p-6 border-l-4 border-cyan-500">
            <h2 className="text-2xl font-bold mb-3">⭐ Hann (Hanning) Filter</h2>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
              <li>Time-domain smoothing (not a sharp frequency filter)</li>
              <li>Uses a Hann window to average nearby samples</li>
              <li>Reduces spikes, clicks, and rough edges</li>
              <li>Acts like a gentle low-pass smoothing filter</li>
              <li>Controlled using <strong>window size (samples)</strong></li>
              <li>Larger window = smoother audio</li>
            </ul>
          </div>

          {/* Feature 7: Blackman */}
          <div className="bg-gradient-to-r from-sky-50 to-sky-100 rounded-xl p-6 border-l-4 border-sky-500">
            <h2 className="text-2xl font-bold mb-3">⭐ Blackman Filter</h2>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
              <li>Stronger smoothing than Hann</li>
              <li>Excellent for very noisy signals</li>
              <li>Reduces spectral leakage significantly</li>
              <li>More smoothing = less fine detail</li>
              <li>Best for visualization cleanup and denoising</li>
            </ul>
          </div>

          {/* Feature 8 */}
          <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl p-6 border-l-4 border-teal-500">
            <h2 className="text-2xl font-bold mb-3">6️⃣ Visualization</h2>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
              <li>Side-by-side waveform comparison</li>
              <li>Blue = original, Red = filtered</li>
              <li>Zoom and pan supported</li>
            </ul>
          </div>

          {/* Feature 9 */}
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-6 border-l-4 border-indigo-500">
            <h2 className="text-2xl font-bold mb-3">7️⃣ Audio Playback & Download</h2>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
              <li>Play original and filtered audio</li>
              <li>Compare sound quality by ear</li>
              <li>Download filtered .wav files</li>
            </ul>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold mb-3">💡 Quick Tips</h3>
          <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
            <li>Use lowpass/highpass for frequency control</li>
            <li>Use Hann for gentle smoothing</li>
            <li>Use Blackman for strong noise reduction</li>
            <li>Higher smoothing removes detail</li>
            <li>Segment mode is perfect for testing settings</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onStartFiltering}
            className="px-12 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white 
              font-bold text-xl rounded-full hover:shadow-2xl active:scale-95 transition-all"
          >
            Start Filtering Your Audio →
          </button>
        </div>
      </div>
    </div>
  );
}

export default InfoPage;
