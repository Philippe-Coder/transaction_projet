import { Wallet, ArrowDownUp, Shield, Zap, Users } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onAdmin?: () => void;
}

export default function LandingPage({ onGetStarted, onAdmin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Wallet className="w-8 h-8 text-emerald-600" />
              <span className="text-2xl font-bold text-gray-900">PayFlow</span>
            </div>
            <div className="flex items-center space-x-3">
              {onAdmin && (
                <button
                  onClick={onAdmin}
                  className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-gray-900 hover:bg-white transition-colors"
                >
                  Admin
                </button>
              )}

              <button
                onClick={onGetStarted}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Commencer
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Transférez de l'argent
            <span className="block text-emerald-600">en toute sécurité</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Une plateforme moderne et sécurisée pour recharger votre compte et effectuer des transferts d'argent instantanés avec FedaPay
          </p>
          <button
            onClick={onGetStarted}
            className="bg-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Créer un compte gratuitement
          </button>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="w-12 h-12 text-emerald-600" />}
            title="Transactions instantanées"
            description="Envoyez et recevez de l'argent en quelques secondes, 24h/24 et 7j/7"
          />
          <FeatureCard
            icon={<Shield className="w-12 h-12 text-emerald-600" />}
            title="Sécurité maximale"
            description="Vos transactions sont protégées par les technologies de sécurité les plus avancées"
          />
          <FeatureCard
            icon={<ArrowDownUp className="w-12 h-12 text-emerald-600" />}
            title="Recharge facile"
            description="Rechargez votre compte facilement avec FedaPay en quelques clics"
          />
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600">
              Trois étapes simples pour commencer
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <StepCard
              number="1"
              title="Créez votre compte"
              description="Inscrivez-vous gratuitement en quelques secondes avec votre email"
            />
            <StepCard
              number="2"
              title="Rechargez votre compte"
              description="Ajoutez des fonds via FedaPay avec votre carte bancaire ou mobile money"
            />
            <StepCard
              number="3"
              title="Envoyez de l'argent"
              description="Transférez instantanément à vos proches en toute sécurité"
            />
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-white text-center">
            <StatCard number="10,000+" label="Utilisateurs actifs" />
            <StatCard number="50,000+" label="Transactions réussies" />
            <StatCard number="99.9%" label="Taux de disponibilité" />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Users className="w-16 h-16 text-emerald-600 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Rejoignez des milliers d'utilisateurs qui font confiance à PayFlow pour leurs transactions
          </p>
          <button
            onClick={onGetStarted}
            className="bg-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Créer mon compte maintenant
          </button>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Wallet className="w-6 h-6" />
              <span className="text-xl font-bold">PayFlow</span>
            </div>
            <p className="text-gray-400">
              © 2024 PayFlow. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold mb-2">{number}</div>
      <div className="text-emerald-100">{label}</div>
    </div>
  );
}
