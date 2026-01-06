import { api } from './api';

export interface QRGenerateResponse {
  qrCodeUrl: string;
  expiresAt: string;
}

export interface MerchantPaymentRequest {
  merchantId: string;
  amount: number;
  description?: string;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface MerchantPaymentResponse {
  paymentId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  amount: number;
  merchantId: string;
  createdAt: string;
}

export const generateQR = async (data?: any) => {
  const res = await api.post('/qr/generate', data);
  return res.data as QRGenerateResponse;
};

export const createMerchantPayment = async (data: MerchantPaymentRequest) => {
  const res = await api.post('/merchant/payment', data);
  return res.data as MerchantPaymentResponse;
};

export const getMerchantPayments = async (merchantId: string) => {
  const res = await api.get(`/merchant/payments/${merchantId}`);
  return res.data as MerchantPaymentResponse[];
};

export const validateMerchantPayment = async (paymentId: string) => {
  const res = await api.post(`/merchant/payment/${paymentId}/validate`);
  return res.data as MerchantPaymentResponse;
};
