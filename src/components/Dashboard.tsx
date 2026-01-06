import { useEffect, useState } from 'react';
import {
  Wallet,
  Send,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  LogOut,
  Menu,
  UserCircle,
  Settings,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Transaction } from '../types';
import RechargeModal from './RechargeModal';
import TransferModal from './TransferModal';
import { getMyTransactions } from '../services/transaction.service';
import { getPaymentsDashboard } from '../services/payment.service';

export default function Dashboard() {
  const { user, account, logout, updateBalance } = useAuth();
  const navigate = useNavigate();

  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mapTransaction = (raw: any): Transaction => ({
    id: String(raw?.id ?? raw?._id ?? Date.now()),
    type: raw?.type === 'recharge' ? 'RECHARGE' : 'TRANSFER',
    amount: Number(raw?.amount ?? 0),
    status: raw?.status === 'completed' ? 'SUCCESS' : raw?.status === 'failed' ? 'FAILED' : 'SUCCESS',
    createdAt: raw?.createdAt ?? new Date().toISOString(),
    accountId: raw?.accountId ?? '',
    account: raw?.account
  });

  const refresh = async () => {
    setError(null);
    try {
      const [txs, dashboard] = await Promise.all([
        getMyTransactions(),
        getPaymentsDashboard()
      ]);

      if (dashboard?.balance) updateBalance(dashboard.balance);
      setTransactions((txs || []).map(mapTransaction));
    } catch (e: any) {
      setError('Impossible de charger le tableau de bord');
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR').format(amount);

  const calculateMonthlyStats = (transactions: Transaction[], type: 'TRANSFER' | 'RECHARGE') => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions
      .filter(t => t.type === type)
      .filter(t => {
        const date = new Date(t.createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Wallet className="w-8 h-8 text-emerald-600" />
              <h1 className="text-xl font-bold text-gray-900">Transaction App</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profil')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <UserCircle className="w-5 h-5" />
                <span className="hidden sm:block">{user?.fullName || 'Profil'}</span>
              </button>
              
              <button
                onClick={() => navigate('/parametres')}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                    <button
                      onClick={() => {
                        setShowLogoutConfirm(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-3 flex gap-2 text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4" /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* SOLDE ET ACTIONS */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-4 sm:p-6 lg:p-8 rounded-2xl text-white mb-6 sm:mb-8">
          <p className="opacity-80 text-sm sm:text-base">Solde disponible</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
            {formatCurrency(account?.balance || 0)} XOF
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              onClick={() => setShowRechargeModal(true)}
              className="bg-white text-emerald-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" /> 
              <span className="text-sm sm:text-base">Recharger</span>
            </button>
            <button
              onClick={() => setShowTransferModal(true)}
              className="border border-white/40 px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-white/20 transition-colors"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" /> 
              <span className="text-sm sm:text-base">Envoyer</span>
            </button>
            <button
              onClick={() => navigate('/historique')}
              className="border border-white/40 px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-white/20 transition-colors"
            >
              <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" /> 
              <span className="text-sm sm:text-base">Historique</span>
            </button>
          </div>
        </div>

        {/* STATISTIQUES */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <ArrowUpRight className="text-red-600 w-5 h-5" />
              <h3 className="font-semibold text-gray-900">Envoyé ce mois</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(calculateMonthlyStats(transactions, 'TRANSFER'))} XOF
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <ArrowDownLeft className="text-green-600 w-5 h-5" />
              <h3 className="font-semibold text-gray-900">Reçu ce mois</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(calculateMonthlyStats(transactions, 'RECHARGE'))} XOF
            </p>
          </div>
        </div>

        {/* DERNIÈRES TRANSACTIONS */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dernières transactions</h3>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    transaction.type === 'RECHARGE' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'RECHARGE' ? 
                      <ArrowDownLeft className="w-4 h-4 text-green-600" /> :
                      <ArrowUpRight className="w-4 h-4 text-red-600" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.type === 'RECHARGE' ? 'Recharge' : 'Transfert'}
                    </p>
                    <p className="text-sm text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'RECHARGE' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'RECHARGE' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">{transaction.status}</p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-gray-500 py-8">Aucune transaction</p>
            )}
          </div>
          {transactions.length > 5 && (
            <button
              onClick={() => navigate('/historique')}
              className="w-full mt-4 text-center text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Voir tout l'historique
            </button>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showRechargeModal && (
        <RechargeModal onClose={() => setShowRechargeModal(false)} onComplete={refresh} />
      )}

      {showTransferModal && (
        <TransferModal onClose={() => setShowTransferModal(false)} />
      )}

      {/* CONFIRM LOGOUT */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-3">Confirmation</h3>
            <p className="mb-6">Voulez-vous vraiment vous déconnecter ?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="border px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Non
              </button>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Oui
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
