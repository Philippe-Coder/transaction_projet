import { useState } from 'react';
import { X, Smartphone, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { rechargeAccount, type FedapayCountry } from '../services/payment.service';

interface RechargeModalProps {
  onClose: () => void;
  onComplete: (amount: number) => void;
}

export default function RechargeModalFixed({ onClose, onComplete }: RechargeModalProps) {
  const { account, updateBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [customerCountry, setCustomerCountry] = useState<FedapayCountry>('BJ');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const predefinedAmounts = [5000, 10000, 25000, 50000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const rechargeAmount = parseFloat(amount);
    if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
      setError('Veuillez entrer un montant valide');
      return;
    }

    if (rechargeAmount < 500) {
      setError('Le montant minimum est de 500 XOF');
      return;
    }

    setLoading(true);

    try {
      // Paiement automatique via FedaPay Mobile Money en arrière-plan
      await rechargeAccount('FEDAPAY', Math.round(rechargeAmount), `AUTO-${Date.now()}`);
      
      // Simulation de traitement immédiat (FedaPay traite en arrière-plan)
      setTimeout(() => {
        const newBalance = (account?.balance || 0) + rechargeAmount;
        updateBalance(newBalance);
        onComplete(rechargeAmount);
        onClose();
      }, 1500);

    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        'Erreur lors du traitement du paiement';
      setError(String(message));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full md:max-h-[90vh] md:overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Recharger mon compte</h2>
        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Recharge automatique via FedaPay Mobile Money</p>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="font-semibold text-emerald-800">Mobile Money</h3>
              <p className="text-sm text-emerald-600">Paiement via MTN, MOOV, Orange, Wave</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant (XOF)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
              placeholder="Entrez le montant"
              min="500"
              step="100"
              required
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montants rapides</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {predefinedAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className={`py-2 px-3 rounded-lg font-medium transition-colors ${
                    parseFloat(amount) === amt
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
            <select
              value={customerCountry}
              onChange={(e) => setCustomerCountry(e.target.value as FedapayCountry)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="BJ">Bénin</option>
              <option value="TG">Togo</option>
              <option value="CI">Côte d'Ivoire</option>
              <option value="NE">Niger</option>
              <option value="SN">Sénégal</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Paiement automatique:</strong> Votre compte sera débité automatiquement via FedaPay Mobile Money 
              en utilisant vos informations enregistrées. Aucune redirection nécessaire.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Traitement...</span>
              </>
            ) : (
              <span>Recharger {amount ? parseFloat(amount).toLocaleString() : ''} XOF</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
