import { adminApi } from './adminApi';

export const getAllTransactions = async () => {
  console.log('🔵 admin.service: getAllTransactions called');
  try {
    const res = await adminApi.get('/admin/transactions');
    console.log('🔵 admin.service: getAllTransactions success:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ admin.service: getAllTransactions error:', error);
    throw error;
  }
};

export const getAllPayments = async () => {
  console.log('🔵 admin.service: getAllPayments called');
  try {
    const res = await adminApi.get('/admin/payments');
    console.log('🔵 admin.service: getAllPayments success:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ admin.service: getAllPayments error:', error);
    throw error;
  }
};

export const getAdminUsers = async () => {
  console.log('🔵 admin.service: getAdminUsers called');
  try {
    const res = await adminApi.get('/admin/users');
    console.log('🔵 admin.service: getAdminUsers success:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ admin.service: getAdminUsers error:', error);
    throw error;
  }
};

export const updateAdminUserStatus = async (id: string, isActive: boolean) => {
  console.log('🔵 admin.service: updateAdminUserStatus called with id:', id, 'and isActive:', isActive);
  try {
    const res = await adminApi.patch(`/admin/users/${id}/status`, { isActive });
    console.log('🔵 admin.service: updateAdminUserStatus success:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ admin.service: updateAdminUserStatus error:', error);
    throw error;
  }
};

export const getAdminTransactions = getAllTransactions;

export const getAdminPayments = getAllPayments;

export const getPaymentConfig = async () => {
  console.log('🔵 admin.service: getPaymentConfig called');
  try {
    const res = await adminApi.get('/admin/config');
    console.log('🔵 admin.service: getPaymentConfig success:', res.data);
    const configs = res.data as any[];
    if (!Array.isArray(configs) || configs.length === 0) return null;

    const fedapay = configs.find(
      (c) => String(c?.provider ?? '').toUpperCase() === 'FEDAPAY',
    );

    return fedapay ?? configs[0] ?? null;
  } catch (error) {
    console.error('❌ admin.service: getPaymentConfig error:', error);
    throw error;
  }
};

export const savePaymentConfig = async (payload: {
  provider: string;
  apiKey: string;
  secretKey: string;
}) => {
  console.log('🔵 admin.service: savePaymentConfig called with payload:', payload);
  try {
    const res = await adminApi.post('/admin/config', payload);
    console.log('🔵 admin.service: savePaymentConfig success:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ admin.service: savePaymentConfig error:', error);
    throw error;
  }
};

export const getAdminStats = async (days?: number) => {
  console.log('🔵 admin.service: getAdminStats called with days:', days);
  try {
    const res = await adminApi.get('/admin/stats', {
      params: days != null ? { days } : undefined,
    });
    console.log('🔵 admin.service: getAdminStats success:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ admin.service: getAdminStats error:', error);
    throw error;
  }
};