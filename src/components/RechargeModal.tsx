import { useState } from "react";
import { X, Smartphone } from "lucide-react";
import { initFedapayRecharge } from "../services/payment.service";
import MobileMoneyPayment from "./MobileMoneyPayment";

interface RechargeModalProps {
  onClose: () => void;
  onComplete: (amount: number) => void;
}

const predefinedAmounts = [5000, 10000, 25000, 50000];

export default function RechargeModal({ onClose, onComplete }: RechargeModalProps) {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'form' | 'mobile_money' | 'success' | 'failed'>('form');
  const [error, setError] = useState('');
  const [reference, setReference] = useState<string | undefined>(undefined);
  const [fedapayData, setFedapayData] = useState<any>(null);

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const rechargeAmount = parseFloat(amount);
    if (!rechargeAmount || rechargeAmount <= 0) {
      setError('Veuillez entrer un montant valide');
      return;
    }

    if (rechargeAmount < 500) {
      setError('Le montant minimum est de 500 XOF');
      return;
    }

    setError('');
    setStatus('mobile_money');

    try {
      // Initialiser la transaction FedaPay Mobile Money
      const result = await initFedapayRecharge({
        amount: Math.round(rechargeAmount),
        callbackUrl: `${window.location.origin}/fedapay/callback`
      });

      setReference(result?.reference);
      setFedapayData(result);

    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        'Erreur lors de l\'initialisation du paiement';
      setError(String(message));
      setStatus('failed');
    }
  };

  const handleMobileMoneyComplete = () => {
    console.log('Paiement Mobile Money complété');
    setStatus('success');
    if (amount) {
      onComplete(parseFloat(amount));
    }
  };

  const handleMobileMoneyError = (errorMessage: string) => {
    setError(errorMessage);
    setStatus('failed');
  };

  return (
    <>
      {/* Formulaire initial */}
      {status === 'form' && (
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
                  <p className="font-medium text-emerald-900">Paiement Mobile Money</p>
                  <p className="text-sm text-emerald-700">Validation par SMS - pas de redirection</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant (XOF)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {predefinedAmounts.map((presetAmount) => (
                    <button
                      key={presetAmount}
                      type="button"
                      onClick={() => handleAmountSelect(presetAmount)}
                      className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                        parseFloat(amount) === presetAmount
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {presetAmount.toLocaleString('fr-FR')}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Entrez un montant personnalisé"
                  min="500"
                  step="100"
                  required
                />
              </div>

              {/* Informations détectées automatiquement */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-blue-900 mb-2">📱 Détection automatique</p>
                <p className="text-xs text-blue-700">
                  Le pays et l'opérateur Mobile Money seront détectés automatiquement depuis votre numéro de téléphone
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Initier le paiement Mobile Money</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Mobile Money Payment */}
      {status === 'mobile_money' && fedapayData && (
        <MobileMoneyPayment
          isOpen={true}
          onClose={() => {
            setStatus('form');
            setFedapayData(null);
          }}
          amount={parseFloat(amount)}
          customerPhone={fedapayData.customerPhone}
          reference={reference || ''}
          detectedCountry={fedapayData.detectedCountry}
          operatorName={fedapayData.operatorName}
          onComplete={handleMobileMoneyComplete}
          onError={handleMobileMoneyError}
        />
      )}

      {/* Message de succès */}
      {status === 'success' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Smartphone className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Recharge réussie !</h3>
            <p className="text-gray-600 mb-6">Votre compte a été rechargé avec succès.</p>
            {reference && (
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="text-sm text-gray-500">Référence:</p>
                <p className="font-mono text-sm">{reference}</p>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Terminer
            </button>
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {status === 'failed' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Échec de la recharge</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStatus('form');
                  setError('');
                  setFedapayData(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Réessayer
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}