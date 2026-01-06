import { api } from './api';

import { getPaymentsDashboard } from './payment.service';

export const transferMoney = (
  receiverPhone: string,
  amount: number
) => {
  return api.post('/transactions/transfer', {
    receiverPhone,
    amount,
  });
};
export const getMyTransactions = async () => {
  const dashboard = await getPaymentsDashboard();
  return dashboard.transactions;
};
