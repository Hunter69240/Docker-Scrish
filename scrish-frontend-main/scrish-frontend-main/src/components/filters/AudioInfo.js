import React from "react";
import { useSelector } from "react-redux";

function AudioInfo() {
  const { duration, sampleRate, uploaded } = useSelector(
    (state) => state.audio
  );

  if (!uploaded) return null;

  return (
    <div className="bg-teal-50 rounded-xl p-6 mb-6 text-center">
      <p className="text-gray-700">
        <span className="font-semibold">Sample Rate:</span>{" "}
        <span className="text-primary-600">{sampleRate} Hz</span>
        <span className="mx-4">-</span>
        <span className="font-semibold">Duration:</span>{" "}
        <span className="text-primary-600">
          {duration?.toFixed(2)} seconds
        </span>
      </p>
    </div>
  );
}

export default AudioInfo;
