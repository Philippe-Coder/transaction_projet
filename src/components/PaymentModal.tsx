import { useState, useEffect } from 'react';
import { X, Smartphone, Loader, CheckCircle, AlertCircle, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fedapayService } from '../services/fedapay.service';
import { configService } from '../services/config.service';

interface PaymentModalProps {
  type: 'recharge' | 'transfer';
  onClose: () => void;
  onComplete?: (amount: number, transactionId?: string) => void;
  transferData?: {
    recipientEmail?: string;
    recipientPhone?: string;
    description?: string;
  };
}

export default function PaymentModal({ type, onClose, onComplete, transferData }: PaymentModalProps) {
  const { user, account, updateBalance } = useAuth();
  const [step, setStep] = useState<'form' | 'processing' | 'pending' | 'success' | 'failed' | 'error'>('form');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<'mtn' | 'moov' | 'orange' | 'wave'>('mtn');
  const [country, setCountry] = useState('bj');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transaction, setTransaction] = useState<any>(null);

  const predefinedAmounts = [5000, 10000, 25000, 50000];

  const countries = [
    { code: 'bj', name: 'Bénin', flag: '🇧🇯' },
    { code: 'tg', name: 'Togo', flag: '🇹🇬' },
    { code: 'ci', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
    { code: 'sn', name: 'Sénégal', flag: '🇸🇳' },
    { code: 'ne', name: 'Niger', flag: '🇳🇪' }
  ];

  const paymentModes = [
    { id: 'mtn', name: 'MTN Mobile Money', icon: '📱', color: 'bg-yellow-500' },
    { id: 'moov', name: 'Moov Money', icon: '📱', color: 'bg-purple-500' },
    { id: 'orange', name: 'Orange Money', icon: '📱', color: 'bg-orange-500' },
    { id: 'wave', name: 'Wave', icon: '🌊', color: 'bg-blue-500' }
  ];

  useEffect(() => {
    // Récupérer et appliquer la configuration FedaPay depuis le dashboard admin
    const initializeFedaPay = async () => {
      try {
        await configService.applyFedaPayConfig();
        
        // Afficher les infos de débogage en mode développement
        if (process.env.NODE_ENV === 'development') {
          const env = configService.getCurrentEnvironment();
          console.log('🔵 FedaPay Environment:', env);
        }
      } catch (error) {
        console.error('❌ Erreur initialisation FedaPay:', error);
      }
    };

    initializeFedaPay();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Veuillez entrer un montant valide');
      return;
    }

    if (paymentAmount < 500) {
      setError('Le montant minimum est de 500 XOF');
      return;
    }

    if (type === 'transfer' && (!transferData?.recipientEmail && !transferData?.recipientPhone)) {
      setError('Veuillez renseigner les informations du destinataire');
      return;
    }

    setLoading(true);
    setStep('processing');

    try {
      const paymentData = {
        amount: Math.round(paymentAmount),
        description: type === 'recharge' 
          ? `Recharge automatique - ${paymentAmount} XOF`
          : `Transfert vers ${transferData?.recipientEmail || transferData?.recipientPhone} - ${paymentAmount} XOF`,
        customerEmail: user?.email,
        customerName: user?.fullName,
        customerPhone: user?.phoneNumber,
        paymentMode,
        country
      };

      // Traitement automatisé avec FedaPay
      const result = await fedapayService.processAutomatedPayment(paymentData);

      if (result.success) {
        setTransaction(result.transaction);
        setStep('pending');
        // Polling pour vérifier le statut final
        try {
          const finalTransaction = await fedapayService.pollPaymentStatus(result.transaction.id);
          setTransaction(finalTransaction);
          if (finalTransaction.status === 'approved') {
            // Mise à jour du solde pour les recharges uniquement si SUCCESS
            if (type === 'recharge') {
              const newBalance = (account?.balance || 0) + paymentAmount;
              updateBalance(newBalance);
            }
            setStep('success');
            setTimeout(() => {
              onComplete?.(paymentAmount, finalTransaction.reference);
              onClose();
            }, 2000);
          } else if (finalTransaction.status === 'pending') {
            setStep('pending');
          } else {
            setStep('failed');
          }
        } catch (pollError) {
          console.error('Erreur polling:', pollError);
          setStep('pending');
        }
      } else {
        setError(result.message);
        setStep('failed');
      }
    } catch (err: any) {
      console.error('Erreur paiement:', err);
      setError(err.message || 'Erreur lors du traitement du paiement');
      setStep('failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('form');
    setAmount('');
    setError('');
    setTransaction(null);
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

        {step === 'form' && (
          <>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {type === 'recharge' ? 'Recharger mon compte' : 'Effectuer un transfert'}
            </h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              {type === 'recharge' 
                ? 'Recharge automatique via Mobile Money' 
                : `Transfert vers ${transferData?.recipientEmail || transferData?.recipientPhone}`
              }
            </p>

            {type === 'transfer' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Destinataire</p>
                    <p className="text-sm text-blue-600">
                      {transferData?.recipientEmail || transferData?.recipientPhone}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (XOF)
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montants rapides
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de paiement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentModes.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentMode(mode.id as any)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        paymentMode === mode.id
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-8 h-8 ${mode.color} rounded-full flex items-center justify-center mx-auto mb-1`}>
                          <span className="text-white text-sm">{mode.icon}</span>
                        </div>
                        <p className="text-xs font-medium text-gray-700">{mode.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800">Paiement automatisé</p>
                    <p className="text-xs text-emerald-600">
                      Le paiement sera traité automatiquement sans confirmation externe
                    </p>
                  </div>
                </div>
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
                  <span>
                    {type === 'recharge' ? 'Recharger' : 'Transférer'} {amount ? parseFloat(amount).toLocaleString() : ''} XOF
                  </span>
                )}
              </button>
            </form>
          </>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Traitement en cours</h3>
            <p className="text-gray-600 mb-4">
              {type === 'recharge' ? 'Recharge de votre compte...' : 'Traitement du transfert...'}
            </p>
            <p className="text-sm text-gray-500">Veuillez patienter, cela peut prendre quelques instants</p>
          </div>
        )}

        {step === 'pending' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="w-8 h-8 text-yellow-600 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Paiement en attente</h3>
            <p className="text-gray-600 mb-4">
              Votre paiement est en attente de validation par l'opérateur mobile.<br />
              Veuillez valider la transaction sur votre téléphone.
            </p>
            {transaction && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500">Référence: {transaction.reference}</p>
              </div>
            )}
            <p className="text-sm text-gray-500">Cette fenêtre se fermera automatiquement dès validation.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {type === 'recharge' ? 'Recharge réussie!' : 'Transfert effectué!'}
            </h3>
            <p className="text-gray-600 mb-4">
              {type === 'recharge' 
                ? `Votre compte a été rechargé de ${parseFloat(amount).toLocaleString()} XOF`
                : `Transfert de ${parseFloat(amount).toLocaleString()} XOF effectué`
              }
            </p>
            {transaction && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500">Référence: {transaction.reference}</p>
              </div>
            )}
            <p className="text-sm text-gray-500">Cette fenêtre se fermera automatiquement...</p>
          </div>
        )}

        {step === 'failed' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Paiement échoué ou annulé</h3>
            <p className="text-gray-600 mb-6">{error || 'Le paiement n\'a pas pu être validé. Vérifiez votre solde ou réessayez.'}</p>
            <div className="space-y-3">
              <button
                onClick={resetForm}
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Réessayer
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
