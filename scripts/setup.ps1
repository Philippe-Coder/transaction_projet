# Setup de Transaction App pour Windows
Write-Host "🚀 Setup de Transaction App" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green

# Vérifier Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé. Veuillez installer Node.js 18+" -ForegroundColor Red
    exit 1
}

# Vérifier npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm n'est pas installé" -ForegroundColor Red
    exit 1
}

# Installer les dépendances frontend
Write-Host ""
Write-Host "📦 Installation des dépendances frontend..." -ForegroundColor Yellow
Set-Location transaction
npm install

# Installer les dépendances backend
Write-Host ""
Write-Host "📦 Installation des dépendances backend..." -ForegroundColor Yellow
Set-Location ..\transaction-api
npm install

# Générer Prisma
Write-Host ""
Write-Host "🗄️  Génération Prisma..." -ForegroundColor Yellow
npx prisma generate

# Créer la base de données
Write-Host ""
Write-Host "🗄️  Création de la base de données..." -ForegroundColor Yellow
npx prisma db push

# Créer admin par défaut
Write-Host ""
Write-Host "👤 Création de l'admin par défaut..." -ForegroundColor Yellow
try {
    npx ts-node create-admin.ts
} catch {
    Write-Host "⚠️  La création de l'admin a échoué. Vous pouvez le créer manuellement via l'interface." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Setup terminé !" -ForegroundColor Green
Write-Host ""
Write-Host "🏃‍♂️ Pour démarrer le développement :" -ForegroundColor Cyan
Write-Host "   1. Backend: cd transaction-api && npm run start:dev" -ForegroundColor White
Write-Host "   2. Frontend: cd transaction && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🌱 URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "   API Docs: http://localhost:3001/api" -ForegroundColor White
