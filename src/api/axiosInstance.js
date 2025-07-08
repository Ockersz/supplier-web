import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: true, // Send cookies with every request
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = () => {
  failedQueue.forEach((cb) => cb());
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          await axiosInstance.post("/auth/refresh"); // assumes refresh tokens are in cookies
          isRefreshing = false;
          processQueue();
        } else {
          // Queue the request until refresh is complete
          await new Promise((resolve) => failedQueue.push(resolve));
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        failedQueue = [];

        // ✅ Redirect to login page if refresh fails
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
