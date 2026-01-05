'use client';

import { useState } from 'react';
import { Shield, Mail, Lock, KeyRound, X, Phone } from 'lucide-react';
import { adminLogin, adminRegister } from '../services/auth.service';

interface AdminAuthFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const COUNTRY_CODES = [
  { code: '+228', label: 'TG' },
  { code: '+221', label: 'SN' },
  { code: '+225', label: 'CI' },
  { code: '+229', label: 'BJ' },
  { code: '+237', label: 'CM' },
  { code: '+33', label: 'FR' },
];

export default function AdminAuthForm({ onClose, onSuccess }: AdminAuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+228');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullPhone = `${countryCode}${phoneNumber}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await adminLogin(email, password);
      } else {
        if (!phoneNumber.trim()) {
          setError('Veuillez renseigner le numéro de téléphone');
          return;
        }

        if (!secret.trim()) {
          setError('Veuillez renseigner le secret admin');
          return;
        }

        await adminRegister(
          email,
          password,
          fullPhone,
          secret.trim(),
        );

        await adminLogin(email, password);
      }

      onSuccess();
      onClose();
    } catch (e: any) {
      const message =
        e?.response?.data?.message ??
        e?.message ??
        'Une erreur est survenue';
      setError(String(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center justify-center mb-8">
          <Shield className="w-12 h-12 text-slate-700" />
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
          {isLogin ? 'Admin - Connexion' : 'Admin - Créer un compte'}
        </h2>

        <p className="text-center text-gray-600 mb-8">
          {isLogin
            ? 'Accès réservé aux administrateurs'
            : 'Créer un compte administrateur'}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                placeholder="admin@email.com"
                required
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Téléphone avec indicatif */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-3 bg-white focus:ring-2 focus:ring-slate-500"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label} {c.code}
                    </option>
                  ))}
                </select>

                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(e.target.value.replace(/\D/g, ''))
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="90000000"
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Numéro au format international : {fullPhone}
              </p>
            </div>
          )}

          {/* Secret */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secret
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="Secret admin"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-900 disabled:opacity-50"
          >
            {loading
              ? 'Chargement...'
              : isLogin
                ? 'Se connecter'
                : 'Créer le compte admin'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-700 hover:text-slate-900 font-medium"
          >
            {isLogin
              ? 'Créer un compte admin'
              : 'Déjà admin ? Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
}
