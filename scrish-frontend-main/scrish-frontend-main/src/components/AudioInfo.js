import React from 'react';

function AudioInfo({ audioData }) {
  return (
    <div className="bg-teal-50 rounded-xl p-6 mb-6 text-center">
      <p className="text-gray-700">
        <span className="font-semibold">Sample Rate:</span>{' '}
        <span className="text-primary-600">{audioData.sample_rate} Hz</span>
        <span className="mx-4">-</span>
        <span className="font-semibold">Duration:</span>{' '}
        <span className="text-primary-600">{audioData.duration.toFixed(2)} seconds</span>
      </p>
    </div>
  );
}

export default AudioInfo;
