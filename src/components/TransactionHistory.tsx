import { ArrowUpRight, ArrowDownLeft, Download, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'recharge':
        return <Download className="w-5 h-5" />;
      case 'transfer':
        return <ArrowUpRight className="w-5 h-5" />;
      case 'receive':
        return <ArrowDownLeft className="w-5 h-5" />;
      default:
        return <ArrowUpRight className="w-5 h-5" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'recharge':
        return 'text-blue-600 bg-blue-50';
      case 'transfer':
        return 'text-red-600 bg-red-50';
      case 'receive':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'recharge':
        return 'Recharge';
      case 'transfer':
        return 'Envoi';
      case 'receive':
        return 'Réception';
      default:
        return type;
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ArrowUpRight className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune transaction</h3>
        <p className="text-gray-600">Vos transactions apparaîtront ici</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">Historique des transactions</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-gray-900">
                      {getTypeLabel(transaction.type)}
                    </p>
                    {getStatusIcon(transaction.status)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {transaction.recipientName || transaction.senderName || transaction.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-lg font-bold ${
                  transaction.type === 'transfer' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {transaction.type === 'transfer' ? '-' : '+'} {formatCurrency(transaction.amount)} XOF
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {transaction.status === 'completed' ? 'Terminé' :
                   transaction.status === 'pending' ? 'En cours' : 'Échoué'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
