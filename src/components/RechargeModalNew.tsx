import { useState } from 'react';
import { X, CreditCard, Smartphone, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createPayment } from '../services/payment.service';

interface RechargeModalProps {
  onClose: () => void;
  onComplete: (amount: number) => void;
}

export default function RechargeModalNew({ onClose, onComplete }: RechargeModalProps) {
  const { account, updateBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile'>('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'amount' | 'payment' | 'processing' | 'success'>('amount');
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
      const paymentData = {
        amount: Math.round(rechargeAmount),
        method: paymentMethod,
        description: `Recharge de compte - ${rechargeAmount} XOF`,
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

      const result = await createPayment(paymentData);
      
      // Simuler le traitement du paiement
      setTimeout(() => {
        const newBalance = (account?.balance || 0) + rechargeAmount;
        updateBalance(newBalance);
        setStep('success');
        setLoading(false);
        onComplete(rechargeAmount);
        
        // Fermer automatiquement après succès
        setTimeout(() => {
          onClose();
          resetForm();
        }, 3000);
      }, 2000);

    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Erreur lors du traitement du paiement';
      setError(String(message));
      setStep('amount');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setPaymentMethod('card');
    setError('');
    setStep('amount');
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

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
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

        {step === 'amount' && (
          <>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Recharger mon compte</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Choisissez le montant et la méthode de paiement</p>

            <form onSubmit={(e) => { e.preventDefault(); setStep('payment'); }} className="space-y-4 sm:space-y-6">
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
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
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

              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
              >
                Continuer
              </button>
            </form>
          </>
        )}

        {step === 'payment' && (
          <>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Paiement par {paymentMethod === 'card' ? 'carte' : 'mobile'}</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Montant: {parseFloat(amount).toLocaleString()} XOF</p>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {paymentMethod === 'card' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom du titulaire</label>
                    <input
                      type="text"
                      value={cardInfo.holder}
                      onChange={(e) => setCardInfo({...cardInfo, holder: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Nom sur la carte"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de carte</label>
                    <input
                      type="text"
                      value={cardInfo.number}
                      onChange={(e) => setCardInfo({...cardInfo, number: formatCardNumber(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date d'expiration</label>
                      <input
                        type="text"
                        value={cardInfo.expiry}
                        onChange={(e) => setCardInfo({...cardInfo, expiry: formatExpiry(e.target.value)})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="MM/AA"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <input
                        type="text"
                        value={cardInfo.cvv}
                        onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value.replace(/\D/g, '')})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Opérateur</label>
                    <select
                      value={mobileInfo.operator}
                      onChange={(e) => setMobileInfo({...mobileInfo, operator: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="mtn">MTN</option>
                      <option value="moov">MOOV</option>
                      <option value="orange">Orange</option>
                      <option value="wave">Wave</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de téléphone</label>
                    <input
                      type="tel"
                      value={mobileInfo.phone}
                      onChange={(e) => setMobileInfo({...mobileInfo, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="+229 XX XX XX XX"
                      required
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep('amount')}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Traitement...</span>
                    </>
                  ) : (
                    <span>Payer {parseFloat(amount).toLocaleString()} XOF</span>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Traitement du paiement</h3>
            <p className="text-gray-600">Veuillez patienter pendant que nous traitons votre paiement...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi!</h3>
            <p className="text-gray-600 mb-4">Votre compte a été rechargé de {parseFloat(amount).toLocaleString()} XOF</p>
            <p className="text-sm text-gray-500">Cette fenêtre se fermera automatiquement...</p>
          </div>
        )}
      </div>
    </div>
  );
}
