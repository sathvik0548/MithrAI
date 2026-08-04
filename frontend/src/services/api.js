import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://mithrai-backend.onrender.com/api",
});

// Automatically attach Supabase access token from localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;