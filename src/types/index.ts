export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  profileImageUrl?: string | null;
  isActive?: boolean;
  role?: 'USER' | 'ADMIN';
  createdAt?: string;
}

export interface Account {
  id: string;
  userId: string;
  balance: number;
  createdAt?: string;
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
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface Dashboard {
  balance: number;
  transactions: Transaction[];
  payments: Payment[];
}
