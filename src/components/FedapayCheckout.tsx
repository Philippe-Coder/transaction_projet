import { useEffect, useRef, useState } from 'react';
import { X, Smartphone, AlertCircle } from 'lucide-react';

interface FedapayCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  publicKey: string;
  customerInfo: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    country: string;
  };
  onComplete: (transaction: any) => void;
  onError: (error: string) => void;
}

declare global {
  interface Window {
    FedaPay: any;
  }
}

export default function FedapayCheckout({
  isOpen,
  onClose,
  amount,
  publicKey,
  customerInfo,
  onComplete,
  onError,
}: FedapayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen || !window.FedaPay) return;

    // Nettoyer le bouton précédent
    if (buttonRef.current) {
      buttonRef.current.innerHTML = '';
    }

    try {
      // Initialiser FedaPay Checkout
      window.FedaPay.init(buttonRef.current, {
        public_key: publicKey,
        environment: 'live',
        transaction: {
          amount: amount,
          description: `Recharge de compte - ${amount} XOF`,
          custom_metadata: {
            source: 'payflow_platform',
            timestamp: new Date().toISOString()
          }
        },
        customer: {
          firstname: customerInfo.firstname,
          lastname: customerInfo.lastname,
          email: customerInfo.email,
          phone_number: {
            number: customerInfo.phone,
            country: customerInfo.country.toLowerCase()
          }
        },
        currency: {
          iso: 'XOF'
        },
        button: {
          text: 'Payer avec FedaPay',
          class: 'w-full bg-emerald-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2'
        },
        onComplete: (reason: number, transaction: any) => {
          console.log('FedaPay onComplete:', { reason, transaction });
          
          if (reason === window.FedaPay.CHECKOUT_COMPLETED) {
            setLoading(false);
            onComplete(transaction);
          } else if (reason === window.FedaPay.DIALOG_DISMISSED) {
            setLoading(false);
            setError('Paiement annulé par l\'utilisateur');
          }
        },
        onError: (error: any) => {
          console.error('FedaPay onError:', error);
          setLoading(false);
          setError(error.message || 'Erreur lors du paiement');
          onError(error.message || 'Erreur lors du paiement');
        }
      });
    } catch (err: any) {
      console.error('FedaPay init error:', err);
      setError('Erreur d\'initialisation du paiement');
      onError('Erreur d\'initialisation du paiement');
    }
  }, [isOpen, amount, publicKey, customerInfo, onComplete, onError]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Paiement FedaPay</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Récapitulatif du paiement */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <Smartphone className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-900">Recharge de compte</p>
                <p className="text-sm text-emerald-700">Paiement sécurisé via FedaPay</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-900">
              {amount.toLocaleString('fr-FR')} XOF
            </div>
          </div>

          {/* Informations du client */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Informations de paiement</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Client:</span> {customerInfo.firstname} {customerInfo.lastname}</p>
              <p><span className="font-medium">Email:</span> {customerInfo.email}</p>
              <p><span className="font-medium">Téléphone:</span> {customerInfo.phone}</p>
              <p><span className="font-medium">Pays:</span> {customerInfo.country}</p>
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Bouton de paiement FedaPay */}
          <div className="space-y-3">
            <button
              ref={buttonRef}
              disabled={loading}
              className="w-full"
            >
              {loading && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Traitement en cours...</span>
                </div>
              )}
            </button>

            <button
              onClick={onClose}
              disabled={loading}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>

          {/* Informations de sécurité */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Paiement 100% sécurisé</strong> - Vos informations bancaires ne sont jamais stockées. 
              Paiement traité par FedaPay, leader des paiements mobiles en Afrique.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
