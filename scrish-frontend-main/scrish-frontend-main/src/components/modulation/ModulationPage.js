import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import Plotly from "plotly.js-basic-dist";
import createPlotlyComponent from "react-plotly.js/factory";
import {
  setType,
  setAmDepth,
  setFmFreq,
} from "../../store/modulationSlice";

const Plot = createPlotlyComponent(Plotly);
const API_URL = process.env.REACT_APP_API_URL;

function ModulationPage() {
  const dispatch = useDispatch();
  const { audioId, uploaded } = useSelector((state) => state.audio);
  const { type, amDepth, fmFreq } = useSelector(
    (state) => state.modulation
  );

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const originalAudioRef = useRef(null);
  const modulatedAudioRef = useRef(null);

  const [currentTimeOriginal, setCurrentTimeOriginal] = useState(0);
  const [currentTimeModulated, setCurrentTimeModulated] = useState(0);

  // Sync playback line with audio
  useEffect(() => {
    const originalAudio = originalAudioRef.current;
    const modulatedAudio = modulatedAudioRef.current;

    if (originalAudio) {
      originalAudio.ontimeupdate = () => {
        setCurrentTimeOriginal(originalAudio.currentTime);
      };
    }

    if (modulatedAudio) {
      modulatedAudio.ontimeupdate = () => {
        setCurrentTimeModulated(modulatedAudio.currentTime);
      };
    }
  }, [result]);

  const handleApply = async () => {
    if (!uploaded) return;

    setLoading(true);

    try {
      const payload =
        type === "am"
          ? {
              audio_id: audioId,
              modulation_type: "am",
              depth: amDepth / 100,
            }
          : {
              audio_id: audioId,
              modulation_type: "fm",
              mod_freq: fmFreq,
            };

      const response = await axios.post(
        `${API_URL}/api/modulate`,
        payload
      );

      if (response.data.success) {
        setResult(response.data);
      }
    } catch (err) {
      console.error("Modulation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const plotLayout = (title, currentTime) => ({
    title,
    autosize: true,
    margin: { l: 60, r: 20, t: 50, b: 50 },
    height: 420,
    shapes: result
      ? [
          {
            type: "line",
            x0: currentTime,
            x1: currentTime,
            y0: Math.min(...result.original, ...result.modulated),
            y1: Math.max(...result.original, ...result.modulated),
            line: {
              color: "red",
              width: 2,
            },
          },
        ]
      : [],
  });

  return (
    <div className="bg-gray-50 rounded-xl p-8 space-y-6">

      <select
        value={type}
        onChange={(e) => dispatch(setType(e.target.value))}
        className="w-full px-4 py-3 border rounded-lg"
      >
        <option value="am">Amplitude Modulation</option>
        <option value="fm">Frequency Modulation</option>
      </select>

      {type === "am" && (
        <>
          <label className="font-semibold">
            Depth: {amDepth}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={amDepth}
            onChange={(e) =>
              dispatch(setAmDepth(Number(e.target.value)))
            }
            className="w-full"
          />
        </>
      )}

      {type === "fm" && (
        <>
          <label className="font-semibold">
            Mod Frequency: {fmFreq} Hz
          </label>
          <input
            type="range"
            min="800"
            max="1200"
            step="100"
            value={fmFreq}
            onChange={(e) =>
              dispatch(setFmFreq(Number(e.target.value)))
            }
            className="w-full"
          />
        </>
      )}

      <button
        onClick={handleApply}
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg"
      >
        {loading ? "Processing..." : "Apply Modulation"}
      </button>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">

          {/* ORIGINAL */}
          <div className="bg-white p-6 rounded-xl overflow-hidden">
            <Plot
              data={[
                {
                  x: result.times,
                  y: result.original,
                  type: "scatter",
                  mode: "lines",
                  line: { width: 1 },
                },
              ]}
              layout={plotLayout("Original", currentTimeOriginal)}
              useResizeHandler={true}
              style={{ width: "100%", height: "400px" }}
              config={{ responsive: true }}
            />

            <audio
              ref={originalAudioRef}
              controls
              src={`data:audio/wav;base64,${result.original_audio}`}
              className="w-full mt-4"
            />
          </div>

          {/* MODULATED */}
          <div className="bg-white p-6 rounded-xl overflow-hidden">
            <Plot
              data={[
                {
                  x: result.times,
                  y: result.modulated,
                  type: "scatter",
                  mode: "lines",
                  line: { width: 1 },
                },
              ]}
              layout={plotLayout("Modulated", currentTimeModulated)}
              useResizeHandler={true}
              style={{ width: "100%", height: "400px" }}
              config={{ responsive: true }}
            />

            <audio
              ref={modulatedAudioRef}
              controls
              src={`data:audio/wav;base64,${result.modulated_audio}`}
              className="w-full mt-4"
            />
          </div>

        </div>
      )}

    </div>
  );
}

export default ModulationPage;
