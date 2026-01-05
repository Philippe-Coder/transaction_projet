import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Account } from '../types';
import { login as loginService, register as registerService } from '../services/auth.service';
import { getMe } from '../services/user.service';
import { getPaymentsDashboard } from '../services/payment.service';

interface AuthContextType {
  user: User | null;
  account: Account | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    fullName: string,
    phoneNumber: string,
    profileImageUrl?: string,
  ) => Promise<void>;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
  updateUser: (userData: Partial<User>) => void;
  // Admin functions
  admin: User | null;
  isAdmin: boolean;
  setAdmin: (adminData: User) => void;
  updateAdmin: (adminData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<User | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedAccount = localStorage.getItem('account');

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedAccount) {
      setAccount(JSON.parse(storedAccount));
    }

    if (storedToken) {
      void (async () => {
        try {
          const [me, dashboard] = await Promise.all([
            getMe(),
            getPaymentsDashboard(),
          ]);

          const rawUser = (me as any)?.user ?? (me as any)?.profile ?? (me as any);
          const rawAccount = (me as any)?.account ?? (me as any)?.wallet ?? (me as any)?.accountData;

          const mappedAccount: Account = {
            id: String(rawAccount?.id ?? rawAccount?.accountId ?? 'me'),
            userId: String(
              rawAccount?.userId ?? rawUser?.id ?? rawUser?.userId ?? 'me',
            ),
            balance: Number(dashboard?.balance ?? rawAccount?.balance ?? 0),
            currency: String(rawAccount?.currency ?? 'XOF'),
          };

          const mappedUser: User = {
            id: String(rawUser?.id ?? rawUser?.userId ?? 'me'),
            email: String(rawUser?.email ?? ''),
            fullName: String(rawUser?.fullName ?? rawUser?.name ?? rawUser?.email ?? ''),
            phoneNumber: String(rawUser?.phoneNumber ?? rawUser?.phone ?? ''),
            profileImageUrl:
              rawUser?.profileImageUrl != null ? String(rawUser.profileImageUrl) : null,
            isActive:
              typeof rawUser?.isActive === 'boolean' ? rawUser.isActive : undefined,
          };

          setAccount(mappedAccount);
          setUser(mappedUser);
          localStorage.setItem('account', JSON.stringify(mappedAccount));
          localStorage.setItem('user', JSON.stringify(mappedUser));
        } catch {
          setToken(null);
          setUser(null);
          setAccount(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('account');
        }
      })();
    }
  }, []);

  const login = async (email: string, password: string) => {
    const auth = await loginService(email, password);
    setToken(auth.access_token);

    const [me, dashboard] = await Promise.all([
      getMe(),
      getPaymentsDashboard(),
    ]);

    const rawUser = (me as any)?.user ?? (me as any)?.profile ?? (me as any);
    const rawAccount = (me as any)?.account ?? (me as any)?.wallet ?? (me as any)?.accountData;

    const mappedAccount: Account = {
      id: String(rawAccount?.id ?? rawAccount?.accountId ?? 'me'),
      userId: String(rawAccount?.userId ?? rawUser?.id ?? rawUser?.userId ?? 'me'),
      balance: Number(dashboard?.balance ?? rawAccount?.balance ?? 0),
      currency: String(rawAccount?.currency ?? 'XOF'),
    };

    const mappedUser: User = {
      id: String(rawUser?.id ?? rawUser?.userId ?? 'me'),
      email: String(rawUser?.email ?? email),
      fullName: String(rawUser?.fullName ?? rawUser?.name ?? email),
      phoneNumber: String(rawUser?.phoneNumber ?? rawUser?.phone ?? ''),
      profileImageUrl:
        rawUser?.profileImageUrl != null ? String(rawUser.profileImageUrl) : null,
      isActive: typeof rawUser?.isActive === 'boolean' ? rawUser.isActive : undefined,
    };

    setUser(mappedUser);
    setAccount(mappedAccount);
    localStorage.setItem('user', JSON.stringify(mappedUser));
    localStorage.setItem('account', JSON.stringify(mappedAccount));
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    phoneNumber: string,
    profileImageUrl?: string,
  ) => {
    await registerService(email, password, {
      fullName,
      phone: phoneNumber,
      profileImageUrl,
    });
    const auth = await loginService(email, password);
    setToken(auth.access_token);

    const [me, dashboard] = await Promise.all([
      getMe(),
      getPaymentsDashboard(),
    ]);

    const rawUser = (me as any)?.user ?? (me as any)?.profile ?? (me as any);
    const rawAccount = (me as any)?.account ?? (me as any)?.wallet ?? (me as any)?.accountData;

    const mappedAccount: Account = {
      id: String(rawAccount?.id ?? rawAccount?.accountId ?? 'me'),
      userId: String(rawAccount?.userId ?? rawUser?.id ?? rawUser?.userId ?? 'me'),
      balance: Number(dashboard?.balance ?? rawAccount?.balance ?? 0),
      currency: String(rawAccount?.currency ?? 'XOF'),
    };

    const mappedUser: User = {
      id: String(rawUser?.id ?? rawUser?.userId ?? 'me'),
      email: String(rawUser?.email ?? email),
      fullName: String(rawUser?.fullName ?? rawUser?.name ?? fullName ?? email),
      phoneNumber: String(rawUser?.phoneNumber ?? rawUser?.phone ?? phoneNumber ?? ''),
      profileImageUrl:
        rawUser?.profileImageUrl != null ? String(rawUser.profileImageUrl) : null,
      isActive: typeof rawUser?.isActive === 'boolean' ? rawUser.isActive : undefined,
    };

    setUser(mappedUser);
    setAccount(mappedAccount);
    localStorage.setItem('user', JSON.stringify(mappedUser));
    localStorage.setItem('account', JSON.stringify(mappedAccount));
  };

  const logout = () => {
    setUser(null);
    setAccount(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('account');
    localStorage.removeItem('token');
  };

  const updateBalance = (newBalance: number) => {
    if (account) {
      const updatedAccount = { ...account, balance: newBalance };
      setAccount(updatedAccount);
      localStorage.setItem('account', JSON.stringify(updatedAccount));
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const updateAdmin = (adminData: Partial<User>) => {
    if (admin) {
      const updatedAdmin = { ...admin, ...adminData };
      setAdmin(updatedAdmin);
      localStorage.setItem('admin', JSON.stringify(updatedAdmin));
    }
  };

  const setAdminData = (adminData: User) => {
    setAdmin(adminData);
    localStorage.setItem('admin', JSON.stringify(adminData));
  };

  const loginWithGoogle = async (token: string) => {
    // Sauvegarder le token
    localStorage.setItem('token', token);
    setToken(token);

    // Récupérer les informations utilisateur avec le nouveau token
    const [me, dashboard] = await Promise.all([
      getMe(),
      getPaymentsDashboard(),
    ]);

    const rawUser = (me as any)?.user ?? (me as any)?.profile ?? (me as any);
    const rawAccount = (me as any)?.account ?? (me as any)?.wallet ?? (me as any)?.accountData;

    const mappedAccount: Account = {
      id: String(rawAccount?.id ?? rawAccount?.accountId ?? 'me'),
      userId: String(
        rawAccount?.userId ?? rawUser?.id ?? rawUser?.userId ?? 'me',
      ),
      balance: Number(dashboard?.balance ?? rawAccount?.balance ?? 0),
      currency: String(rawAccount?.currency ?? 'XOF'),
    };

    const mappedUser: User = {
      id: String(rawUser?.id ?? rawUser?.userId ?? 'me'),
      email: String(rawUser?.email ?? ''),
      fullName: String(rawUser?.fullName ?? rawUser?.name ?? rawUser?.email ?? ''),
      phoneNumber: String(rawUser?.phoneNumber ?? rawUser?.phone ?? ''),
      profileImageUrl:
        rawUser?.profileImageUrl != null ? String(rawUser.profileImageUrl) : null,
      isActive:
        typeof rawUser?.isActive === 'boolean' ? rawUser.isActive : undefined,
    };

    setUser(mappedUser);
    setAccount(mappedAccount);
    localStorage.setItem('user', JSON.stringify(mappedUser));
    localStorage.setItem('account', JSON.stringify(mappedAccount));
  };

  return (
    <AuthContext.Provider value={{
      user,
      account,
      isAuthenticated: !!token,
      login,
      loginWithGoogle,
      signup,
      logout,
      updateBalance,
      updateUser,
      admin,
      isAdmin: !!admin,
      setAdmin: setAdminData,
      updateAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
