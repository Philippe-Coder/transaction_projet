import { useState } from 'react';
import { X, Loader, CheckCircle, AlertCircle, User, CreditCard, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createTransfer } from '../services/payment.service';

interface TransferModalProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function TransferModalNew({ onClose, onComplete }: TransferModalProps) {
  const { account, updateBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile'>('card');
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvv: '',
    holder: ''
  });
  const [mobileInfo, setMobileInfo] = useState({
    phone: '',
    operator: 'mtn'
  });

  const predefinedAmounts = [1000, 2500, 5000, 10000, 25000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError('Veuillez entrer un montant valide');
      return;
    }

    if (transferAmount < 100) {
      setError('Le montant minimum est de 100 XOF');
      return;
    }

    if (!recipient.trim()) {
      setError('Veuillez entrer l\'email ou le téléphone du destinataire');
      return;
    }

    if (transferAmount > (account?.balance || 0)) {
      setError('Solde insuffisant');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardInfo.number || !cardInfo.expiry || !cardInfo.cvv || !cardInfo.holder) {
        setError('Veuillez remplir tous les champs de la carte');
        return;
      }
    } else {
      if (!mobileInfo.phone) {
        setError('Veuillez entrer votre numéro de téléphone');
        return;
      }
    }

    setStep('processing');
    setLoading(true);

    try {
      const transferData = {
        amount: Math.round(transferAmount),
        recipient: recipient.trim(),
        description: description.trim() || `Transfert de ${transferAmount} XOF`,
        method: paymentMethod,
        ...(paymentMethod === 'card' ? {
          cardNumber: cardInfo.number.replace(/\s/g, ''),
          cardExpiry: cardInfo.expiry,
          cardCvv: cardInfo.cvv,
          cardHolder: cardInfo.holder
        } : {
          phoneNumber: mobileInfo.phone,
          operator: mobileInfo.operator
        })
      };

      await createTransfer(transferData);
      
      // Simuler le traitement du paiement
      setTimeout(() => {
        const newBalance = (account?.balance || 0) - transferAmount;
        updateBalance(newBalance);
        setStep('success');
        setLoading(false);
        onComplete();
        
        // Fermer automatiquement après succès
        setTimeout(() => {
          onClose();
          resetForm();
        }, 3000);
      }, 2000);

    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Erreur lors du transfert';
      setError(String(message));
      setStep('form');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setRecipient('');
    setDescription('');
    setPaymentMethod('card');
    setError('');
    setStep('form');
    setCardInfo({
      number: '',
      expiry: '',
      cvv: '',
      holder: ''
    });
    setMobileInfo({
      phone: '',
      operator: 'mtn'
    });
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Effectuer un transfert</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Solde disponible: {(account?.balance || 0).toLocaleString()} XOF</p>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destinataire</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Email ou téléphone du destinataire"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant (XOF)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
                  placeholder="Entrez le montant"
                  min="100"
                  max={account?.balance || 0}
                  step="100"
                  required
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montants rapides</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optionnel)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Description du transfert"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Méthode de paiement</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Carte</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mobile')}
                    className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'mobile'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span className="font-medium">Mobile</span>
                  </button>
                </div>
              </div>

              {paymentMethod !== 'card' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Le paiement mobile sera débité de votre compte et crédité au destinataire.
                  </p>
                </div>
              )}

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
                  <span>Transférer {parseFloat(amount).toLocaleString()} XOF</span>
                )}
              </button>
            </form>
          </>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Traitement du transfert</h3>
            <p className="text-gray-600">Veuillez patienter pendant que nous traitons votre transfert...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Transfert réussi!</h3>
            <p className="text-gray-600 mb-4">
              {parseFloat(amount).toLocaleString()} XOF ont été transférés à {recipient}
            </p>
            <p className="text-sm text-gray-500">Cette fenêtre se fermera automatiquement...</p>
          </div>
        )}
      </div>
    </div>
  );
}
