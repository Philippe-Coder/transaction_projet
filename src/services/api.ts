import axios from 'axios';

let baseURL = (import.meta.env.VITE_API_URL ?? '').trim();

if (baseURL && !/^https?:\/\//i.test(baseURL)) {
  baseURL = `http://${baseURL}`;
}

if (!baseURL && typeof window !== 'undefined') {
  console.warn(
    'VITE_API_URL is not set; falling back to http://localhost:3001',
  );
}

export const api = axios.create({
  baseURL: baseURL || 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }

  return config;
});
