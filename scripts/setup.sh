#!/bin/bash

echo "🚀 Setup de Transaction App"
echo "=========================="

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js 18+"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Installer les dépendances frontend
echo ""
echo "📦 Installation des dépendances frontend..."
cd transaction
npm install

# Installer les dépendances backend
echo ""
echo "📦 Installation des dépendances backend..."
cd ../transaction-api
npm install

# Générer Prisma
echo ""
echo "🗄️  Génération Prisma..."
npx prisma generate

# Créer la base de données
echo ""
echo "🗄️  Création de la base de données..."
npx prisma db push

# Créer admin par défaut
echo ""
echo "👤 Création de l'admin par défaut..."
npx ts-node create-admin.ts

echo ""
echo "✅ Setup terminé !"
echo ""
echo "🏃‍♂️ Pour démarrer le développement :"
echo "   1. Backend: cd transaction-api && npm run start:dev"
echo "   2. Frontend: cd transaction && npm run dev"
echo ""
echo "🌱 URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo "   API Docs: http://localhost:3001/api"
