import axios from "axios";
import { getToken } from "./auth";

const axiosApi = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
});

// Add a request interceptor
axiosApi.interceptors.request.use(
  function (config) {
    const token = getToken();
    // console.log(token)
    config.headers = {
      Authorization: `Bearer ${token}`,
    };
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// Add a response interceptor
axiosApi.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response.status === 403) {
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default axiosApi;
