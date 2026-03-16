import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || "https://hackathon-oazt.onrender.com";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
});

// Helper to fix Django relative image paths
export const makeImgUrl = (path) => {
  if (!path) return null;
  
  // If path is a Cloudinary object instead of a string
  const url = typeof path === "string" ? path : path.url;
  if (!url) return null;

  if (url.startsWith("http")) return url; // Already absolute (Cloudinary etc.)
  return `${BASE_URL}${url}`; // Relative path — prepend base URL
};

// Request Interceptor: Attach Access Token + Language
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Send language preference to backend for AI responses
    const lang = localStorage.getItem("language") || "en";
    config.headers["Accept-Language"] = lang;
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Silent Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const res = await axios.post(
          `${BASE_URL}/api/token/refresh/`,
          {
            refresh: refreshToken,
          },
        );
        if (res.status === 200) {
          localStorage.setItem("access_token", res.data.access);
          api.defaults.headers.common["Authorization"] =
            `Bearer ${res.data.access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
