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
  QrCode,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Transaction } from '../types';
import RechargeModal from './RechargeModal';
import TransferModal from './TransferModal';
import ReceiveModal from './ReceiveModal';
import TransactionHistory from './TransactionHistory';
import DashboardSidebar from './DashboardSidebar';
import { getMyTransactions } from '../services/transaction.service';
import { getPaymentsDashboard } from '../services/payment.service';


export default function Dashboard() {
  const { user, account, logout, updateBalance } = useAuth();

  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [section, setSection] = useState<'recharges' | 'transactions'>('recharges');
  const [status, setStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const mapTransaction = (raw: any): Transaction => ({
    id: String(raw?.id ?? raw?._id ?? Date.now()),
    fromAccountId: raw?.fromAccountId ?? null,
    toAccountId: raw?.toAccountId ?? null,
    amount: Number(raw?.amount ?? 0),
    type: raw?.type === 'recharge' ? 'recharge' : 'transfer',
    status: raw?.status ?? 'completed',
    description: raw?.description ?? 'Transaction',
    createdAt: raw?.createdAt ?? new Date().toISOString(),
    recipientName: raw?.recipientName,
    senderName: raw?.senderName
  });

  const refresh = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR').format(amount);

  // Filtrage selon le menu sélectionné
  const filteredList = transactions.filter(t => {
    if (section === 'recharges' && t.type !== 'recharge') return false;
    if (section === 'transactions' && t.type !== 'transfer') return false;
    if (status === 'all') return true;
    if (status === 'success') return t.status === 'completed' || t.status === 'success';
    if (status === 'pending') return t.status === 'pending';
    if (status === 'failed') return t.status === 'failed';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <Wallet className="w-8 h-8 text-emerald-600" />
            <span className="text-xl font-bold hidden sm:block">PayFlow</span>
            <span className="text-xl font-bold sm:hidden">PF</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 relative">
            {/* Burger */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            <span className="hidden sm:block font-medium text-sm sm:text-base truncate max-w-32 sm:max-w-none">
              {user?.fullName}
            </span>

            {/* Profil */}
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <UserCircle className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-600" />
            </button>

            {/* Menu profil */}
            {showProfileMenu && (
              <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg border w-48 z-50">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/profil');
                  }}
                  className="w-full px-4 py-3 flex gap-2 hover:bg-gray-50 text-left"
                >
                  <UserCircle className="w-4 h-4" /> Profil
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/parametres');
                  }}
                  className="w-full px-4 py-3 flex gap-2 hover:bg-gray-50 text-left"
                >
                  <Settings className="w-4 h-4" /> Paramètres
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/historique');
                  }}
                  className="w-full px-4 py-3 flex gap-2 hover:bg-gray-50 text-left"
                >
                  <Settings className="w-4 h-4" /> History
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full px-4 py-3 flex gap-2 text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOut className="w-4 h-4" /> Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/40" 
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <span className="font-medium">{user?.fullName}</span>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  navigate('/profil');
                }}
                className="w-full px-4 py-3 flex gap-2 hover:bg-gray-50 text-left"
              >
                <UserCircle className="w-4 h-4" /> Profil
              </button>
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  navigate('/parametres');
                }}
                className="w-full px-4 py-3 flex gap-2 hover:bg-gray-50 text-left"
              >
                <Settings className="w-4 h-4" /> Paramètres
              </button>
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full px-4 py-3 flex gap-2 text-red-600 hover:bg-red-50 text-left"
              >
                <LogOut className="w-4 h-4" /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex gap-6">

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* SIDEBAR + CONTENU */}
        <div className="hidden md:block">
          <DashboardSidebar section={section} setSection={setSection} status={status} setStatus={setStatus} />
        </div>
        <div className="flex-1 min-w-0">
          {/* SOLDE */}
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="lg:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-600 p-4 sm:p-6 lg:p-8 rounded-2xl text-white">
              <p className="opacity-80 text-sm sm:text-base">Solde disponible</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                {formatCurrency(account?.balance || 0)} {account?.currency}
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
                  onClick={() => setShowReceiveModal(true)}
                  className="border border-white/40 px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-white/20 transition-colors"
                >
                  <QrCode className="w-4 h-4 sm:w-5 sm:h-5" /> 
                  <span className="text-sm sm:text-base">Recevoir</span>
                </button>
              </div>
            </div>
            <div className="space-y-4 sm:space-y-6">
              <QuickStatCard
                icon={<ArrowUpRight className="text-red-600" />} 
                label="Envoyé ce mois"
                amount={calculateMonthlyStats(transactions, 'transfer')}
                currency={account?.currency || 'XOF'}
              />
              <QuickStatCard
                icon={<ArrowDownLeft className="text-green-600" />} 
                label="Reçu ce mois"
                amount={calculateMonthlyStats(transactions, 'recharge')}
                currency={account?.currency || 'XOF'}
              />
            </div>
          </div>
          {/* LISTE FILTRÉE */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <TransactionHistory transactions={filteredList} />
          </div>
        </div>
        {/* END SIDEBAR + CONTENU */}
      </div>

      {/* MODALS */}
      {showRechargeModal && (
        <RechargeModal onClose={() => setShowRechargeModal(false)} onComplete={refresh} />
      )}

      {showTransferModal && (
        <TransferModal
          onClose={() => setShowTransferModal(false)}
          onComplete={refresh}
          currentBalance={account?.balance || 0}
        />
      )}

      {showReceiveModal && (
        <ReceiveModal
          isOpen={showReceiveModal}
          onClose={() => setShowReceiveModal(false)}
        />
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

/* ===================== */

function QuickStatCard({ icon, label, amount, currency }: any) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-gray-600 text-sm sm:text-base">{label}</span>
      </div>
      <p className="text-lg sm:text-2xl font-bold">
        {new Intl.NumberFormat('fr-FR').format(amount)} {currency}
      </p>
    </div>
  );
}

function calculateMonthlyStats(transactions: Transaction[], type: 'transfer' | 'recharge') {
  const now = new Date();
  return transactions
    .filter(t => t.type === type && new Date(t.createdAt).getMonth() === now.getMonth())
    .reduce((sum, t) => sum + t.amount, 0);
}
