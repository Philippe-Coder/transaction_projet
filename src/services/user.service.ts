import { api } from './api';

// Services utilisateur
export const getMe = async () => {
  const res = await api.get('/users/me');
  return res.data;
};

export const updateProfile = async (data: {
  fullName: string;
  phone: string;
  phoneNumber?: string;
}) => {
  const res = await api.put('/users/me', {
    fullName: data.fullName,
    phone: data.phone,
    phoneNumber: data.phoneNumber || data.phone
  });
  return res.data;
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const res = await api.put('/users/change-password', data);
  return res.data;
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/users/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
};

// Services admin
export const getAdminProfile = async () => {
  const res = await api.get('/admin/profile');
  return res.data;
};

export const updateAdminProfile = async (data: {
  fullName: string;
  phone: string;
  phoneNumber?: string;
}) => {
  const res = await api.put('/admin/profile', {
    fullName: data.fullName,
    phone: data.phone,
    phoneNumber: data.phoneNumber || data.phone
  });
  return res.data;
};

export const changeAdminPassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const res = await api.put('/admin/change-password', data);
  return res.data;
};
