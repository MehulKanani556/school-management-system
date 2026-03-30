import axios from "axios";
    import { BASE_URL } from "./BASE_URL";
import { logoutUser } from "../redux/slice/auth.slice";

const userId = localStorage.getItem("userId");

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    const academicYearId = localStorage.getItem("activeAcademicYearId");
    if (academicYearId) {
        config.headers['x-academic-year-id'] = academicYearId;
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 1. Handle Maintenance Mode
    if (error.response?.status === 503 && error.response.data?.code === 'MAINTENANCE_ACTIVE') {
      window.location.href = "/maintenance";
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // 2. Handle 401 errors and token refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/generatenewtoken")
    ) {
      if (isRefreshing) {
        // If refresh is in progress, queue the request
        return new Promise(function (resolve, reject) {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = "Bearer " + token;
              resolve(axiosInstance(originalRequest));
            },
            reject: (err) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
     
      
      try {
        const response = await axios.post(
          `${BASE_URL}/generatenewtoken`,
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
            withCredentials: true,
          }
        ); 

        if (response.data.success && response.data.accessToken) {
          localStorage.setItem("token", response.data.accessToken);
          localStorage.setItem("refreshToken", response.data.refreshToken);

          processQueue(null, response.data.accessToken);

          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
