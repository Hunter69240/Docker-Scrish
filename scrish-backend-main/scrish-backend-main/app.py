from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from scipy.signal import butter, lfilter, windows
import soundfile as sf
import io
import base64
import os
import uuid
from pydub import AudioSegment

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config["MAX_CONTENT_LENGTH"] = 200 * 1024 * 1024
audio_cache = {}


# ======================================================
# MODULATION IMPLEMENTATIONS
# ======================================================

def apply_amplitude_modulation(signal, sr, depth):
    """
    depth: 0.1 – 1.0
    Using 40Hz carrier so it is clearly audible
    """
    t = np.arange(len(signal)) / sr
    carrier_freq = 40  # more audible than 5Hz
    carrier = np.sin(2 * np.pi * carrier_freq * t)
    modulated = signal * (1 + depth * carrier)
    return np.clip(modulated, -1.0, 1.0)


def apply_frequency_modulation(signal, sr, mod_freq):
    """
    Proper FM-style modulation
    """
    t = np.arange(len(signal)) / sr
    beta = 5  # modulation index (controls intensity)

    modulator = beta * np.sin(2 * np.pi * mod_freq * t)
    modulated = np.sin(2 * np.pi * 440 * t + modulator)

    # mix original + fm texture
    mixed = 0.7 * signal + 0.3 * modulated
    return np.clip(mixed, -1.0, 1.0)


# ======================================================
# UTILITIES
# ======================================================

def normalize_audio(signal, target_peak=0.9):
    peak = np.max(np.abs(signal))
    if peak < 1e-9:
        return signal
    return (signal / peak) * target_peak

def hann_filter(data, window_size=1024):
    window = windows.hann(max(16, int(window_size)), sym=False)
    window /= np.sum(window)
    return np.convolve(data, window, mode="same")

def blackman_filter(data, window_size=1024):
    window = windows.blackman(max(16, int(window_size)), sym=False)
    window /= np.sum(window)
    return np.convolve(data, window, mode="same")

def add_random_noise(signal, noise_level=0.1):
    signal_power = np.mean(signal ** 2)
    noise = np.random.randn(len(signal))
    noise_power = np.mean(noise ** 2)
    scaled_noise = noise * np.sqrt(signal_power / noise_power)
    noisy_signal = signal + noise_level * scaled_noise
    return np.clip(noisy_signal, -1.0, 1.0)

# ======================================================
# FILTER
# ======================================================

def filter_audio(data, sr, filter_type, freq1, freq2, order=4):
    nyq = 0.5 * sr
    order = max(1, min(int(order), 10))

    low = min(freq1, freq2)
    high = max(freq1, freq2)

    low_n = np.clip(low / nyq, 0.01, 0.98)
    high_n = np.clip(high / nyq, low_n + 0.01, 0.99)

    if filter_type == "lowpass":
        b, a = butter(order, low_n, btype="low")
        return lfilter(b, a, data)

    elif filter_type == "highpass":
        b, a = butter(order, low_n, btype="high")
        return lfilter(b, a, data)

    elif filter_type == "bandpass":
        b, a = butter(order, [low_n, high_n], btype="band")
        return lfilter(b, a, data)

    elif filter_type == "hann":
        return normalize_audio(hann_filter(data, freq1))

    elif filter_type == "blackman":
        return normalize_audio(blackman_filter(data, freq1))

    return data

# ======================================================
# ROUTES
# ======================================================

@app.route("/api/upload", methods=["POST"])
def upload_audio():
    file = request.files.get("audio")

    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    try:
        # Convert webm -> wav using pydub
        audio_segment = AudioSegment.from_file(file, format="webm")

        wav_io = io.BytesIO()
        audio_segment.export(wav_io, format="wav")
        wav_io.seek(0)

        audio_data, sr = sf.read(wav_io)

    except Exception as e:
        return jsonify({"error": f"Audio conversion failed: {str(e)}"}), 400

    if audio_data.ndim > 1:
        audio_data = audio_data.mean(axis=1)

    audio_id = str(uuid.uuid4())
    duration = len(audio_data) / sr

    audio_cache[audio_id] = {
        "data": audio_data,
        "sample_rate": sr,
        "duration": duration
    }

    return jsonify({
        "success": True,
        "audio_id": audio_id,
        "sample_rate": sr,
        "duration": duration
    })


@app.route("/api/process", methods=["POST"])
def process_audio():
    data = request.json
    audio_id = data["audio_id"]

    cached = audio_cache.get(audio_id)
    if not cached:
        return jsonify({"error": "Audio not found"}), 404

    audio = cached["data"]
    sr = cached["sample_rate"]
    duration = cached["duration"]

    filtered = filter_audio(
        audio,
        sr,
        data.get("filter_type", "lowpass"),
        float(data.get("freq1", 1000)),
        float(data.get("freq2", 4000)),
        int(data.get("order", 4))
    )

    times = np.linspace(0, duration, len(audio))
    step = max(1, len(times) // 5000)

    def to_b64(signal):
        buf = io.BytesIO()
        sf.write(buf, signal, sr, format="WAV")
        return base64.b64encode(buf.getvalue()).decode()

    return jsonify({
        "success": True,
        "times": times[::step].tolist(),
        "original": audio[::step].tolist(),
        "filtered": filtered[::step].tolist(),
        "original_audio": to_b64(audio),
        "filtered_audio": to_b64(filtered)
    })

@app.route("/api/add-noise", methods=["POST"])
def add_noise_endpoint():
    data = request.json
    audio_id = data["audio_id"]
    noise_level = float(data.get("noise_level", 0.1))

    cached = audio_cache.get(audio_id)
    if not cached:
        return jsonify({"error": "Audio not found"}), 404

    audio = cached["data"]
    sr = cached["sample_rate"]

    noisy_audio = add_random_noise(audio, noise_level)

    def to_b64(signal):
        buf = io.BytesIO()
        sf.write(buf, signal, sr, format="WAV")
        return base64.b64encode(buf.getvalue()).decode()

    return jsonify({
        "success": True,
        "original_audio": to_b64(audio),
        "noisy_audio": to_b64(noisy_audio)
    })

# ======================================================
# MODULATION ROUTE
# ======================================================

@app.route("/api/modulate", methods=["POST"])
def modulate_audio():
    data = request.json
    audio_id = data.get("audio_id")
    modulation_type = data.get("modulation_type")

    if audio_id not in audio_cache:
        return jsonify({"error": "Audio not found"}), 404

    cached = audio_cache[audio_id]
    audio = cached["data"]
    sr = cached["sample_rate"]
    duration = cached["duration"]

    if modulation_type == "am":
        depth = float(data.get("depth", 0.5))
        modulated = apply_amplitude_modulation(audio, sr, depth)

    elif modulation_type == "fm":
        freq = float(data.get("mod_freq", 1000))
        modulated = apply_frequency_modulation(audio, sr, freq)

    else:
        return jsonify({"error": "Invalid modulation type"}), 400

    # waveform sampling
    times = np.linspace(0, duration, len(audio))
    step = max(1, len(times) // 5000)

    def to_b64(signal):
        buf = io.BytesIO()
        sf.write(buf, signal, sr, format="WAV")
        return base64.b64encode(buf.getvalue()).decode()

    return jsonify({
        "success": True,
        "times": times[::step].tolist(),
        "original": audio[::step].tolist(),
        "modulated": modulated[::step].tolist(),
        "original_audio": to_b64(audio),
        "modulated_audio": to_b64(modulated),
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
