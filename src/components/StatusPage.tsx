import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface StatusPageProps {
  status: 'pending' | 'success' | 'failed';
  type?: 'recharge' | 'transaction';
  amount?: number;
  reference?: string;
  onRetry?: () => void;
  onClose?: () => void;
}

export default function StatusPage({ status, type = 'recharge', amount, reference, onRetry, onClose }: StatusPageProps) {
  if (status === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <Loader className="w-10 h-10 text-yellow-600 animate-spin" />
        </div>
        <h2 className="text-xl font-bold mb-2">Paiement en attente</h2>
        <p className="text-gray-600 mb-2">Votre {type === 'recharge' ? 'recharge' : 'transaction'} est en attente de validation.<br/>Veuillez valider sur votre téléphone.</p>
        {reference && <p className="text-xs text-gray-500">Référence: {reference}</p>}
      </div>
    );
  }
  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">{type === 'recharge' ? 'Recharge réussie !' : 'Transaction réussie !'}</h2>
        {amount && <p className="text-gray-600 mb-2">Montant : {amount.toLocaleString()} XOF</p>}
        {reference && <p className="text-xs text-gray-500">Référence: {reference}</p>}
        {onClose && <button onClick={onClose} className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg">Fermer</button>}
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">Paiement échoué ou annulé</h2>
        <p className="text-gray-600 mb-2">Votre {type === 'recharge' ? 'recharge' : 'transaction'} n'a pas pu être validée.</p>
        {reference && <p className="text-xs text-gray-500">Référence: {reference}</p>}
        <div className="flex gap-2 mt-4">
          {onRetry && <button onClick={onRetry} className="bg-emerald-600 text-white px-6 py-2 rounded-lg">Réessayer</button>}
          {onClose && <button onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg">Fermer</button>}
        </div>
      </div>
    );
  }
  return null;
}
