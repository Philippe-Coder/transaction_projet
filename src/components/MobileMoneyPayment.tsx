import { useState, useEffect } from 'react';
import { X, Smartphone, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface MobileMoneyPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  customerPhone: string;
  reference: string;
  detectedCountry?: string;
  operatorName?: string;
  onComplete: () => void;
  onError: (error: string) => void;
}

export default function MobileMoneyPayment({
  isOpen,
  onClose,
  amount,
  customerPhone,
  reference,
  detectedCountry,
  operatorName,
  onComplete,
  onError,
}: MobileMoneyPaymentProps) {
  const [status, setStatus] = useState<'initiated' | 'pending' | 'success' | 'failed'>('initiated');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || status === 'success' || status === 'failed') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setStatus('failed');
          setError('Délai d\'attente dépassé. Veuillez réessayer.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, status]);

  useEffect(() => {
    if (!isOpen) return;

    // Simuler la vérification du statut du paiement
    const checkPaymentStatus = async () => {
      try {
        // En réalité, vous appelleriez votre API pour vérifier le statut
        const response = await fetch(`/api/payments/fedapay/status/recharge/${reference}`);
        const data = await response.json();

        if (data.status === 'SUCCESS') {
          setStatus('success');
          onComplete();
        } else if (data.status === 'FAILED') {
          setStatus('failed');
          setError('Le paiement a échoué.');
        }
      } catch (err) {
        console.error('Erreur lors de la vérification du statut:', err);
      }
    };

    // Vérifier toutes les 10 secondes
    const statusTimer = setInterval(checkPaymentStatus, 10000);

    return () => clearInterval(statusTimer);
  }, [isOpen, reference, onComplete]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Paiement Mobile Money</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {status === 'initiated' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <Smartphone className="w-8 h-8 text-emerald-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">SMS de validation envoyé !</h3>
              <p className="text-gray-600 mb-4">
                Un SMS a été envoyé au <strong>{customerPhone}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Veuillez saisir votre code PIN mobile money pour confirmer le paiement de <strong>{amount.toLocaleString('fr-FR')} XOF</strong>
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Temps d'attente</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{formatTime(timeLeft)}</p>
              <p className="text-xs text-blue-700 mt-1">Le paiement expirera après 5 minutes</p>
            </div>

            <button
              onClick={() => setStatus('pending')}
              className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              J'ai reçu le SMS
            </button>
          </div>
        )}

        {status === 'pending' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">En attente de validation...</h3>
              <p className="text-gray-600 mb-4">
                Nous attendons la confirmation du paiement
              </p>
              <p className="text-sm text-gray-500">
                Vérification du statut toutes les 10 secondes...
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-900">
                  Ne fermez pas cette page pendant la validation
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Temps restant</p>
              <p className="text-xl font-bold text-gray-900">{formatTime(timeLeft)}</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-green-900 mb-2">Paiement réussi !</h3>
              <p className="text-gray-600 mb-4">
                Votre compte a été rechargé avec succès
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Informations de paiement</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Client:</span> {customerPhone}</p>
                  {detectedCountry && <p><span className="font-medium">Pays détecté:</span> {detectedCountry}</p>}
                  {operatorName && <p><span className="font-medium">Opérateur:</span> {operatorName}</p>}
                  <p><span className="font-medium">Montant:</span> {amount.toLocaleString('fr-FR')} XOF</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Terminer
              </button>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-red-900 mb-2">Paiement échoué</h3>
              <p className="text-gray-600 mb-4">
                {error || 'Le paiement n\'a pas pu être validé'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStatus('initiated');
                  setTimeLeft(300);
                  setError('');
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
        )}
      </div>
    </div>
  );
}
