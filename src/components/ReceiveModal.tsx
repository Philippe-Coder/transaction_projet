import { useState, useEffect } from 'react';
import { X, QrCode, Copy, Check, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { generateQRCode, QRCodeData } from '../services/qr.service';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiveModal({ isOpen, onClose }: ReceiveModalProps) {
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      generateQR();
    }
  }, [isOpen, user]);

  const generateQR = async () => {
    setLoading(true);
    try {
      const qrData: QRCodeData = {
        userId: user!.id,
        fullName: user!.fullName,
        phoneNumber: user!.phoneNumber,
        timestamp: Date.now()
      };
      
      const qrUrl = await generateQRCode(qrData);
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(user!.phoneNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md md:max-h-[90vh] md:overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recevoir de l'argent</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <QrCode className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {user?.fullName}
            </h3>
            <p className="text-sm sm:text-base text-gray-600">Faites scanner ce QR code pour recevoir de l'argent</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-6 sm:py-8">
              <Loader className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <img 
                src={qrCodeUrl} 
                alt="QR Code pour recevoir de l'argent" 
                className="w-full h-auto max-w-[280px] mx-auto"
              />
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">Ou partagez votre numéro :</p>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2">
              <input
                type="text"
                value={user?.phoneNumber || ''}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm sm:text-base"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 sm:px-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Le QR code expire après 24 heures pour des raisons de sécurité
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
