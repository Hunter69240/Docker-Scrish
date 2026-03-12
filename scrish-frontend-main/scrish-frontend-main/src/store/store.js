import { configureStore } from "@reduxjs/toolkit";
import audioReducer from "./audioSlice";
import modulationReducer from "./modulationSlice";

const store = configureStore({
  reducer: {
    audio: audioReducer,
    modulation:modulationReducer
  },
});

export default store;
