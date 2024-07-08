import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { thunk } from "redux-thunk";
import authReducer from "../Reducers/userReducer";

const store = configureStore({
  reducer: {
    auth: authReducer, // Assuming authReducer manages authentication state
    // Add more reducers here if needed
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
  // Add other store configurations if needed
});

export default store;