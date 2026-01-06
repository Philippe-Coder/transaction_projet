import { api } from './api';
import QRCode from 'qrcode';

export interface QRCodeData {
  userId: string;
  fullName: string;
  phoneNumber: string;
  timestamp: number;
}

export interface QRGenerateResponse {
  qrCodeUrl: string;
  expiresAt: string;
}

// Génération QR via le backend
export const generateQR = async (data?: any) => {
  const res = await api.post('/qr/generate', data);
  return res.data as QRGenerateResponse;
};

// Génération QR locale (fallback)
export const generateLocalQRCode = async (userData: QRCodeData): Promise<string> => {
  try {
    const qrData = JSON.stringify(userData);
    return await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Impossible de générer le QR code');
  }
};

export const parseQRCodeData = (qrData: string): QRCodeData => {
  try {
    return JSON.parse(qrData);
  } catch (error) {
    console.error('Error parsing QR code data:', error);
    throw new Error('QR code invalide');
  }
};
