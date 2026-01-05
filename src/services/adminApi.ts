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

export const adminApi = axios.create({
  baseURL: baseURL || 'http://localhost:3001',
  timeout: 10000, // 10s timeout to avoid requests hanging indefinitely
});

adminApi.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('admin_token')
      : null;

  console.log('🔵 adminApi: Making request to:', config.url);
  console.log('🔵 adminApi: Token exists:', !!token);
  console.log('🔵 adminApi: Token (first 20 chars):', token ? token.substring(0, 20) + '...' : 'none');

  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }

  return config;
});

adminApi.interceptors.response.use(
  (response) => {
    console.log('🔵 adminApi: Response success for:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    const url = error?.config?.url ?? '<unknown>';
    const status = error?.response?.status;
    console.error('❌ adminApi: Response error for:', url, 'Status:', status ?? 'no-status');

    if (error?.code === 'ECONNABORTED') {
      console.error('❌ adminApi: Request timeout or aborted for:', url);
      return Promise.reject(new Error('Request timeout'));
    }

    if (error?.response) {
      console.error('❌ adminApi: Error data:', error.response.data);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const last = {
            url,
            status: status ?? null,
            data: error.response.data,
            timestamp: Date.now(),
          };
          localStorage.setItem('admin_api_last_error', JSON.stringify(last));
        }
      } catch (e) {
        /* ignore localStorage errors */
      }
      return Promise.reject(error);
    }

    console.error('❌ adminApi: Network or unknown error:', error);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const last = { url, status: null, data: String(error), timestamp: Date.now() };
        localStorage.setItem('admin_api_last_error', JSON.stringify(last));
      }
    } catch (e) {}
    return Promise.reject(error);
  }
);
