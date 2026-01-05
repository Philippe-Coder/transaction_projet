import { useState } from 'react';
import type { FC } from 'react';
import { X, Send, Loader, AlertCircle, QrCode } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { transferMoney } from '../services/transaction.service';
import { getPaymentsDashboard } from '../services/payment.service';
import { parseQRCodeData, QRCodeData } from '../services/qr.service';
import QRScanner from './QRScanner';
import StatusPage from './StatusPage';

interface TransferModalProps {
  onClose: () => void;
}

const TransferModal: FC<TransferModalProps> = ({ onClose }) => {
  const { account, updateBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'form' | 'pending' | 'success' | 'failed'>('form');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState<string | undefined>(undefined);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const predefinedAmounts = [1000, 2000, 5000, 10000];
  const currentBalance = account?.balance || 0;

  // Liste des réseaux Mobile Money
  const mobileMoneyNetworks = [
    { id: 'airtel-ne', name: 'Airtel Niger', country: 'NE', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Airtel_logo.png' },
    { id: 'celtis-bj', name: 'Celtis Cash Bénin', country: 'BJ', logo: 'https://www.celtis.bj/assets/img/logo.png' },
    { id: 'freemoney-sn', name: 'Free Money Sénégal', country: 'SN', logo: 'https://www.free.sn/wp-content/uploads/2020/07/logo-free-money.png' },
    { id: 'mixx-tg', name: 'Mixx by Yas Togo', country: 'TG', logo: 'https://yas.tg/assets/img/logo.png' },
    { id: 'moov-bj', name: 'Moov Bénin', country: 'BJ', logo: 'https://moov-africa.bj/wp-content/uploads/2021/01/logo-moov-africa.png' },
    { id: 'moov-tg', name: 'Moov Togo', country: 'TG', logo: 'https://moov.tg/wp-content/uploads/2021/01/logo-moov-africa.png' },
    { id: 'mtn-bj', name: 'MTN Bénin', country: 'BJ', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/MTN_Logo.svg' },
    { id: 'mtn-ci', name: "MTN Côte d'Ivoire", country: 'CI', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/MTN_Logo.svg' },
    { id: 'mtn-gn', name: 'MTN Guinée', country: 'GN', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/MTN_Logo.svg' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedNetwork) {
      setError('Veuillez sélectionner un réseau Mobile Money.');
      return;
    }
    if (!recipientPhone || !amount) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setLoading(true);
    setStatus('pending');
    // Appel de la fonction de transfert avec le réseau sélectionné
    transferMoney(selectedNetwork, recipientPhone, parseFloat(amount), description)
      .then((res) => {
        setStatus('success');
        setReference(res?.data?.reference || undefined);
        if (res?.data?.newBalance !== undefined) {
          updateBalance(res.data.newBalance);
        }
      })
      .catch((err) => {
        setStatus('failed');
        setError(err?.message || 'Échec du transfert.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleQRCodeDetected = (data: any) => {
    // TODO: logique de scan QR
    setShowScanner(false);
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

        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <Send className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Envoyer de l'argent</h2>
            <p className="text-xs sm:text-sm text-gray-600">Transfert instantané</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start space-x-3">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-blue-800">
            <p className="font-medium mb-1">Solde disponible</p>
            <p className="text-lg sm:text-2xl font-bold text-blue-900">
              {currentBalance.toLocaleString('fr-FR')} XOF
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {status === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Sélection du réseau Mobile Money */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un réseau
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                {mobileMoneyNetworks.map((network) => (
                  <button
                    type="button"
                    key={network.id}
                    onClick={() => setSelectedNetwork(network.id)}
                    className={`flex items-center p-2 rounded-lg border transition-colors w-full ${selectedNetwork === network.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                  >
                    <img src={network.logo} alt={network.name} className="w-8 h-8 rounded-full mr-3" />
                    <div className="flex-1 text-left">
                      <span className="font-medium text-gray-900 text-sm">{network.name}</span>
                      <span className="ml-2 text-xs text-gray-500">({network.country})</span>
                    </div>
                    {selectedNetwork === network.id && (
                      <span className="ml-2 text-emerald-600 font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            {/* Champ numéro du destinataire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro du destinataire
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) =>
                    setRecipientPhone(e.target.value.replace(/\s+/g, ''))
                  }
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base"
                  placeholder="+22890000000"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Scanner un QR code"
                >
                  <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant à envoyer
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base sm:text-lg pr-12 sm:pr-16"
                  placeholder="0"
                  required
                />
                <span className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm sm:text-base">
                  XOF
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optionnel)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm sm:text-base"
                placeholder="Motif du transfert"
                rows={2}
              />
            </div>
            {amount && parseFloat(amount) > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Montant</span>
                  <span className="font-medium text-gray-900">
                    {parseFloat(amount).toLocaleString('fr-FR')} XOF
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Frais</span>
                  <span className="font-medium text-gray-900">0 XOF</span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-emerald-700 text-base sm:text-lg">
                      {parseFloat(amount).toLocaleString('fr-FR')} XOF
                    </span>
                  </div>
                </div>
              </div>
            )}
          </form>
        )}

        {status !== 'form' && (
          <StatusPage
            status={status}
            type="transaction"
            amount={parseFloat(amount)}
            reference={reference}
            onRetry={() => {
              setStatus('form');
              setError('');
            }}
            onClose={onClose}
          />
        )}

        {showScanner && (
          <QRScanner
            onScan={handleQRCodeDetected}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>
    </div>
  );
};

export default TransferModal;