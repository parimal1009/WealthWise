import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../slices/counterSlice";
import learningPageReducer from "../slices/learningPage";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    learningPage: learningPageReducer,
  },
});
