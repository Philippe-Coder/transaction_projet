import { useState } from 'react';
import { Download, ArrowUpRight, CheckCircle, Clock, XCircle } from 'lucide-react';

const statusOptions = [
  { key: 'all', label: 'Tous' },
  { key: 'pending', label: 'En attente', icon: <Clock className="w-4 h-4 text-yellow-600" /> },
  { key: 'success', label: 'Succès', icon: <CheckCircle className="w-4 h-4 text-green-600" /> },
  { key: 'failed', label: 'Échoué', icon: <XCircle className="w-4 h-4 text-red-600" /> },
];

export default function DashboardSidebar({
  section,
  setSection,
  status,
  setStatus
}: {
  section: 'recharges' | 'transactions',
  setSection: (s: 'recharges' | 'transactions') => void,
  status: string,
  setStatus: (s: string) => void
}) {
  return (
    <aside className="w-64 bg-white rounded-xl shadow-md p-4 space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-2">Menu</h3>
        <nav className="space-y-2">
          <button
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg font-medium transition-colors ${section === 'recharges' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-100 text-gray-700'}`}
            onClick={() => setSection('recharges')}
          >
            <Download className="w-5 h-5" /> Recharges
          </button>
          <button
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg font-medium transition-colors ${section === 'transactions' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-100 text-gray-700'}`}
            onClick={() => setSection('transactions')}
          >
            <ArrowUpRight className="w-5 h-5" /> Transactions
          </button>
        </nav>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-2">Statut</h4>
        <div className="flex flex-col gap-2">
          {statusOptions.map(opt => (
            <button
              key={opt.key}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${status === opt.key ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-100 text-gray-700'}`}
              onClick={() => setStatus(opt.key)}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
