import { api } from './api';
import { fedapayService } from './fedapay.service';

export interface FedaPayAdminConfig {
  apiKey: string;
  secretKey: string;
  environment: 'sandbox' | 'live';
}

// Service pour récupérer la configuration FedaPay depuis le dashboard admin
class ConfigService {
  // Récupérer la configuration FedaPay depuis le backend
  async getFedaPayConfig(): Promise<FedaPayAdminConfig> {
    try {
      const response = await api.get('/admin/fedapay/config');
      return response.data;
    } catch (error: any) {
      console.error('Erreur récupération config FedaPay:', error);
      throw new Error(error?.response?.data?.message || 'Impossible de récupérer la configuration FedaPay');
    }
  }

  // Appliquer la configuration FedaPay depuis le dashboard admin
  async applyFedaPayConfig(): Promise<void> {
    try {
      const config = await this.getFedaPayConfig();
      
      // Configurer le service FedaPay avec les clés du dashboard
      fedapayService.configure({
        apiKey: config.apiKey,
        secretKey: config.secretKey,
        environment: config.environment
      });

      console.log('✅ Configuration FedaPay appliquée:', {
        environment: config.environment,
        apiKey: config.apiKey.substring(0, 8) + '...',
        hasSecretKey: !!config.secretKey
      });

    } catch (error) {
      console.error('❌ Erreur application config FedaPay:', error);
      
      // Configuration de secours pour le développement (mode live)
      fedapayService.configure({
        apiKey: process.env.REACT_APP_FEDAPAY_API_KEY || 'fallback_api_key',
        secretKey: process.env.REACT_APP_FEDAPAY_SECRET_KEY || 'fallback_secret_key',
        environment: 'live'
      });
      
      console.warn('⚠️ Configuration de secours appliquée (mode live)');
    }
  }

  // Vérifier si la configuration est valide
  async validateFedaPayConfig(): Promise<{ valid: boolean; message: string }> {
    try {
      const config = await this.getFedaPayConfig();
      
      if (!config.apiKey || !config.secretKey) {
        return {
          valid: false,
          message: 'Clés API FedaPay manquantes'
        };
      }

      if (!config.apiKey.startsWith('pk_') || !config.secretKey.startsWith('sk_')) {
        return {
          valid: false,
          message: 'Format des clés API invalide'
        };
      }

      return {
        valid: true,
        message: 'Configuration FedaPay valide'
      };

    } catch (error) {
      return {
        valid: false,
        message: 'Impossible de valider la configuration'
      };
    }
  }

  // Obtenir les informations de l'environnement actuel
  getCurrentEnvironment(): { environment: string; apiUrl: string } {
    const config = fedapayService.getConfig();
    
    if (!config) {
      return {
        environment: 'Non configuré',
        apiUrl: 'N/A'
      };
    }

    return {
      environment: config.environment.toUpperCase(),
      apiUrl: config.environment === 'live' 
        ? 'https://api.fedapay.com/v1' 
        : 'https://api.sandbox.fedapay.com/v1'
    };
  }
}

export const configService = new ConfigService();
