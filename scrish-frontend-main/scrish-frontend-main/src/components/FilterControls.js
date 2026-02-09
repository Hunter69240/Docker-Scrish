import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://scrish-backend.vercel.app';

function FilterControls({ audioData, setResults, setLoading, setError }) {
  const [filterScope, setFilterScope] = useState('whole');
  const [filterType, setFilterType] = useState('lowpass');

  const [freq1, setFreq1] = useState(1000);
  const [freq2, setFreq2] = useState(4000);
  const [order, setOrder] = useState(4);

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);

  useEffect(() => {
    if (audioData) {
      setEndTime(Math.min(10, audioData.duration));
    }
  }, [audioData]);

  const isWindowFilter = filterType === 'hann' || filterType === 'blackman';

  const handleApplyFilter = async () => {
    setLoading(true);
    setError(null);

    const requestData = {
      audio_id: audioData.audio_id,
      filter_scope: filterScope,
      filter_type: filterType,
      freq1: freq1,        // cutoff OR window size
      freq2: freq2,
      order: order,
      start_time: startTime,
      end_time: endTime,
    };

    try {
      const response = await axios.post(`${API_URL}/api/process`, requestData);

      if (response.data.success) {
        setResults(response.data);
        setTimeout(() => {
          document.getElementById('results')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 100);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error processing audio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-8 mb-6">

      {/* Filter Scope */}
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-3">
          Apply filter on:
        </label>
        <div className="flex gap-6">
          {['whole', 'segment'].map(scope => (
            <label key={scope} className="flex items-center cursor-pointer">
              <input
                type="radio"
                value={scope}
                checked={filterScope === scope}
                onChange={e => setFilterScope(e.target.value)}
                className="w-4 h-4"
              />
              <span className="ml-2 text-gray-700">
                {scope === 'whole' ? 'Whole Audio' : 'Selected Segment'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Segment Controls */}
      {filterScope === 'segment' && (
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            Select segment (seconds)
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="number"
              value={startTime}
              onChange={e => setStartTime(+e.target.value)}
              min="0"
              max={audioData.duration}
              step="0.1"
              className="input"
            />
            <input
              type="number"
              value={endTime}
              onChange={e => setEndTime(+e.target.value)}
              min={startTime + 0.01}
              max={audioData.duration}
              step="0.1"
              className="input"
            />
          </div>
        </div>
      )}

      {/* Filter Type */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Filter type:</label>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="w-full px-4 py-3 border-2 rounded-lg"
        >
          <option value="none">none</option>
          <option value="lowpass">lowpass</option>
          <option value="highpass">highpass</option>
          <option value="bandpass">bandpass</option>
          <option value="hann">hann (smoothing)</option>
          <option value="blackman">blackman (strong smoothing)</option>
        </select>
      </div>

      {/* Filter Order (Butterworth only) */}
      {filterType !== 'none' && !isWindowFilter && (
        <div className="mb-6">
          <label className="font-semibold mb-2 block">
            Filter Order: {order}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={order}
            onChange={e => setOrder(+e.target.value)}
            className="w-full"
          />
        </div>
      )}

      {/* Frequency / Window Size */}
      <div className="mb-6">
        <label className="font-semibold mb-2 block">
          {isWindowFilter
            ? 'Window Size (samples)'
            : 'Cutoff Frequency 1 (Hz)'}
        </label>
        <input
          type="range"
          min={isWindowFilter ? 256 : 100}
          max={isWindowFilter ? 4096 : 10000}
          step={isWindowFilter ? 128 : 10}
          value={freq1}
          onChange={e => setFreq1(+e.target.value)}
          className="w-full"
        />
        <p className="text-sm text-gray-500 mt-1">
          {filterType === 'hann' && 'Medium smoothing (balanced)'}
          {filterType === 'blackman' && 'Strong smoothing (very clean)'}
          {!isWindowFilter && 'Frequency in Hz'}
        </p>
      </div>

      {/* Bandpass freq2 */}
      {filterType === 'bandpass' && (
        <div className="mb-6">
          <label className="font-semibold mb-2 block">
            Cutoff Frequency 2 (Hz)
          </label>
          <input
            type="range"
            min="100"
            max="10000"
            step="10"
            value={freq2}
            onChange={e => setFreq2(+e.target.value)}
            className="w-full"
          />
        </div>
      )}

      {/* Apply */}
      <button
        onClick={handleApplyFilter}
        className="w-full py-4 bg-green-500 text-white font-bold text-lg rounded-lg hover:bg-green-600"
      >
        Apply Filter
      </button>
    </div>
  );
}

export default FilterControls;
