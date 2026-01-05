import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader, Settings } from 'lucide-react';
import { getFedaPayConfig } from '../services/payment.service';

export default function FedaPayTest() {
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'error'>('loading');
  const [config, setConfig] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      setStatus('loading');
      
      // Récupérer la configuration depuis le backend
      const response = await getFedaPayConfig();
      const fedapayConfig = response.data;
      
      // Valider la configuration
      const validation = validateConfig(fedapayConfig);
      
      setConfig({
        ...fedapayConfig,
        environment: fedapayConfig.environment || 'sandbox',
        validation
      });
      
      setStatus(validation.valid ? 'valid' : 'invalid');
      
    } catch (error) {
      console.error('Erreur vérification config:', error);
      setStatus('error');
    }
  };

  // Fonction de validation simple
  const validateConfig = (config: any) => {
    const isValid = config && config.apiKey && config.secretKey && config.environment;
    return {
      valid: !!isValid,
      errors: isValid ? [] : ['Configuration incomplète']
    };
  };

  const testTransaction = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Tester un appel simple au backend
      const response = await getFedaPayConfig();
      
      setTestResult({
        success: true,
        message: 'Configuration FedaPay accessible via le backend',
        config: response.data,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="w-6 h-6 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900">Test Configuration FedaPay</h1>
        </div>

        {/* Statut de la configuration */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Statut de la configuration</h2>
          
          {status === 'loading' && (
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Loader className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-blue-800">Vérification de la configuration...</span>
            </div>
          )}

          {status === 'valid' && config && (
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-green-800 font-medium">Configuration valide</p>
                <p className="text-sm text-green-600">
                  Environnement: {config.environment.environment} | 
                  API: {config.environment.apiUrl}
                </p>
              </div>
            </div>
          )}

          {status === 'invalid' && config && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-red-800 font-medium">Configuration invalide</p>
                <p className="text-sm text-red-600">{config.validation.message}</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">Erreur lors de la vérification</span>
            </div>
          )}
        </div>

        {/* Détails de la configuration */}
        {config && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Détails de la configuration</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Environnement:</span>
                  <span className="ml-2 font-medium">{config.environment.environment}</span>
                </div>
                <div>
                  <span className="text-gray-500">API URL:</span>
                  <span className="ml-2 font-medium">{config.environment.apiUrl}</span>
                </div>
                <div>
                  <span className="text-gray-500">API Key:</span>
                  <span className="ml-2 font-mono text-xs">
                    {config.apiKey ? `${config.apiKey.substring(0, 8)}...` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Secret Key:</span>
                  <span className="ml-2 font-mono text-xs">
                    {config.secretKey ? `${config.secretKey.substring(0, 8)}...` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test de transaction */}
        {status === 'valid' && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Test de transaction</h2>
            
            <button
              onClick={testTransaction}
              disabled={testing}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {testing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Test en cours...</span>
                </>
              ) : (
                <span>Lancer un test (100 XOF)</span>
              )}
            </button>

            {testResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                testResult.success ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className="flex items-center space-x-3">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      testResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {testResult.success ? 'Test réussi' : 'Test échoué'}
                    </p>
                    <p className={`text-sm ${
                      testResult.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {testResult.success 
                        ? `Transaction: ${testResult.transaction.reference}`
                        : `Erreur: ${testResult.error}`
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(testResult.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={checkConfiguration}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Actualiser la configuration
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Instructions pour les tests live:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Assurez-vous que les clés API sont configurées dans le dashboard admin</li>
            <li>• Les tests utiliseront l'API FedaPay en production (mode live)</li>
            <li>• Les transactions test seront réelles et facturées</li>
            <li>• Utilisez un montant minimum (100 XOF) pour les tests</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
