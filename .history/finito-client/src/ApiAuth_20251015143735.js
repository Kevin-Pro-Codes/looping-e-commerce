import axios from "axios";

const ApiAuth = axios.create({
  baseURL: import.meta.env.VITE_API_AUTH_URL || "http://localhost:8000",
  withCredentials: true,
});

// ✅ Interceptor: automatically attach CSRF token if present
ApiAuth.interceptors.request.use((config) => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];

  if (token) {
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
  }

  // ✅ If JWT exists, attach as Bearer
  const jwt = localStorage.getItem("token");
  if (jwt) {
    config.headers["Authorization"] = `Bearer ${jwt}`;
  }

  config.headers["Accept"] = "application/json";
  config.headers["X-Requested-With"] = "XMLHttpRequest";
  return config;
});

export default ApiAuth;
