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
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Handle 401 errors and token refresh
//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !originalRequest.url.includes("/generateNewTokens")
//     ) {
//       if (isRefreshing) {
//         // If refresh is in progress, queue the request
//         return new Promise(function (resolve, reject) {
//           failedQueue.push({
//             resolve: (token) => {
//               originalRequest.headers.Authorization = "Bearer " + token;
//               resolve(axiosInstance(originalRequest));
//             },
//             reject: (err) => {
//               reject(err);
//             },
//           });
//         });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       const refreshToken = localStorage.getItem("refreshToken");
     
      
//       try {
//         const response = await axios.post(
//           `${BASE_URL}/generateNewTokens`,
//           {},
//           {
//             headers: { Authorization: `Bearer ${refreshToken}` },
//             withCredentials: true,
//           }
//         ); 

//         if (response.data.success && response.data.accessToken) {
//           localStorage.setItem("token", response.data.accessToken);
//           sessionStorage.setItem("token", response.data.accessToken);
//           localStorage.setItem("refreshToken", response.data.refreshToken);

//           processQueue(null, response.data.accessToken);

//           originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
//           return axiosInstance(originalRequest);
//         }
//       } catch (refreshError) {
//         processQueue(refreshError, null);

//         const { store } = require("../redux/Store").configureStore();
//         store.dispatch(logoutUser());
//         // alert("Logout");
//         localStorage.removeItem("token");
//         localStorage.removeItem("userId");
//         localStorage.removeItem("refreshToken");
//         window.location.href = "/";
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export default axiosInstance;
