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

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const url = error?.config?.url ?? '<unknown>';
    const status = error?.response?.status;

    if (error?.response) {
      // Gérer les erreurs HTTP standards
      if (status === 401) {
        // Token expiré ou invalide
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          // Rediriger vers la page de login si nécessaire
          window.location.href = '/login';
        }
      }
      
      // Logger l'erreur pour le debugging
      console.error(`API Error [${status}] on ${url}:`, error.response.data);
      
      return Promise.reject(error);
    }

    // Erreurs réseau ou autres
    console.error(`Network error on ${url}:`, error);
    return Promise.reject(error);
  }
);
