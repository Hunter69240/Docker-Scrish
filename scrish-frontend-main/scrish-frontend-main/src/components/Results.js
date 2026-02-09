import React, { useState } from 'react';
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';
import axios from 'axios';

const Plot = createPlotlyComponent(Plotly);
const API_URL = 'https://scrish-backend.vercel.app';

function Results({ results, audioData }) {
  const [filterWholeAudio, setFilterWholeAudio] = useState(false);
  const [wholeFilteredAudio, setWholeFilteredAudio] = useState(null);
  const [loading, setLoading] = useState(false);

  const getGraphTitle = (type) => {
    const baseTitle = type === 'original' ? 'Original' : 'Filtered';
    if (results.filter_scope === 'segment') {
      return `${baseTitle} (Selected Segment ${results.start_time.toFixed(2)}-${results.end_time.toFixed(2)}s)`;
    }
    return `${baseTitle} (Whole Audio)`;
  };

  const downloadAudio = (base64Data, filename) => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/wav' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDownloadFiltered = () => {
    downloadAudio(results.filtered_audio, 'filtered_audio.wav');
  };

  const handleProcessWholeAudio = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/process-whole`, {
        audio_id: audioData.audio_id,
        filter_type: 'lowpass', // Use the same filter settings from FilterControls
        freq1: 1000,
        freq2: 4000,
      });

      if (response.data.success) {
        setWholeFilteredAudio(response.data.whole_filtered_audio);
        setFilterWholeAudio(true);
      }
    } catch (err) {
      console.error('Error processing whole audio:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadWholeFiltered = () => {
    if (wholeFilteredAudio) {
      downloadAudio(wholeFilteredAudio, 'filtered_whole_audio.wav');
    } else {
      handleProcessWholeAudio();
    }
  };

  const plotLayout = (title) => ({
    title: title,
    xaxis: { title: 'Time (s)' },
    yaxis: { title: 'Amplitude' },
    margin: { t: 50, b: 50, l: 50, r: 50 },
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff',
  });

  return (
    <div id="results" className="mt-8">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
        Before (Left) | After (Right) Waveforms
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Original Audio */}
        <div className="bg-gray-50 rounded-xl p-6">
          <Plot
            data={[
              {
                x: results.times,
                y: results.original,
                type: 'scatter',
                mode: 'lines',
                line: { color: 'lightblue', width: 1 },
              },
            ]}
            layout={plotLayout(getGraphTitle('original'))}
            config={{ responsive: true }}
            className="w-full"
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
          />
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">
              Original Audio Playback:
            </h4>
            <audio
              controls
              src={`data:audio/wav;base64,${results.original_audio}`}
              className="w-full"
            />
          </div>
        </div>

        {/* Filtered Audio */}
        <div className="bg-gray-50 rounded-xl p-6">
          <Plot
            data={[
              {
                x: results.times,
                y: results.filtered,
                type: 'scatter',
                mode: 'lines',
                line: { color: 'tomato', width: 1 },
              },
            ]}
            layout={plotLayout(getGraphTitle('filtered'))}
            config={{ responsive: true }}
            className="w-full"
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
          />
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">
              Filtered Audio Playback:
            </h4>
            <audio
              controls
              src={`data:audio/wav;base64,${results.filtered_audio}`}
              className="w-full mb-3"
            />
            <button
              onClick={handleDownloadFiltered}
              className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg
                hover:bg-orange-600 active:transform active:scale-[0.98]
                transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Download Filtered Audio
            </button>
          </div>
        </div>
      </div>

      {/* Whole Audio Filter Option */}
      {results.filter_scope === 'segment' && (
        <div className="bg-red-50 rounded-xl p-6 text-center">
          <label className="inline-flex items-center cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={filterWholeAudio}
              onChange={(e) => {
                setFilterWholeAudio(e.target.checked);
                if (e.target.checked && !wholeFilteredAudio) {
                  handleProcessWholeAudio();
                }
              }}
              className="w-5 h-5 text-primary-600 focus:ring-primary-500 rounded"
            />
            <span className="ml-3 text-gray-700 font-medium">
              Also filter whole audio with same settings and download
            </span>
          </label>

          {filterWholeAudio && (
            <button
              onClick={handleDownloadWholeFiltered}
              disabled={loading}
              className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-lg
                hover:bg-orange-600 active:transform active:scale-[0.98]
                transition-all duration-200 shadow-md hover:shadow-lg
                disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Download Filtered Whole Audio'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Results;
