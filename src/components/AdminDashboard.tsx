import { useEffect, useMemo, useState, ReactNode } from 'react';
import {
  CreditCard,
  Settings,
  RefreshCw,
  Menu,
  X,
  LogOut,
  Save,
  Shield,
  BarChart3,
  Table,
  UserCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminStats,
  getAdminUsers,
  getAllPayments,
  getAllTransactions,
  getPaymentConfig,
  savePaymentConfig,
  updateAdminUserStatus,
} from '../services/admin.service';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  const [activePage, setActivePage] = useState<'dashboard' | 'transactions' | 'payments' | 'users' | 'config'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const provider = 'FEDAPAY';
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [configMessage, setConfigMessage] = useState<string | null>(null);

  // Le dashboard se charge toujours au début, mais affiche le contenu même pendant le chargement
  // Les early returns ont été supprimés pour éviter l'erreur "Rendered fewer hooks than expected"

  const statCards = useMemo(() => {
    const s = stats ?? {};

    const totalUsers = typeof s?.totalUsers === 'number' ? s.totalUsers : 0;
    const totalTransactions = typeof s?.totalTransactions === 'number' ? s.totalTransactions : 0;
    const totalRecharges = typeof s?.totalRecharges === 'number' ? s.totalRecharges : 0;
    const totalVolume = typeof s?.volume?.total === 'number' ? s.volume.total : 0;

    return [
      { label: 'Utilisateurs', value: totalUsers },
      { label: 'Transactions', value: totalTransactions },
      { label: 'Recharges', value: totalRecharges },
      { label: 'Volume total', value: totalVolume },
    ];
  }, [stats]);

  const daily = useMemo(() => {
    const list = stats?.daily;
    return Array.isArray(list) ? list : [];
  }, [stats]);

  const normalizeList = (raw: any) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.items)) return raw.items;
    return [] as any[];
  };

  // S'assurer que les états sont toujours des tableaux
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safePayments = Array.isArray(payments) ? payments : [];
  const safeUsers = Array.isArray(users) ? users : [];

  const refresh = async () => {
    console.log('🔵 AdminDashboard: Starting refresh...');
    console.log('🔵 AdminDashboard: Current states - loading:', loading, 'stats:', !!stats, 'error:', !!error);
    setError(null);
    setConfigMessage(null);
    setLoading(true);
    console.log('🔵 AdminDashboard: setLoading(true) called');

    // Safety timeout: if refresh takes too long, show an error and stop loading
    const safetyTimer = setTimeout(() => {
      console.error('❌ AdminDashboard: Refresh timed out');
      setError('Délai de connexion dépassé. Vérifiez votre réseau et réessayez.');
      setLoading(false);
    }, 5000); // 5s au lieu de 12s

    try {
      console.log('🔵 AdminDashboard: Fetching admin data...');
      
      // Faire les appels en parallèle pour plus de rapidité
      const [stats, transactions, payments, users, config] = await Promise.all([
        getAdminStats(30),
        getAllTransactions(),
        getAllPayments(),
        getAdminUsers(),
        getPaymentConfig()
      ]);
      
      console.log('🔵 AdminDashboard: All data loaded in parallel');

      // Mettre à jour les états
      setStats(stats);
      setTransactions(normalizeList(transactions));
      setPayments(normalizeList(payments));
      setUsers(normalizeList(users));

      setApiKey(String(config?.apiKey ?? config?.api_key ?? ''));
      setSecretKey(String(config?.secretKey ?? config?.secret_key ?? ''));
      
      console.log('✅ AdminDashboard: Data loaded successfully');
    } catch (e: any) {
      console.error('❌ AdminDashboard: Error loading data:', e);
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        console.warn('🔒 AdminDashboard: Unauthorized admin token - forcing logout');
        try {
          onLogout();
        } catch (err) {
          console.error('❌ AdminDashboard: Error during onLogout call', err);
        }
        setError('Session admin invalide ou expirée. Veuillez vous reconnecter.');
        setStats(null);
        setTransactions([]);
        setPayments([]);
        setUsers([]);
        setLoading(false);
        return;
      }
      const message =
        e?.response?.data?.message ??
        e?.message ??
        'Impossible de charger le tableau de bord admin';
      setError(String(message));
      setStats(null);
      setTransactions([]);
      setPayments([]);
      setUsers([]);
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
      console.log('🔵 AdminDashboard: setLoading(false) called in finally');
      console.log('🔵 AdminDashboard: Final states - loading: false, stats:', !!stats, 'error:', !!error);
      console.log('🔵 AdminDashboard: Refresh completed');
    }
  };

  useEffect(() => {
    console.log('🔵 AdminDashboard: useEffect triggered');
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    console.log('🔵 AdminDashboard: Admin token found:', !!adminToken);
    let isMounted = true;
    
    const loadData = async () => {
      if (!isMounted) return;
      await refresh();
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []); // Un tableau vide pour s'exécuter seulement une fois

  const handleSaveConfig = async () => {
    setError(null);
    setConfigMessage(null);
    setSaving(true);

    try {
      await savePaymentConfig({
        provider,
        apiKey: apiKey.trim(),
        secretKey: secretKey.trim(),
      });
      setConfigMessage('Configuration enregistrée');
    } catch (e: any) {
      const message =
        e?.response?.data?.message ??
        e?.message ??
        "Impossible d'enregistrer la configuration";
      setError(String(message));
    } finally {
      setSaving(false);
    }
  };

  const getCell = (row: any, keys: string[]) => {
    for (const k of keys) {
      const v = row?.[k];
      if (v != null) return String(v);
    }
    return '';
  };

  const getBool = (row: any, keys: string[]) => {
    for (const k of keys) {
      const v = row?.[k];
      if (typeof v === 'boolean') return v;
      if (v === 0 || v === 1) return Boolean(v);
      if (typeof v === 'string') {
        if (v.toLowerCase() === 'true') return true;
        if (v.toLowerCase() === 'false') return false;
      }
    }
    return undefined as boolean | undefined;
  };

  const toggleUser = async (u: any) => {
    const id = getCell(u, ['id', '_id', 'userId']);
    if (!id) return;

    const current = getBool(u, ['isActive', 'active', 'enabled']);
    const next = !(current ?? true);

    setError(null);
    setTogglingUserId(id);
    try {
      await updateAdminUserStatus(id, next);
      setUsers((prev) =>
        prev.map((row) => {
          const rowId = getCell(row, ['id', '_id', 'userId']);
          if (rowId !== id) return row;
          return { ...row, isActive: next };
        }),
      );
    } catch (e: any) {
      const message =
        e?.response?.data?.message ??
        e?.message ??
        "Impossible de modifier le statut de l'utilisateur";
      setError(String(message));
    } finally {
      setTogglingUserId(null);
    }
  };

  const Sidebar = ({ mobile }: { mobile: boolean }) => {
    const Item = ({
      id,
      label,
      icon,
    }: {
      id: 'dashboard' | 'transactions' | 'payments' | 'users' | 'config';
      label: string;
      icon: ReactNode;
    }) => {
      const isActive = activePage === id;
      return (
        <button
          onClick={() => {
            setActivePage(id);
            if (mobile) setSidebarOpen(false);
          }}
          className={
            `w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ` +
            (isActive
              ? 'bg-slate-900 text-white'
              : 'text-gray-700 hover:bg-gray-100')
          }
        >
          <span className={isActive ? 'text-white' : 'text-gray-600'}>{icon}</span>
          <span className="font-medium">{label}</span>
        </button>
      );
    };

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-slate-800" />
            <span className="text-lg font-bold text-gray-900">Admin</span>
          </div>

          {mobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-4 space-y-2">
          <Item id="dashboard" label="Dashboard" icon={<BarChart3 className="w-5 h-5" />} />
          <Item id="transactions" label="Transactions" icon={<Table className="w-5 h-5" />} />
          <Item id="payments" label="Paiements" icon={<CreditCard className="w-5 h-5" />} />
          <Item id="users" label="Utilisateurs" icon={<Shield className="w-5 h-5" />} />
          <Item id="config" label="Config FedaPay" icon={<Settings className="w-5 h-5" />} />
        </div>

        <div className="mt-auto p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay de chargement */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du tableau de bord admin...</p>
          </div>
        </div>
      )}

      {/* Overlay d'erreur */}
      {!loading && !stats && error && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="text-center max-w-md p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => void refresh()}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      <div className="flex min-h-screen">
        <aside className="hidden lg:block w-72 bg-white border-r border-gray-200">
          <Sidebar mobile={false} />
        </aside>

        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">
              <Sidebar mobile={true} />
            </div>
          </div>
        )}

        <main className="flex-1">
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <span className="text-lg font-semibold text-gray-900">
                    {activePage === 'dashboard'
                      ? 'Dashboard'
                      : activePage === 'transactions'
                        ? 'Transactions'
                        : activePage === 'payments'
                          ? 'Paiements'
                          : activePage === 'users'
                            ? 'Utilisateurs'
                          : 'Configuration'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => void refresh()}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Rafraîchir</span>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <UserCircle className="w-5 h-5" />
                    </button>

                    {showProfileMenu && (
                      <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg border w-56 z-50">
                        <div className="p-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">Admin</p>
                          <p className="text-xs text-gray-500">admin@example.com</p>
                        </div>
                        
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate('/admin/profil');
                          }}
                          className="w-full px-4 py-3 flex gap-3 text-gray-700 hover:bg-gray-50"
                        >
                          <UserCircle className="w-4 h-4" />
                          <span>Profil</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            // Navigation vers paramètres admin si nécessaire
                          }}
                          className="w-full px-4 py-3 flex gap-3 text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Paramètres</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            setActivePage('transactions');
                          }}
                          className="w-full px-4 py-3 flex gap-3 text-gray-700 hover:bg-gray-50"
                        >
                          <Table className="w-4 h-4" />
                          <span>Historique</span>
                        </button>

                        <div className="border-t border-gray-100">
                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              setShowLogoutConfirm(true);
                            }}
                            className="w-full px-4 py-3 flex gap-3 text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Déconnexion</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {configMessage && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6 text-sm">
                {configMessage}
              </div>
            )}

            {activePage === 'dashboard' && (
              <>
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  {statCards.map((c) => (
                    <div key={c.label} className="bg-white rounded-xl shadow-md p-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 rounded-lg bg-slate-50">
                          <BarChart3 className="w-5 h-5 text-slate-700" />
                        </div>
                        <span className="text-gray-600 text-sm">{c.label}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {typeof c.value === 'number'
                          ? new Intl.NumberFormat('fr-FR').format(c.value)
                          : '—'}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-gray-700" />
                    <h3 className="text-lg font-bold text-gray-900">Évolution (jours)</h3>
                  </div>

                  <div className="p-6">
                    {loading ? (
                      <div className="text-gray-600">Chargement...</div>
                    ) : daily.length === 0 ? (
                      <div className="text-gray-600">Aucune donnée</div>
                    ) : (
                      <div className="space-y-2">
                        {daily.slice(0, 7).map((d, i) => (
                          <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">{d.date}</span>
                            <span className="font-medium">{d.amount} XOF</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activePage === 'transactions' && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center space-x-2">
              <Table className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-bold text-gray-900">Transactions</h3>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-gray-600">Chargement...</div>
              ) : safeTransactions.length === 0 ? (
                <div className="text-gray-600">Aucune transaction</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="py-2 pr-4">ID</th>
                        <th className="py-2 pr-4">Type</th>
                        <th className="py-2 pr-4">Montant</th>
                        <th className="py-2 pr-4">Statut</th>
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Utilisateur</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {safeTransactions.slice(0, 50).map((t) => (
                        <tr key={getCell(t, ['id', '_id', 'transactionId']) || JSON.stringify(t)}>
                          <td className="py-2 pr-4 text-gray-900">
                            {getCell(t, ['id', '_id', 'transactionId'])}
                          </td>
                          <td className="py-2 pr-4 text-gray-700">{getCell(t, ['type'])}</td>
                          <td className="py-2 pr-4 text-gray-900">{getCell(t, ['amount', 'value'])}</td>
                          <td className="py-2 pr-4 text-gray-700">{getCell(t, ['status', 'state'])}</td>
                          <td className="py-2 pr-4 text-gray-700">{getCell(t, ['createdAt', 'created_at', 'date'])}</td>
                          <td className="py-2 pr-4 text-gray-700">
                            {String(t?.account?.user?.email ?? t?.user?.email ?? '')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

            {activePage === 'payments' && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center space-x-2">
              <Table className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-bold text-gray-900">Paiements</h3>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-gray-600">Chargement...</div>
              ) : safePayments.length === 0 ? (
                <div className="text-gray-600">Aucun paiement</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="py-2 pr-4">ID</th>
                        <th className="py-2 pr-4">Provider</th>
                        <th className="py-2 pr-4">Montant</th>
                        <th className="py-2 pr-4">Référence</th>
                        <th className="py-2 pr-4">Statut</th>
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Utilisateur</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {safePayments.slice(0, 50).map((p) => (
                        <tr key={getCell(p, ['id', '_id', 'paymentId']) || JSON.stringify(p)}>
                          <td className="py-2 pr-4 text-gray-900">{getCell(p, ['id', '_id', 'paymentId'])}</td>
                          <td className="py-2 pr-4 text-gray-700">{getCell(p, ['provider', 'method'])}</td>
                          <td className="py-2 pr-4 text-gray-900">{getCell(p, ['amount', 'value'])}</td>
                          <td className="py-2 pr-4 text-gray-700">{getCell(p, ['reference'])}</td>
                          <td className="py-2 pr-4 text-gray-700">{getCell(p, ['status', 'state'])}</td>
                          <td className="py-2 pr-4 text-gray-700">{getCell(p, ['createdAt', 'created_at', 'date'])}</td>
                          <td className="py-2 pr-4 text-gray-700">{String(p?.user?.email ?? '')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

            {activePage === 'users' && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-bold text-gray-900">Utilisateurs</h3>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-gray-600">Chargement...</div>
              ) : safeUsers.length === 0 ? (
                <div className="text-gray-600">Aucun utilisateur</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="py-2 pr-4">ID</th>
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Nom</th>
                        <th className="py-2 pr-4">Téléphone</th>
                        <th className="py-2 pr-4">Statut</th>
                        <th className="py-2 pr-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {safeUsers.slice(0, 100).map((u) => {
                        const id = getCell(u, ['id', '_id', 'userId']);
                        const isActive = getBool(u, ['isActive', 'active', 'enabled']);
                        const statusLabel = (isActive ?? true) ? 'Actif' : 'Désactivé';
                        const buttonLabel = (isActive ?? true) ? 'Désactiver' : 'Activer';

                        return (
                          <tr key={id || JSON.stringify(u)}>
                            <td className="py-2 pr-4 text-gray-900">{id}</td>
                            <td className="py-2 pr-4 text-gray-700">
                              {String(u?.email ?? u?.user?.email ?? '')}
                            </td>
                            <td className="py-2 pr-4 text-gray-700">
                              {String(u?.fullName ?? u?.user?.fullName ?? u?.name ?? '')}
                            </td>
                            <td className="py-2 pr-4 text-gray-700">
                              {String(u?.phone ?? u?.phoneNumber ?? u?.user?.phone ?? u?.user?.phoneNumber ?? '')}
                            </td>
                            <td className="py-2 pr-4">
                              <span
                                className={
                                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ' +
                                  ((isActive ?? true)
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-700')
                                }
                              >
                                {statusLabel}
                              </span>
                            </td>
                            <td className="py-2 pr-4">
                              <button
                                onClick={() => void toggleUser(u)}
                                disabled={!id || togglingUserId === id}
                                className={
                                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors ' +
                                  ((isActive ?? true)
                                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                    : 'bg-green-50 text-green-700 hover:bg-green-100') +
                                  ' disabled:opacity-50'
                                }
                              >
                                {togglingUserId === id ? '...' : buttonLabel}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

            {activePage === 'config' && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-xl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center space-x-2">
              <Settings className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-bold text-gray-900">Configuration paiement</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                <input
                  value={provider}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="pk_test_xxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                <input
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="sk_test_yyy"
                  type="password"
                />
              </div>

              <button
                onClick={() => void handleSaveConfig()}
                disabled={saving}
                className="w-full bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-900 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
              </button>
            </div>
              </div>
            )}
          </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmer la déconnexion</h3>
                <p className="text-gray-600 mb-6">Êtes-vous sûr de vouloir vous déconnecter ?</p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      setShowLogoutConfirm(false);
                      onLogout();
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  </div>
  );
}
