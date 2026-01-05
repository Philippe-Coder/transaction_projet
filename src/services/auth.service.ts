import { api } from './api';

export type AuthTokenResponse = { access_token: string };

export const register = async (
  email: string,
  password: string,
  payload?: {
    fullName?: string;
    phone?: string;
    profileImageUrl?: string;
  },
) => {
  const res = await api.post('/auth/register', {
    email,
    password,
    ...(payload?.fullName != null ? { fullName: payload.fullName } : {}),
    ...(payload?.phone != null ? { phone: payload.phone } : {}),
    ...(payload?.profileImageUrl != null
      ? { profileImageUrl: payload.profileImageUrl }
      : {}),
  });
  return res.data as {
    message: string;
    userId: string;
    accountId: string;
    balance: number;
  };
};

export const login = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password });
  const data = res.data as AuthTokenResponse;

  if (typeof window !== 'undefined') {
    localStorage.setItem('token', data.access_token);
  }

  return data;
};

export const adminRegister = async (
  email: string,
  password: string,
  phone: string,
  secret: string,
) => {
  const res = await api.post('/admin/auth/register', {
    email,
    password,
    phone,
    secret,
  });
  return res.data as { message: string; userId: string };
};


export const adminLogin = async (email: string, password: string) => {
  const res = await api.post('/admin/auth/login', { email, password });
  const data = res.data as AuthTokenResponse;

  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_token', data.access_token);
  }

  return data;
};

// Google OAuth
export const loginWithGoogle = () => {
  // Rediriger vers l'endpoint Google OAuth du backend
  window.location.href = `${api.defaults.baseURL}/auth/google`;
};

export const handleGoogleCallback = async (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
  return { access_token: token };
};
