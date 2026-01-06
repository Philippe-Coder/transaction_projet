import { api } from './api';

export type FedapayCountry = 'BJ' | 'TG' | 'CI' | 'NE' | 'SN';

// Recharge de compte via le backend
export const rechargeAccount = (
  provider: string,
  amount: number,
  reference: string,
) => {
  return api.post('/payments/recharge', { provider, amount, reference });
};

export const getPaymentsDashboard = async () => {
  const res = await api.get('/payments/dashboard');
  return res.data as {
    balance: number;
    transactions: any[];
    payments: any[];
  };
};

export const initFedapayRecharge = async (payload: {
  amount: number;
  callbackUrl?: string;
}) => {
  const res = await api.post('/payments/fedapay/recharge', {
    amount: Math.round(payload.amount),
    ...(payload.callbackUrl ? { callbackUrl: payload.callbackUrl } : {}),
  });

  return res.data as {
    paymentId: string;
    reference: string;
    transactionId: number | string;
    publicKey: string;
    token?: string;
    paymentUrl?: string;
    environment?: 'live' | 'sandbox';
    paymentMethod?: string;
    customerPhone?: string;
    detectedCountry?: string;
    mobileOperator?: string;
    operatorName?: string;
    message?: string;
    status?: string;
  };
};

// Vérifier le statut d'une recharge FedaPay
export const getRechargeStatus = async (paymentId: string) => {
  const res = await api.get(`/payments/fedapay/status/recharge/${paymentId}`);
  return res.data;
};

// Vérifier le statut d'une transaction FedaPay
export const getTransactionStatus = async (transactionId: string) => {
  const res = await api.get(`/payments/fedapay/status/transaction/${transactionId}`);
  return res.data;
};

// Configuration FedaPay via le backend (utilise l'endpoint générique)
export const configureFedaPay = (config: {
  apiKey: string;
  secretKey: string;
}) => {
  return api.post('/admin/config', {
    provider: 'FEDAPAY',
    apiKey: config.apiKey,
    secretKey: config.secretKey
  });
};

export const getFedaPayConfig = () => {
  return api.get('/admin/config');
};
