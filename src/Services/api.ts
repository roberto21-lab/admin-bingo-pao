import axios from "axios";

// Vite
console.log("🚀 ~ env.VITE_API_URL:", import.meta.env.VITE_API_URL)
const BASE_URL = import.meta.env.VITE_API_URL;
// CRA (si usas create-react-app), usarías: process.env.REACT_APP_API_URL

export const api = axios.create({
  baseURL: BASE_URL,
  // Si tu back exige credenciales/cookies:
  // withCredentials: true,
});

// Interceptor opcional para token (si usas JWT)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // ajusta a tu storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
