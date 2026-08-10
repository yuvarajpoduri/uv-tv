import axios from "axios";

function resolveBaseURL(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw) return "/api";
  const trimmed = raw.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

export const api = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (res.config.method?.toLowerCase() === "get" && res.config.url) {
      try {
        const cacheKey = "cache_" + res.config.url + JSON.stringify(res.config.params || {});
        localStorage.setItem(cacheKey, JSON.stringify(res.data));
      } catch (e) {}
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
    }

    if (err.config && err.config.method?.toLowerCase() === "get" && err.config.url) {
      try {
        const cacheKey = "cache_" + err.config.url + JSON.stringify(err.config.params || {});
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          return Promise.resolve({
            data: JSON.parse(cached),
            status: 200,
            statusText: "OK (Offline Cache)",
            headers: {},
            config: err.config
          });
        }
      } catch (e) {}
    }

    return Promise.reject(err);
  }
);
