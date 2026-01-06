import { api } from './api';

export interface EmailNotificationRequest {
  to: string;
  subject: string;
  template?: string;
  data?: Record<string, any>;
}

export interface PushNotificationRequest {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export const sendEmailNotification = async (data: EmailNotificationRequest) => {
  const res = await api.post('/notifications/email', data);
  return res.data;
};

export const sendPushNotification = async (data: PushNotificationRequest) => {
  const res = await api.post('/notifications/push', data);
  return res.data;
};
