import React, { useState, useRef } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAudio } from "../store/audioSlice";

const API_URL = process.env.REACT_APP_API_URL;

function RecordAudioPage({ onUploadComplete, onBack }) {

  const dispatch = useDispatch();

  const paragraph = `
  When the sunlight strikes raindrops in the air, they act like a prism and form a rainbow. 
  The rainbow is a division of the white light into many beautiful colors. 
  These take the shape of a long round arch, with its path high above, and its two ends apparently beyond the horizon. 
  There is according to legend, a boiling pot of gold at one end. People look, but no one ever finds it. 
  Throughout the centuries men have explained the rainbow in various ways. 
  Some have accepted it as a miracle without physical explanation. 
  The Greeks used to imagine that it was a sign from the gods to foretell war or heavy rain. 
  Aristotle thought that the rainbow was caused by reflection, but refraction by the raindrops which cause the rainbow. 
  This is a very common type of bow, one showing mainly red and yellow, with little or no green or blue.
  `;

  const [isRecording, setIsRecording] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [loading, setLoading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // START RECORDING
  const handleStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setHasStarted(true);
    } catch (err) {
      console.error("Microphone permission denied");
    }
  };

  // STOP RECORDING
  const handleStop = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  // DISCARD RECORDING
  const handleDiscard = () => {
    setIsRecording(false);
    setHasStarted(false);
    setAudioBlob(null);
  };

  // UPLOAD RECORDING
  const handleUpload = async () => {
    if (!audioBlob) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("audio", audioBlob, "recorded.webm");

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

        if (onUploadComplete) {
          onUploadComplete();
        }
      }
    } catch (err) {
      console.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-2xl p-10 space-y-8">
        
        {/* Back Button */}
        <div className="flex justify-start">
        <button
            onClick={onBack}
            disabled={isRecording}
            className={`px-4 py-2 rounded-lg font-semibold ${
            isRecording
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
        >
            ← Back to Upload
        </button>
        </div>

        <h1 className="text-3xl font-bold text-center">
          Audio Recording Task
        </h1>

        <div className="bg-gray-100 p-6 rounded-xl leading-relaxed text-lg">
          {paragraph}
        </div>

        <div className="flex flex-wrap justify-center gap-4">

          <button
            onClick={handleStart}
            disabled={isRecording}
            className={`px-6 py-3 rounded-xl text-white text-lg ${
              isRecording ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Start Recording
          </button>

          <button
            onClick={handleStop}
            disabled={!isRecording}
            className={`px-6 py-3 rounded-xl text-white text-lg ${
              !isRecording ? "bg-gray-400" : "bg-yellow-600 hover:bg-yellow-700"
            }`}
          >
            Stop Recording
          </button>

          <button
            onClick={handleUpload}
            disabled={!audioBlob || isRecording || loading}
            className={`px-6 py-3 rounded-xl text-white text-lg ${
              !audioBlob || isRecording
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Uploading..." : "Upload Recording"}
          </button>

          <button
            onClick={handleDiscard}
            disabled={!hasStarted}
            className={`px-6 py-3 rounded-xl text-white text-lg ${
              !hasStarted ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Discard Recording
          </button>

        </div>
      </div>
    </div>
  );
}

export default RecordAudioPage;
