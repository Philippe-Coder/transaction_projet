export interface FedapayConfig {
  apiKey: string;
  secretKey: string;
  environment: 'sandbox' | 'live';
}

class FedapayService {
  private config: FedapayConfig | null = null;

  configure(config: FedapayConfig) {
    this.config = config;
  }

  getConfig(): FedapayConfig | null {
    return this.config;
  }
}

export const fedapayService = new FedapayService();
