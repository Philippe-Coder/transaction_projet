import { useState } from "react";
import type { FC } from "react";
import { X, Send, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { transferMoney } from "../services/transaction.service";

interface TransferModalProps {
  onClose: () => void;
}

const TransferModal: FC<TransferModalProps> = ({ onClose }) => {
  const { account, updateBalance } = useAuth();
  const [amount, setAmount] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"form" | "pending" | "success" | "failed">("form");
  const [error, setError] = useState("");
  const [reference, setReference] = useState<string | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !recipientPhone) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      setError("Le montant doit être positif");
      return;
    }

    if (account && amountNum > account.balance) {
      setError("Solde insuffisant");
      return;
    }

    setStatus("pending");
    setError("");

    try {
      const result = await transferMoney(recipientPhone, amountNum);

      setReference(result.data?.reference);
      setStatus("success");
      
      if (account) {
        updateBalance(account.balance - amountNum);
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors du transfert");
      setStatus("failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Envoyer de l argent</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {status === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro du destinataire
                </label>
                <input
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="+22890000000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant à envoyer
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-12"
                    placeholder="0"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    XOF
                  </span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Envoyer</span>
                </button>
              </div>
            </form>
          )}

          {status !== "form" && (
            <div className="text-center py-8">
              {status === "pending" && (
                <div className="space-y-4">
                  <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-600">Transfert en cours...</p>
                </div>
              )}
              
              {status === "success" && (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Send className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-green-600 font-medium">Transfert réussi!</p>
                  <p className="text-gray-600 text-sm">{reference}</p>
                  <button
                    onClick={onClose}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
                  >
                    Fermer
                  </button>
                </div>
              )}
              
              {status === "failed" && (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-red-600 font-medium">Transfert échoué</p>
                  {error && <p className="text-gray-600 text-sm">{error}</p>}
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        setStatus("form");
                        setError("");
                      }}
                      className="border px-4 py-2 rounded-lg hover:bg-gray-50"
                    >
                      Réessayer
                    </button>
                    <button
                      onClick={onClose}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferModal;



