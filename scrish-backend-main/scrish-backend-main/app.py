from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from scipy.signal import butter, lfilter, windows
import soundfile as sf
import io
import base64
import os
from werkzeug.utils import secure_filename
import uuid

app = Flask(__name__)

# -------------------- CORS --------------------
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# -------------------- CONFIG --------------------
app.config["MAX_CONTENT_LENGTH"] = 200 * 1024 * 1024
app.config["UPLOAD_FOLDER"] = "/tmp"
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# In-memory cache (use Redis in prod)
audio_cache = {}

# ======================================================
# WINDOW-BASED FILTERS
# ======================================================
def hann_filter(data, window_size=1024):
    window_size = max(16, int(window_size))
    window = windows.hann(window_size, sym=False)
    window /= np.sum(window)
    return np.convolve(data, window, mode="same")

def blackman_filter(data, window_size=1024):
    window_size = max(16, int(window_size))
    window = windows.blackman(window_size, sym=False)
    window /= np.sum(window)
    return np.convolve(data, window, mode="same")

# ======================================================
# SAMPLE AUDIO GENERATORS
# ======================================================
def generate_noisy_signal(sr=44100, duration=3):
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    tone = np.sin(2 * np.pi * 440 * t)
    noise = 0.4 * np.random.randn(len(t))
    return tone + noise, sr

def generate_sine_sweep(sr=44100, duration=4):
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    sweep = np.sin(2 * np.pi * (50 + 3000 * t / duration) * t)
    return sweep, sr

def generate_voice_like(sr=44100, duration=3):
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    signal = (
        np.sin(2 * np.pi * 200 * t)
        + 0.5 * np.sin(2 * np.pi * 400 * t)
        + 0.3 * np.sin(2 * np.pi * 800 * t)
    )
    noise = 0.1 * np.random.randn(len(t))
    return signal + noise, sr

# ======================================================
# FILTER DISPATCH
# ======================================================
def filter_audio(data, sr, filter_type, freq1, freq2, order=4):
    nyq = 0.5 * sr
    freq1_n = min(max(freq1 / nyq, 0.01), 0.99)
    freq2_n = min(max(freq2 / nyq, freq1_n + 0.01), 0.99)
    order = max(1, min(int(order), 10))

    if filter_type == "lowpass":
        b, a = butter(order, freq1_n, btype="low")
        return lfilter(b, a, data)

    elif filter_type == "highpass":
        b, a = butter(order, freq1_n, btype="high")
        return lfilter(b, a, data)

    elif filter_type == "bandpass":
        b, a = butter(order, [freq1_n, freq2_n], btype="band")
        return lfilter(b, a, data)

    elif filter_type == "hann":
        return hann_filter(data, window_size=freq1)

    elif filter_type == "blackman":
        return blackman_filter(data, window_size=freq1)

    return data

# ======================================================
# UPLOAD AUDIO
# ======================================================
@app.route("/api/upload", methods=["POST"])
def upload_audio():
    if "audio" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["audio"]
    if not file.filename.lower().endswith(".wav"):
        return jsonify({"error": "Only .wav files supported"}), 400

    audio_data, sr = sf.read(file)
    if audio_data.ndim > 1:
        audio_data = audio_data.mean(axis=1)

    audio_id = str(uuid.uuid4())
    duration = len(audio_data) / sr

    audio_cache[audio_id] = {
        "data": audio_data,
        "sample_rate": sr,
        "duration": duration,
        "filename": secure_filename(file.filename),
    }

    return jsonify({
        "success": True,
        "audio_id": audio_id,
        "sample_rate": sr,
        "duration": duration,
        "samples": len(audio_data),
        "filename": secure_filename(file.filename)
    })

# ======================================================
# LOAD SAMPLE AUDIO (NO UPLOAD NEEDED)
# ======================================================
@app.route("/api/sample/<name>", methods=["GET"])
def load_sample(name):
    if name == "noisy":
        audio_data, sr = generate_noisy_signal()
    elif name == "voice_like":
        audio_data, sr = generate_voice_like()
    elif name == "sine_sweep":
        audio_data, sr = generate_sine_sweep()
    else:
        return jsonify({"error": "Sample not found"}), 404

    audio_id = str(uuid.uuid4())
    duration = len(audio_data) / sr

    audio_cache[audio_id] = {
        "data": audio_data,
        "sample_rate": sr,
        "duration": duration,
        "filename": f"{name}.wav",
    }

    return jsonify({
        "success": True,
        "audio_id": audio_id,
        "sample_rate": sr,
        "duration": duration,
        "samples": len(audio_data),
        "filename": f"{name}.wav",
        "is_sample": True
    })

# ======================================================
# PROCESS AUDIO
# ======================================================
@app.route("/api/process", methods=["POST"])
def process_audio():
    data = request.json
    audio_id = data.get("audio_id")

    if audio_id not in audio_cache:
        return jsonify({"error": "Audio not found"}), 404

    cached = audio_cache[audio_id]
    audio = cached["data"]
    sr = cached["sample_rate"]
    duration = cached["duration"]

    filter_type = data.get("filter_type", "none")
    freq1 = float(data.get("freq1", 1024))
    freq2 = float(data.get("freq2", 4000))
    order = int(data.get("order", 4))
    scope = data.get("filter_scope", "whole")
    start_time = float(data.get("start_time", 0))
    end_time = float(data.get("end_time", duration))

    if scope == "segment":
        start = int(start_time * sr)
        end = int(end_time * sr)
        input_audio = audio[start:end]
        times = np.linspace(start_time, end_time, len(input_audio))
    else:
        input_audio = audio
        times = np.linspace(0, duration, len(audio))

    filtered = filter_audio(input_audio, sr, filter_type, freq1, freq2, order)

    step = max(1, len(times) // 5000)

    def to_b64(signal):
        buf = io.BytesIO()
        sf.write(buf, signal, sr, format="WAV")
        return base64.b64encode(buf.getvalue()).decode()

    return jsonify({
        "success": True,
        "times": times[::step].tolist(),
        "original": input_audio[::step].tolist(),
        "filtered": filtered[::step].tolist(),
        "original_audio": to_b64(input_audio),
        "filtered_audio": to_b64(filtered),
    })

# ======================================================
# PROCESS WHOLE AUDIO
# ======================================================
@app.route("/api/process-whole", methods=["POST"])
def process_whole():
    data = request.json
    audio_id = data.get("audio_id")

    if audio_id not in audio_cache:
        return jsonify({"error": "Audio not found"}), 404

    cached = audio_cache[audio_id]
    audio = cached["data"]
    sr = cached["sample_rate"]

    filtered = filter_audio(
        audio,
        sr,
        data.get("filter_type", "none"),
        float(data.get("freq1", 1024)),
        float(data.get("freq2", 4000)),
        int(data.get("order", 4)),
    )

    buf = io.BytesIO()
    sf.write(buf, filtered, sr, format="WAV")

    return jsonify({
        "success": True,
        "whole_filtered_audio": base64.b64encode(buf.getvalue()).decode()
    })

# ======================================================
# HEALTH & ROOT
# ======================================================
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "message": "Scrish Audio Processing API",
        "filters": ["lowpass", "highpass", "bandpass", "hann", "blackman"],
        "samples": ["noisy", "voice_like", "sine_sweep"]
    })

# ======================================================
# ENTRY
# ======================================================
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
