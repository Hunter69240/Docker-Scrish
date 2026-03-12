import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const API_URL = process.env.REACT_APP_API_URL;

function FilterControls({ setResults, setLoading, setError }) {
  const { audioId, uploaded } = useSelector((state) => state.audio);

  const [filterType, setFilterType] = useState("lowpass");

  // IIR controls
  const [strength, setStrength] = useState(50);
  const [order, setOrder] = useState(4);

  // Window filter control
  const [windowSize, setWindowSize] = useState(1024);

  const isWindowFilter =
    filterType === "hann" || filterType === "blackman";

  const handleApplyFilter = async () => {
    if (!uploaded) {
      setError("Upload audio first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let payload = {
        audio_id: audioId,
        filter_type: filterType,
      };

      if (isWindowFilter) {
        payload.freq1 = windowSize; // backend uses freq1 as window size
      } else {
        payload.strength = strength;
        payload.order = order;
      }

      const response = await axios.post(
        `${API_URL}/api/process`,
        payload
      );

      if (response.data.success) {
        setResults(response.data);
      }
    } catch (err) {
      setError("Processing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-8 mb-6">

      {/* Filter Type */}
      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        className="w-full mb-6 px-4 py-3 border rounded-lg"
      >
        <option value="lowpass">Lowpass</option>
        <option value="highpass">Highpass</option>
        <option value="bandpass">Bandpass</option>
        <option value="hann">Hann (Smoothing)</option>
        <option value="blackman">Blackman (Strong Smoothing)</option>
      </select>

      {/* ========================= */}
      {/* IIR FILTER CONTROLS */}
      {/* ========================= */}

      {!isWindowFilter && (
        <>
          <label className="font-semibold block mb-2">
            Filter Strength: {strength}
          </label>

          <input
            type="range"
            min="0"
            max="100"
            value={strength}
            onChange={(e) =>
              setStrength(Number(e.target.value))
            }
            className="w-full mb-6"
          />

          <label className="font-semibold block mb-2">
            Filter Order: {order}
          </label>

          <input
            type="range"
            min="1"
            max="10"
            value={order}
            onChange={(e) =>
              setOrder(Number(e.target.value))
            }
            className="w-full mb-6"
          />
        </>
      )}

      {/* ========================= */}
      {/* WINDOW FILTER CONTROLS */}
      {/* ========================= */}

      {isWindowFilter && (
        <>
          <label className="font-semibold block mb-2">
            Window Size: {windowSize} samples
          </label>

          <input
            type="range"
            min="256"
            max="4096"
            step="128"
            value={windowSize}
            onChange={(e) =>
              setWindowSize(Number(e.target.value))
            }
            className="w-full mb-6"
          />

          <p className="text-sm text-gray-600">
            {filterType === "hann" &&
              "Balanced smoothing — removes noise gently."}
            {filterType === "blackman" &&
              "Stronger smoothing — cleaner but more aggressive."}
          </p>
        </>
      )}

      {/* Apply */}
      <button
        onClick={handleApplyFilter}
        className="w-full py-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"
      >
        Apply Filter
      </button>
    </div>
  );
}

export default FilterControls;
