import { createSlice } from "@reduxjs/toolkit";

const modulationSlice = createSlice({
  name: "modulation",
  initialState: {
    type: "am",
    amDepth: 50,
    fmFreq: 1000,
  },
  reducers: {
    setType: (state, action) => {
      state.type = action.payload;
    },
    setAmDepth: (state, action) => {
      state.amDepth = action.payload;
    },
    setFmFreq: (state, action) => {
      state.fmFreq = action.payload;
    },
  },
});

export const { setType, setAmDepth, setFmFreq } =
  modulationSlice.actions;

export default modulationSlice.reducer;
