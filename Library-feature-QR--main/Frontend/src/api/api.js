// [file name]: api.js - UPDATED
import axios from "axios";
import toast from "react-hot-toast";

// Create API instance with better configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Reduced timeout
  withCredentials: false,
});

// Add request interceptor to log URLs
API.interceptors.request.use(
  (config) => {
    console.log(
      `🔄 API Call: ${config.method?.toUpperCase()} ${config.baseURL}${
        config.url
      }`
    );
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
API.interceptors.response.use(
  (response) => {
    console.log(`✅ Success: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("❌ API Error Details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    });

    if (error.response) {
      // Server responded with error status
      const errorMessage =
        error.response.data?.message || `Error: ${error.response.status}`;
      toast.error(errorMessage);
    } else if (error.request) {
      // Request made but no response received
      console.error("No response received:", error.request);
      toast.error(
        "Backend server is not running. Please start the server on port 5000."
      );
    } else {
      // Something else happened
      toast.error("Network error: " + error.message);
    }

    return Promise.reject(error);
  }
);

export const bookAPI = {
  getAll: () => API.get("/books"),
  getById: (id) => API.get(`/books/${id}`),
  create: (data) => API.post("/books", data),
};

export const studentAPI = {
  getAll: () => API.get("/students"),
  create: (data) => API.post("/students", data),
};

export const transactionAPI = {
  getAll: (params) => API.get("/transactions", { params }),
  issue: (data) => API.post("/transactions/issue", data),
  return: (data) => API.post("/transactions/return", data),
};

export default API;
