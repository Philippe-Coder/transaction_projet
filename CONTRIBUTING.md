# Guide de Contribution

Bienvenue dans le projet Transaction App ! Merci de votre intérêt à contribuer.

## 🚀 Comment commencer

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- Connaissance de React, TypeScript, NestJS

### Installation rapide
```bash
# Windows
.\scripts\setup.ps1

# Linux/Mac
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Démarrage du développement
```bash
# Terminal 1: Backend
cd transaction-api
npm run start:dev

# Terminal 2: Frontend
cd transaction
npm run dev
```

## 📁 Structure du Projet

```
transaction/                 # Frontend React
├── src/
│   ├── components/         # Composants UI réutilisables
│   ├── contexts/          # Contextes React (Auth, etc.)
│   ├── services/          # Services API
│   ├── types/             # Types TypeScript
│   └── utils/             # Fonctions utilitaires

transaction-api/           # Backend NestJS
├── src/
│   ├── auth/              # Authentification (JWT, Google OAuth)
│   ├── admin/             # Routes admin protégées
│   ├── payments/          # Intégration FedaPay
│   ├── users/             # Gestion utilisateurs
│   ├── common/            # Guards, DTOs, utilitaires
│   └── prisma/           # Schéma de base de données
```

## 🎯 Fonctionnalités Principales

### Authentification
- **JWT tokens** pour l'authentification stateless
- **Google OAuth 2.0** avec Passport.js
- **Role-based access** (USER vs ADMIN)

### Paiements FedaPay
- **Initialisation** : `POST /payments/fedapay/init`
- **Callback** : `GET /fedapay/callback`
- **Webhook** : `POST /payments/fedapay/webhook`
- **Statut** : `GET /payments/fedapay/status/:id`

### Administration
- **Dashboard** avec statistiques temps réel
- **Gestion utilisateurs** (activation/désactivation)
- **Configuration FedaPay** (clés API)
- **Surveillance** transactions et paiements

## 🔧 Conventions de Code

### Frontend (React)
- **Components** : PascalCase, exports par défaut
- **Props** : Interfaces TypeScript explicites
- **State** : useState, useEffect hooks
- **Styling** : TailwindCSS classes
- **API calls** : Services séparés avec axios

Exemple :
```tsx
interface UserCardProps {
  user: User;
  onUpdate: (user: User) => void;
}

export default function UserCard({ user, onUpdate }: UserCardProps) {
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      {/* JSX */}
    </div>
  );
}
```

### Backend (NestJS)
- **Controllers** : Routes avec décorateurs
- **Services** : Logique métier
- **DTOs** : Validation avec class-validator
- **Guards** : Authentification et autorisation
- **Database** : Prisma ORM

Exemple :
```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }
}
```

## 🧪 Tests

### Tests Frontend
```bash
npm run test          # Tests unitaires
npm run test:coverage # Couverture de code
```

### Tests Backend
```bash
npm run test:e2e      # Tests end-to-end
npm run test:watch     # Mode watch
```

## 🔄 Processus de Développement

### 1. Créer une branche
```bash
git checkout -b feature/nouvelle-fonctionnalite
```

### 2. Développer
- Suivre les conventions de code
- Ajouter des tests si nécessaire
- Documenter les nouvelles fonctionnalités

### 3. Tester
- Tests unitaires passants
- Tests manuels sur l'interface
- Vérifier la compatibilité mobile

### 4. Commit
```bash
git add .
git commit -m "feat: ajouter nouvelle fonctionnalite"
```

### 5. Push et PR
```bash
git push origin feature/nouvelle-fonctionnalite
# Créer une Pull Request sur GitHub
```

## 📝 Messages de Commit

Utiliser [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `docs:` documentation
- `style:` formatting/style
- `refactor:` refactoring
- `test:` tests
- `chore:` maintenance

Exemples :
```
feat: ajouter paiement FedaPay
fix: corriger authentification Google
docs: mettre à jour README
```

## 🐛 Dépannage Commun

### Problème : Port déjà utilisé
```bash
# Tuer les processus sur les ports 3001 et 5173
npx kill-port 3001 5173
```

### Problème : Base de données
```bash
# Reset de la base
npx prisma migrate reset
npx prisma db push
```

### Problème : Dépendances
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## 🔒 Sécurité

### Variables d'environnement
- **Jamais** committer les fichiers `.env`
- Utiliser `.env.example` comme template
- Générer des clés fortes

### Validation
- **Input validation** côté backend
- **Sanitization** des données utilisateur
- **Rate limiting** sur les endpoints sensibles

### Authentification
- **JWT expiration** appropriée
- **Refresh tokens** si nécessaire
- **HTTPS** en production

## 📋 Checklist avant de PR

- [ ] Code suit les conventions
- [ ] Tests passent
- [ ] Documentation mise à jour
- [ ] Pas de `console.log` laissé
- [ ] Variables d'environnement documentées
- [ ] Responsive design testé
- [ ] Performance acceptable

## 🤝 Support

Pour toute question :
- **Issues GitHub** : rapports de bugs, demandes de fonctionnalités
- **Discussions** : questions techniques, idées
- **Email équipe** : problèmes urgents

## 📚 Ressources

- [Documentation React](https://react.dev/)
- [Documentation NestJS](https://docs.nestjs.com/)
- [Documentation Prisma](https://www.prisma.io/docs/)
- [Documentation FedaPay](https://developer.fedapay.com/)
- [Guide TailwindCSS](https://tailwindcss.com/docs)

---

Merci de contribuer à Transaction App ! 🎉
