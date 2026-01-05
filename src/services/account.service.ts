import { api } from './api';

export const getMyAccount = async () => {
  const res = await api.get('/accounts/me');
  return res.data;
};
