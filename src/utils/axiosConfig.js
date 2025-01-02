import axios from "axios";
import { refreshTheAccessToken } from "./authUtils";

const ACC_BACKEND_BASE_URL = process.env.NEXT_PUBLIC_ACC_BACKEND_BASE_URL;

// Axios instance for authentication backend
export const axiosAccPublic = axios.create({
  timeout: 10000,
  headers: {
    "Content-type": "application/json",
  },
  baseURL: ACC_BACKEND_BASE_URL,
});

// Attach accessToken to all requests
const attachAccessToken = (config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
};

export const axiosWithToken = axios.create({
  timeout: 10000,
  headers: {
    "Content-type": "application/json",
  },
  baseURL: ACC_BACKEND_BASE_URL,
});

axiosWithToken.interceptors.request.use(attachAccessToken);

// Add retry logic
axiosWithToken.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;

    if (!originalConfig._retry && (error.response?.status === 401 || error.code === "ECONNABORTED")) {
      console.log("Token Expired, Retrying");
      originalConfig._retry = true;

      try {
        const newAccessToken = await refreshTheAccessToken();
        if (newAccessToken) {
          originalConfig.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return await axiosWithToken(originalConfig);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
