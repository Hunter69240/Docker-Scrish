import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  audioId: null,
  fileName: null,
  duration: null,
  sampleRate: null,
  uploaded: false,
};

const audioSlice = createSlice({
  name: "audio",
  initialState,
  reducers: {
    setAudio: (state, action) => {
      state.audioId = action.payload.audioId;
      state.fileName = action.payload.fileName;
      state.duration = action.payload.duration;
      state.sampleRate = action.payload.sampleRate;
      state.uploaded = true;
    },
    clearAudio: (state) => {
      state.audioId = null;
      state.fileName = null;
      state.duration = null;
      state.sampleRate = null;
      state.uploaded = false;
    },
  },
});

export const { setAudio, clearAudio } = audioSlice.actions;
export default audioSlice.reducer;
