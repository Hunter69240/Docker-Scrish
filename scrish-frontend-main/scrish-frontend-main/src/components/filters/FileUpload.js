import React, { useState, useRef } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAudio, clearAudio } from "../../store/audioSlice";

const API_URL = process.env.REACT_APP_API_URL;

function FileUpload({ setLoading, setError, resetResults, onRecord }) {

  const dispatch = useDispatch();

  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".wav")) {
      setError("Only .wav files supported");
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await axios.post(
        `${API_URL}/api/upload`,
        formData
      );

      if (response.data.success) {
        dispatch(
          setAudio({
            audioId: response.data.audio_id,
            fileName: response.data.filename,
            duration: response.data.duration,
            sampleRate: response.data.sample_rate,
          })
        );

        if (resetResults) resetResults();

        setUploadStatus("Audio uploaded successfully!");
        setTimeout(() => setUploadStatus(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    dispatch(clearAudio());
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFile(null);
  };

  return (
    <div className="bg-gray-50 rounded-xl p-8 mb-6 text-center space-y-6">

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".wav"
          onChange={handleFileChange}
          className="block w-full sm:w-auto file:bg-primary-50 file:px-6 file:py-3 file:rounded-lg"
        />

        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!file}
            className="px-8 py-3 bg-primary-500 text-white rounded-lg"
          >
            Upload
          </button>

          <button
            onClick={handleReset}
            className="px-6 py-3 bg-red-500 text-white rounded-lg"
          >
            Reset
          </button>

          <button
            onClick={onRecord}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg"
          >
            Record Audio
          </button>

        </div>
      </div>

      {uploadStatus && (
        <div className="p-3 bg-green-100 text-green-700 rounded-lg">
          {uploadStatus}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
