import { api } from './api';

import { getPaymentsDashboard } from './payment.service';

export const transferMoney = (
  network: string,
  receiverPhone: string,
  amount: number,
  description?: string
) => {
  return api.post('/transactions/transfer', {
    network,
    receiverPhone,
    amount,
    description,
  });
};
export const getMyTransactions = async () => {
  const dashboard = await getPaymentsDashboard();
  return dashboard.transactions;
};
