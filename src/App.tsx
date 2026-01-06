import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import AdminAuthFormSimple from './components/AdminAuthFormSimple';
import AdminDashboard from './components/AdminDashboard';
import AdminProfile from './components/AdminProfile';
import GoogleCallback from './components/GoogleCallback';
import FedapayCallback from './components/FedapayCallback';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ProfileSimple from './components/ProfileSimple';
import Settings from './components/Settings';
import HistoryPage from './components/HistoryPage';

function AppContent() {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showAdminAuthForm, setShowAdminAuthForm] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token');
  });
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = () => {
      const token = localStorage.getItem('admin_token');
      console.log('🔄 App: Storage event - token changé:', !!token);
      setAdminToken(token);
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Forcer le re-rendu quand adminToken change
  useEffect(() => {
    console.log('🔄 App: adminToken changé, re-rendu du composant:', !!adminToken);
  }, [adminToken]);

  const logoutAdmin = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
    setAdminToken(null);
    setShowAdminAuthForm(false);
    navigate('/');
  };

  return (
    <>
      <Routes>
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        
        {/* Routes Admin - protégées par token */}
        <Route path="/admin" element={
          adminToken ? <AdminDashboard onLogout={logoutAdmin} /> : <Navigate to="/" replace />
        } />
        <Route path="/admin/profil" element={
          adminToken ? <AdminProfile /> : <Navigate to="/" replace />
        } />
        
        {/* Routes utilisateur */}
        <Route path="/" element={
          isAuthenticated ? <Dashboard /> : <LandingPage 
            onGetStarted={() => setShowAuthForm(true)} 
            onAdmin={() => setShowAdminAuthForm(true)} 
          />
        } />
        <Route path="/profil" element={
          isAuthenticated ? <ProfileSimple /> : <Navigate to="/" replace />
        } />
        <Route path="/parametres" element={
          isAuthenticated ? <Settings /> : <Navigate to="/" replace />
        } />
        <Route path="/historique" element={
          isAuthenticated ? <HistoryPage /> : <Navigate to="/" replace />
        } />
        
        {/* Routes publiques pour les callbacks */}
        <Route path="/fedapay/callback" element={<FedapayCallback />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Modals */}
      {showAuthForm && <AuthForm onClose={() => setShowAuthForm(false)} />}
      {showAdminAuthForm && (
        <AdminAuthFormSimple
          onClose={() => setShowAdminAuthForm(false)}
          onSuccess={() => {
            console.log('🔄 App: onSuccess appelé, fermeture modal et redirection...');
            setShowAdminAuthForm(false);
            // Redirection directe pour éviter la race condition
            setTimeout(() => {
              console.log('🔄 App: Redirection vers /admin...');
              navigate('/admin');
            }, 100);
          }}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;