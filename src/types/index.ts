export interface User {
  id: string;
  email: string;
  fullName: string | null;
  phone: string;
  profileImageUrl: string | null;
  isActive: boolean;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  password?: string; // Présent dans la réponse backend mais ne devrait pas être utilisé côté frontend
  googleId?: string | null;
}

export interface Account {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'TRANSFER' | 'RECHARGE';
  amount: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  createdAt: string;
  accountId: string;
  account?: {
    id: string;
    userId: string;
    user?: {
      id: string;
      email: string;
      role: string;
    };
  };
}

export interface Payment {
  id: string;
  provider: string;
  amount: number;
  reference: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  createdAt: string;
  userId: string;
  user: {
    id: string;
    email: string;
    password: string; // Présent dans la réponse backend
    googleId: string | null;
    role: 'USER' | 'ADMIN';
    fullName: string | null;
    phone: string;
    profileImageUrl: string | null;
    isActive: boolean;
    createdAt: string;
  };
}

export interface Dashboard {
  balance: number;
  transactions: Transaction[];
  payments: Payment[];
}

export interface AdminStats {
  totalUsers: number;
  totalTransactions: number;
  totalRecharges: number;
  volume: {
    transactions: number;
    recharges: number;
    total: number;
  };
  daily: DailyStats[];
  range: {
    days: number;
    start: string;
    end: string;
  };
}

export interface DailyStats {
  date: string;
  transactionsCount: number;
  transactionsAmount: number;
  rechargesCount: number;
  rechargesAmount: number;
  volumeAmount: number;
}

export interface PaymentConfig {
  id: string;
  provider: string;
  apiKey: string;
  secretKey: string;
  createdAt: string;
}
