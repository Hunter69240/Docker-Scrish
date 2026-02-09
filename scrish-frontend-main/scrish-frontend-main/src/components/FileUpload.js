import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://scrish-backend.vercel.app';

function FileUpload({ setAudioData, setLoading, setError }) {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  // ---------------- FILE UPLOAD ----------------
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.size > 200 * 1024 * 1024) {
      setError('This app only supports files up to 200MB.');
      setFile(null);
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.wav')) {
      setError('Only .wav files are supported.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setUploadStatus('Uploading...');
    setError(null);

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData);

      if (response.data.success) {
        setAudioData(response.data);
        setUploadStatus('Audio file uploaded successfully!');
        setTimeout(() => setUploadStatus(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error uploading file');
      setUploadStatus('');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SAMPLE AUDIO ----------------
  const loadSample = async (sampleName) => {
    setLoading(true);
    setError(null);
    setUploadStatus(`Loading ${sampleName} sample...`);

    try {
      const response = await axios.get(`${API_URL}/api/sample/${sampleName}`);

      if (response.data.success) {
        setAudioData(response.data);
        setUploadStatus(`Loaded "${sampleName}" sample`);
        setTimeout(() => setUploadStatus(''), 3000);
      }
    } catch (err) {
      setError('Failed to load sample audio');
      setUploadStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-8 mb-6 text-center space-y-6">

      {/* Upload Section */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <input
          type="file"
          accept=".wav"
          onChange={handleFileChange}
          className="block w-full sm:w-auto text-sm text-gray-500
            file:mr-4 file:py-3 file:px-6
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-primary-50 file:text-primary-700
            hover:file:bg-primary-100
            file:cursor-pointer cursor-pointer"
        />
        <button
          onClick={handleUpload}
          disabled={!file}
          className="px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg
            hover:bg-primary-600 active:scale-95 transition-all
            disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Upload Audio
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="text-gray-500 font-semibold">OR</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      {/* Sample Audio Section */}
      <div>
        <p className="text-gray-700 font-semibold mb-3">
          Try with sample audio (no upload required)
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => loadSample('noisy')}
            className="px-5 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
          >
            Noisy Signal
          </button>
          <button
            onClick={() => loadSample('voice_like')}
            className="px-5 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Voice-like
          </button>
          <button
            onClick={() => loadSample('sine_sweep')}
            className="px-5 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            Frequency Sweep
          </button>
        </div>
      </div>

      {/* Status */}
      {uploadStatus && (
        <div className="p-3 bg-green-100 text-green-700 rounded-lg font-medium">
          {uploadStatus}
        </div>
      )}

      {file && (
        <p className="text-sm text-gray-600">
          Selected file: <span className="font-medium">{file.name}</span>
        </p>
      )}
    </div>
  );
}

export default FileUpload;
