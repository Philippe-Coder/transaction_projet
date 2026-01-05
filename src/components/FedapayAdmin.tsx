import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { configureFedaPay } from '../services/payment.service';

interface Props {
  onClose?: () => void;
}

export default function FedapayAdmin({ onClose }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [environment, setEnvironment] = useState<'live' | 'sandbox'>('live');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!apiKey || !secretKey) {
      setError('Veuillez fournir apiKey et secretKey');
      return;
    }

    setLoading(true);
    try {
      await configureFedaPay({ apiKey, secretKey, environment });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de la configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-xl font-bold mb-2">Configuration FedaPay (Admin)</h2>
        <p className="text-sm text-gray-600 mb-4">Configure la clé pour l'environnement <strong>live</strong> ou <strong>sandbox</strong>.
        <br />Important: pour la production, stocke la clé secrète côté serveur, pas dans le client.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">API Key</label>
            <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Secret Key</label>
            <input value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Environnement</label>
            <div className="flex gap-3 mt-2">
              <label className={`px-3 py-2 border rounded ${environment === 'live' ? 'bg-emerald-50 border-emerald-300' : ''}`}>
                <input type="radio" name="env" checked={environment === 'live'} onChange={() => setEnvironment('live')} /> <span className="ml-2">live</span>
              </label>
              <label className={`px-3 py-2 border rounded ${environment === 'sandbox' ? 'bg-emerald-50 border-emerald-300' : ''}`}>
                <input type="radio" name="env" checked={environment === 'sandbox'} onChange={() => setEnvironment('sandbox')} /> <span className="ml-2">sandbox</span>
              </label>
            </div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">Configuration enregistrée (clé stockée côté backend si disponible)</div>}

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded">
              <Save className="w-4 h-4" />
              <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
