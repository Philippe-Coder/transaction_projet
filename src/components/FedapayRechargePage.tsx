import { useState } from 'react';
import { Loader, CheckCircle, X } from 'lucide-react';
import { processAutomatedRecharge } from '../services/payment.service';
import { useAuth } from '../contexts/AuthContext';

export default function FedapayRechargePage() {
  const { account, updateBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [paymentMode, setPaymentMode] = useState<'mtn' | 'moov' | 'orange' | 'wave'>('mtn');
  const [country, setCountry] = useState('BJ');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const amt = Math.round(parseFloat(amount) || 0);
    if (isNaN(amt) || amt < 500) {
      setError('Montant invalide (min 500 XOF)');
      return;
    }

    setLoading(true);
    try {
      const result = await processAutomatedRecharge({
        amount: amt,
        paymentMode,
        country,
        customerPhone: phone,
        customerEmail: undefined,
        customerName: name || undefined,
      });

      if (result?.success) {
        updateBalance((account?.balance || 0) + amt);
        setSuccess(true);
      } else {
        setError(result?.message || 'Échec du paiement');
      }
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Recharge via FedaPay (Mobile Money)</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700">Montant (XOF)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border rounded" min={500} />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Téléphone (client)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="+22990000000" />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Nom (optionnel)</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Opérateur</label>
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as any)} className="w-full px-3 py-2 border rounded">
              <option value="mtn">MTN</option>
              <option value="moov">MOOV</option>
              <option value="orange">Orange</option>
              <option value="wave">Wave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700">Pays</label>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option value="BJ">Bénin</option>
              <option value="TG">Togo</option>
              <option value="CI">Côte d'Ivoire</option>
              <option value="NE">Niger</option>
              <option value="SN">Sénégal</option>
            </select>
          </div>

          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600 flex items-center gap-2"><CheckCircle /> Recharge initiée</div>}

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 text-white rounded flex items-center gap-2">
              {loading ? <Loader className="animate-spin w-4 h-4" /> : null}
              <span>{loading ? 'Traitement...' : 'Payer (sans redirection)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
