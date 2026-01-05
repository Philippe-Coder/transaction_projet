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
  customerCountry: FedapayCountry;
  callbackUrl?: string;
}) => {
  const res = await api.post('/payments/fedapay/init', {
    amount: payload.amount,
    customerCountry: payload.customerCountry,
    ...(payload.callbackUrl ? { callbackUrl: payload.callbackUrl } : {}),
  });

  return res.data as {
    paymentId: string;
    reference: string;
    transactionId: number | string;
    publicKey: string;
    token?: string;
    environment?: 'live' | 'sandbox';
  };
};

export const createPayment = async (data: {
  amount: number;
  method: 'card' | 'mobile';
  description: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardHolder?: string;
  phoneNumber?: string;
  operator?: string;
}) => {
  const res = await api.post('/payments/create', data);
  return res.data;
};

export const createTransfer = async (data: {
  amount: number;
  recipient: string;
  description: string;
  method: 'card' | 'mobile';
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardHolder?: string;
  phoneNumber?: string;
  operator?: string;
}) => {
  const res = await api.post('/transfers/create', data);
  return res.data;
};

// Vérifier le statut d'une transaction via le backend
export const getTransactionStatus = async (transactionId: number) => {
  const res = await api.get(`/payments/transaction-status/${transactionId}`);
  return res.data;
};

// Configuration FedaPay via le backend
export const configureFedaPay = (config: {
  apiKey: string;
  secretKey: string;
  environment: 'sandbox' | 'live';
}) => {
  return api.post('/admin/fedapay/config', config);
};

export const getFedaPayConfig = () => {
  return api.get('/admin/fedapay/config');
};
