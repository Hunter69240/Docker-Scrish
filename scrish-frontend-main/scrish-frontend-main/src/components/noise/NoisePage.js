import React, { useState } from "react";
import { useSelector } from "react-redux";

const API_BASE = process.env.REACT_APP_API_URL;

function NoisePage() {
  const { audioId, uploaded } = useSelector((state) => state.audio);

  const [sliderValue, setSliderValue] = useState(0);
  const [originalAudio, setOriginalAudio] = useState(null);
  const [noisyAudio, setNoisyAudio] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleNoiseApply = async () => {
    if (!uploaded) return;

    const noiseLevel = Math.abs(sliderValue) / 15;

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/add-noise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio_id: audioId,
          noise_level: noiseLevel,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setOriginalAudio(
          `data:audio/wav;base64,${data.original_audio}`
        );
        setNoisyAudio(
          `data:audio/wav;base64,${data.noisy_audio}`
        );
      }
    } catch (err) {
      console.error("Noise processing failed", err);
    }

    setLoading(false);
  };

  return (
    <div className="bg-gray-900 text-white rounded-xl p-8 max-w-xl mx-auto space-y-6">

      <h1 className="text-3xl font-bold text-center">
        Noise Processing
      </h1>

      {!uploaded && (
        <div className="bg-yellow-700 p-4 rounded-lg text-center">
          Upload audio first in Filters tab.
        </div>
      )}

      {uploaded && (
        <>
          <input
            type="range"
            min="-15"
            max="15"
            step="5"
            value={sliderValue}
            onChange={(e) =>
              setSliderValue(Number(e.target.value))
            }
            className="w-full accent-blue-500"
          />

          <div className="text-center">
            Selected: {sliderValue}
          </div>

          <button
            onClick={handleNoiseApply}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg"
          >
            {loading ? "Processing..." : "Apply Noise"}
          </button>

          {originalAudio && (
            <>
              <h3 className="mt-6">Original</h3>
              <audio controls src={originalAudio} className="w-full" />
            </>
          )}

          {noisyAudio && (
            <>
              <h3 className="mt-4">Noisy</h3>
              <audio controls src={noisyAudio} className="w-full" />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default NoisePage;
