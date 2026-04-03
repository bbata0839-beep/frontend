import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://backend-j3u1.onrender.com",
  timeout: 30000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || (() => {
    const v = document.cookie.match(`(^|;) ?auth_token=([^;]*)(;|$)`);
    return v ? v[2] : null;
  })();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

