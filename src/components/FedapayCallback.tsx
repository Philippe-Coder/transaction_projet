import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function FedapayCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Récupérer les paramètres de l'URL
        const transactionId = searchParams.get('transaction_id');
        const status = searchParams.get('status');
        const reference = searchParams.get('reference');

        if (status === 'approved') {
          setStatus('success');
          setMessage('Paiement effectué avec succès ! Votre compte a été rechargé.');
          setReference(reference || '');
          
          // Rediriger vers le dashboard après 3 secondes
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else if (status === 'declined' || status === 'canceled') {
          setStatus('failed');
          setMessage('Le paiement a été annulé ou refusé.');
          
          // Rediriger vers le dashboard après 3 secondes
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          setStatus('pending');
          setMessage('Le paiement est en cours de traitement...');
          setReference(reference || '');
          
          // Vérifier le statut périodiquement
          const checkStatus = async () => {
            if (transactionId) {
              try {
                // Appeler l'API pour vérifier le statut
                const response = await fetch(`/api/payments/fedapay/status/transaction/${transactionId}`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                });
                
                if (response.ok) {
                  const data = await response.json();
                  if (data.status === 'SUCCESS') {
                    setStatus('success');
                    setMessage('Paiement effectué avec succès ! Votre compte a été rechargé.');
                    setTimeout(() => navigate('/'), 3000);
                  } else if (data.status === 'FAILED') {
                    setStatus('failed');
                    setMessage('Le paiement a échoué.');
                    setTimeout(() => navigate('/'), 3000);
                  }
                }
              } catch (error) {
                console.error('Erreur vérification statut:', error);
              }
            }
          };

          // Vérifier toutes les 5 secondes
          const interval = setInterval(checkStatus, 5000);
          
          // Timeout après 2 minutes
          const timeout = setTimeout(() => {
            clearInterval(interval);
            setStatus('failed');
            setMessage('Délai d\'attente dépassé. Veuillez vérifier votre solde plus tard.');
            setTimeout(() => navigate('/'), 3000);
          }, 120000);

          return () => {
            clearInterval(interval);
            clearTimeout(timeout);
          };
        }
      } catch (error) {
        console.error('Erreur callback FedaPay:', error);
        setStatus('failed');
        setMessage('Une erreur est survenue lors du traitement du paiement.');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-600" />;
      case 'pending':
        return <Clock className="w-16 h-16 text-yellow-600" />;
      default:
        return <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          {getStatusIcon()}
        </div>
        
        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {status === 'loading' && 'Traitement en cours...'}
          {status === 'success' && 'Paiement réussi !'}
          {status === 'failed' && 'Paiement échoué'}
          {status === 'pending' && 'Paiement en attente'}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        {reference && (
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-500">Référence:</p>
            <p className="font-mono text-sm">{reference}</p>
          </div>
        )}
        
        <div className="space-y-3">
          {status === 'pending' && (
            <p className="text-sm text-gray-500">
              Cette page se mettra à jour automatiquement...
            </p>
          )}
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            {status === 'pending' ? 'Retour au dashboard' : 'Retour au dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
