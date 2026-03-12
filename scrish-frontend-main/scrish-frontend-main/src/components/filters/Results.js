import React, { useState, useRef, useEffect } from "react";
import Plotly from "plotly.js-basic-dist";
import createPlotlyComponent from "react-plotly.js/factory";
import axios from "axios";
import { useSelector } from "react-redux";

const Plot = createPlotlyComponent(Plotly);
const API_URL = process.env.REACT_APP_API_URL;

function Results({ results }) {
  const { audioId } = useSelector((state) => state.audio);

  const [wholeFilteredAudio, setWholeFilteredAudio] = useState(null);
  const [loading, setLoading] = useState(false);

  const originalAudioRef = useRef(null);
  const filteredAudioRef = useRef(null);

  const [currentTimeOriginal, setCurrentTimeOriginal] = useState(0);
  const [currentTimeFiltered, setCurrentTimeFiltered] = useState(0);

  // Sync playback line with audio
  useEffect(() => {
    const originalAudio = originalAudioRef.current;
    const filteredAudio = filteredAudioRef.current;

    if (originalAudio) {
      originalAudio.ontimeupdate = () => {
        setCurrentTimeOriginal(originalAudio.currentTime);
      };
    }

    if (filteredAudio) {
      filteredAudio.ontimeupdate = () => {
        setCurrentTimeFiltered(filteredAudio.currentTime);
      };
    }
  }, []);

  const downloadAudio = (base64Data, filename) => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "audio/wav" });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDownloadFiltered = () => {
    downloadAudio(results.filtered_audio, "filtered_audio.wav");
  };

  const handleProcessWholeAudio = async () => {
    if (!audioId) return;

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/process-whole`,
        {
          audio_id: audioId,
          filter_type: "lowpass",
          freq1: 1000,
          freq2: 4000,
        }
      );

      if (response.data.success) {
        setWholeFilteredAudio(response.data.whole_filtered_audio);
      }
    } catch (err) {
      console.error("Error processing whole audio:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadWholeFiltered = () => {
    if (wholeFilteredAudio) {
      downloadAudio(wholeFilteredAudio, "filtered_whole_audio.wav");
    } else {
      handleProcessWholeAudio();
    }
  };

  const plotLayout = (title, currentTime) => ({
    title: {
      text: title,
      font: { size: 18 },
    },
    autosize: true,
    xaxis: {
      title: "Time (s)",
      automargin: true,
    },
    yaxis: {
      title: "Amplitude",
      automargin: true,
    },
    margin: { l: 60, r: 20, t: 60, b: 60 },
    height: 420,
    shapes: [
      {
        type: "line",
        x0: currentTime,
        x1: currentTime,
        y0: Math.min(...results.original, ...results.filtered),
        y1: Math.max(...results.original, ...results.filtered),
        line: {
          color: "red",
          width: 2,
        },
      },
    ],
  });

  return (
    <div id="results" className="mt-10 overflow-hidden">

      <h2 className="text-3xl font-bold text-center mb-10">
        Before | After Waveforms
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ORIGINAL */}
        <div className="bg-gray-50 rounded-xl p-6 shadow-md overflow-hidden">
          <div className="w-full h-[420px]">
            <Plot
              data={[
                {
                  x: results.times,
                  y: results.original,
                  type: "scatter",
                  mode: "lines",
                  line: { width: 1 },
                },
              ]}
              layout={plotLayout("Original", currentTimeOriginal)}
              config={{ responsive: true }}
              useResizeHandler={true}
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          <audio
            ref={originalAudioRef}
            controls
            src={`data:audio/wav;base64,${results.original_audio}`}
            className="w-full mt-6"
          />
        </div>

        {/* FILTERED */}
        <div className="bg-gray-50 rounded-xl p-6 shadow-md overflow-hidden">
          <div className="w-full h-[420px]">
            <Plot
              data={[
                {
                  x: results.times,
                  y: results.filtered,
                  type: "scatter",
                  mode: "lines",
                  line: { width: 1 },
                },
              ]}
              layout={plotLayout("Filtered", currentTimeFiltered)}
              config={{ responsive: true }}
              useResizeHandler={true}
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          <audio
            ref={filteredAudioRef}
            controls
            src={`data:audio/wav;base64,${results.filtered_audio}`}
            className="w-full mt-6 mb-4"
          />

          <button
            onClick={handleDownloadFiltered}
            className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Download Filtered Audio
          </button>
        </div>
      </div>
    </div>
  );
}

export default Results;
