import axios from "axios";
import {
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  SIGNUP_SUCCESS,
  SIGNUP_FAILURE,
  LOGOUT,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAILURE,
  LOAD_FAILURE,
  LOAD_SUCCESS
} from "../Constants/userConstant";

// Function to set cookie
const setCookie = (name, value, days) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
};

export const login = (email, password) => {
  return async (dispatch) => {
    try {
      // Simulate API call for login
      const response = await axios.post(
        "/api/user/login",
        { email, password }
      );

      const token = response.data.token;
      setCookie("jwt", token, 1); // Set cookie expiry for 1 day
      // console.log(token);
      console.log("Response Data:", JSON.stringify(response.data, null, 2));
      dispatch({ type: LOGIN_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: LOGIN_FAILURE, payload: error.message });
    }
  };
};

export const load = () => async (dispatch) => {
  try {
    
    
    const { data } = await axios.get(
      "/api/user/profile"
    );

    dispatch({ type: LOAD_SUCCESS, payload: data.user });
  } catch (error) {
    dispatch({ type: LOAD_FAILURE, payload: error.response.data.message });
  }
};

export const signup = (name, email, password) => {
  return async (dispatch) => {
    try {
      // Simulate API call for signup
      const response = await axios.post(
        "/api/user/register",
        { name, email, password }
      );
      dispatch({ type: SIGNUP_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: SIGNUP_FAILURE, payload: error.message });
    }
  };
};

export const logout = () => {
  return { type: LOGOUT };
};

export const forgotPassword = (email) => {
  return async (dispatch) => {
    try {
      // Simulate API call for forgot password
      const response = await axios.post(
        "/api/user/forgotpassword",
        { email }
      );
      dispatch({ type: FORGOT_PASSWORD_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FORGOT_PASSWORD_FAILURE, payload: error.message });
    }
  };
};
