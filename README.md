# Transaction App - Plateforme de Transfert d'Argent

Une application web complète de transfert d'argent avec intégration FedaPay, authentification Google OAuth, et panneau d'administration.

## 🚀 Fonctionnalités

### Pour les Utilisateurs
- **Transfert d'argent** entre utilisateurs
- **Recharge de compte** via FedaPay Mobile Money (MTN, MOOV, Orange, Wave)
- **Historique des transactions** détaillé
- **Gestion de profil** utilisateur
- **Authentification** par email/mot de passe ou Google OAuth
- **Interface responsive** et moderne

### Pour les Administrateurs
- **Tableau de bord** avec statistiques en temps réel
- **Gestion des utilisateurs** (activer/désactiver)
- **Configuration FedaPay** (clés API)
- **Surveillance des transactions** et paiements
- **Interface d'administration** sécurisée

## 🛠️ Stack Technique

### Frontend
- **React 18** avec TypeScript
- **Vite** comme build tool
- **TailwindCSS** pour le styling
- **React Router** pour la navigation
- **Lucide React** pour les icônes
- **Axios** pour les appels API

### Backend
- **NestJS** avec TypeScript
- **Prisma** comme ORM
- **PostgreSQL** comme base de données
- **JWT** pour l'authentification
- **Passport.js** avec Google OAuth 2.0
- **FedaPay API** pour les paiements

## 📋 Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## 🚀 Installation

### 1. Cloner le repository
```bash
git clone <repository-url>
cd transaction
```

### 2. Installer les dépendances

#### Frontend
```bash
cd transaction
npm install
```

#### Backend
```bash
cd transaction-api
npm install
```

### 3. Configuration de la base de données

#### Créer la base de données PostgreSQL
```sql
CREATE DATABASE transaction_db;
```

#### Configurer Prisma
```bash
cd transaction-api
npx prisma generate
npx prisma db push
```

### 4. Variables d'environnement

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/transaction_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/auth/google/callback"

# FedaPay
FEDAPAY_WEBHOOK_SECRET="your-fedapay-webhook-secret"

# Frontend URL
FRONTEND_URL="http://localhost:5173"

# Admin Registration
ADMIN_REGISTER_SECRET="change-me"
```

#### Frontend (.env)
```env
VITE_API_URL="http://localhost:3001"
```

### 5. Créer un compte admin par défaut

```bash
cd transaction-api
npx ts-node create-admin.ts
```

Ou manuellement via l'interface admin :
- Email: `admin@transaction.com`
- Mot de passe: `admin123`

## 🏃‍♂️ Lancement

### Démarrer le backend
```bash
cd transaction-api
npm run start:dev
```

### Démarrer le frontend
```bash
cd transaction
npm run dev
```

L'application sera disponible sur :
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Documentation API: http://localhost:3001/api

## 🔧 Configuration FedaPay

### 1. Obtenir les clés API FedaPay
1. Créez un compte sur [FedaPay](https://fedapay.com)
2. Créez une application et obtenez vos clés API
3. Configurez le webhook URL: `http://localhost:3001/payments/fedapay/webhook`

### 2. Configurer dans l'admin dashboard
1. Connectez-vous en admin
2. Allez dans "Config FedaPay"
3. Entrez vos clés API (clé publique et secrète)
4. Sauvegardez la configuration

## 📱 Utilisation

### Pour les utilisateurs
1. **Créer un compte** ou se connecter avec Google
2. **Recharger le compte** via FedaPay Mobile Money
3. **Transférer de l'argent** à d'autres utilisateurs
4. **Consulter l'historique** des transactions

### Pour les administrateurs
1. **Se connecter en admin** avec les identifiants par défaut
2. **Configurer FedaPay** avec les clés API
3. **Surveiller les transactions** et les utilisateurs
4. **Gérer les comptes** utilisateurs

## 🔄 Flux de Paiement FedaPay

1. **Initialisation** : `POST /payments/fedapay/init`
2. **Redirection** vers `https://pay.fedapay.com/{token}`
3. **Paiement** utilisateur (Mobile Money, carte, etc.)
4. **Callback** : `GET /fedapay/callback`
5. **Webhook** : `POST /payments/fedapay/webhook`
6. **Mise à jour** du solde utilisateur

## 📁 Structure du Projet

```
transaction/
├── src/
│   ├── components/          # Composants React
│   ├── contexts/           # Contextes (Auth, etc.)
│   ├── services/           # Services API
│   ├── types/             # Types TypeScript
│   └── utils/             # Utilitaires
├── public/                # Fichiers statiques
└── package.json

transaction-api/
├── src/
│   ├── auth/              # Authentification
│   ├── admin/             # Administration
│   ├── payments/           # Paiements FedaPay
│   ├── users/             # Gestion utilisateurs
│   └── common/            # Utilitaires communs
├── prisma/               # Schéma Prisma
└── package.json
```

## 🧪 Tests

### Tests unitaires
```bash
# Frontend
npm run test

# Backend
npm run test:e2e
```

### Tests d'intégration FedaPay
Utiliser l'environnement de test FedaPay pour les tests :
- Clés de test disponibles dans le dashboard FedaPay
- Paiements simulés sans débit réel

## 🔒 Sécurité

- **JWT tokens** pour l'authentification
- **Password hashing** avec bcrypt
- **CORS** configuré pour le frontend
- **Input validation** avec DTOs NestJS
- **Webhook signature verification** pour FedaPay
- **Role-based access control** pour l'admin

## 🐛 Dépannage

### Problèmes communs

#### Erreur 500 Google OAuth
- Vérifiez les variables d'environnement Google
- Assurez-vous que les URLs de callback sont correctes

#### Erreur FedaPay
- Vérifiez que les clés API sont correctes
- Assurez-vous que le webhook est accessible
- Vérifiez la configuration du pays

#### Erreur de connexion admin
- Vérifiez que l'utilisateur admin existe dans la base
- Utilisez le script `create-admin.ts` si nécessaire

## 📚 Documentation API

La documentation Swagger est disponible sur :
- http://localhost:3001/api

## 🤝 Contribuer

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Créer une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 📞 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Contacter l'équipe de développement

---

**Note importante** : Ce projet utilise de l'argent réel via FedaPay. Utilisez l'environnement de test pour les développements.
