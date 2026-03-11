import axios from "axios";
import { getToken } from "../utils/session";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5555";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }
  return config;
});

export function getApiErrorMessage(error, fallback = "Request failed") {
  return error?.response?.data?.message || error?.message || fallback;
}

