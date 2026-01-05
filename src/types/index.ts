export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  phone?: string; // Alias pour phoneNumber
  profileImageUrl?: string | null;
  isActive?: boolean;
  role?: 'USER' | 'ADMIN';
  createdAt?: string;
  balance?: number; // Solde du compte
}

export interface Account {
  id: string;
  userId: string;
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  fromAccountId: string | null;
  toAccountId: string | null;
  amount: number;
  type: 'recharge' | 'transfer' | 'receive';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
  recipientName?: string;
  senderName?: string;
}
