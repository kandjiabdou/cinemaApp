# 🧪 Guide des Tests - Cinema App

Cette documentation explique comment exécuter et comprendre les tests de l'application Cinema.

## 📋 Types de Tests Implémentés

### 🔧 Tests Unitaires
Tests isolés pour chaque service, utilisant des mocks pour simuler les dépendances.

### 🔗 Tests d'Intégration
Tests qui vérifient l'interaction entre les services et les APIs.

### 🎨 Tests Frontend
Tests pour les composants React et l'interface utilisateur.

## 🚀 Exécution Rapide

### Tests de tous les services
```bash
# Tous les tests
npm test

# Tests avec couverture de code
npm run test:coverage

# Tests d'intégration seulement
npm run test:integration
```

### Tests par service
```bash
# API Gateway
npm run test:gateway

# Service d'authentification
npm run test:auth

# Service de gestion des cinémas
npm run test:cinema

# Service public
npm run test:public

# Frontend React
npm run test:frontend
```

## 📊 Structure des Tests

```
cinema-app/
├── api-gateway/
│   └── __tests__/
│       └── server.test.js
├── auth-service/
│   └── __tests__/
│       └── auth.test.js
├── cinema-service/
│   └── __tests__/
│       └── cinema.test.js
├── public-service/
│   └── __tests__/
│       └── public.test.js
├── frontend-app/
│   └── src/
│       └── App.test.js
└── __tests__/
    └── integration.test.js
```

## 🧪 Tests par Service

### 🚪 API Gateway
**Fichier:** `api-gateway/__tests__/server.test.js`

**Tests inclus:**
- ✅ Health checks `/health`
- ✅ Métriques Prometheus `/metrics`
- ✅ Proxy vers les services
- ✅ Gestion des erreurs 404

```bash
cd api-gateway && npm test
```

### 🔐 Service d'Authentification
**Fichier:** `auth-service/__tests__/auth.test.js`

**Tests inclus:**
- ✅ Inscription d'utilisateurs
- ✅ Connexion avec JWT
- ✅ Vérification de tokens
- ✅ Validation des champs
- ✅ Gestion des erreurs

```bash
cd auth-service && npm test
```

**Scénarios testés:**
```javascript
// Inscription réussie
POST /register
{
  "nom": "Cinéma Test",
  "login": "test_cinema",
  "mot_de_passe": "password123",
  "email": "test@cinema.fr"
}

// Connexion réussie
POST /login
{
  "login": "test_cinema",
  "mot_de_passe": "password123"
}

// Vérification de token
GET /verify
Authorization: Bearer <token>
```

### 🏢 Service de Gestion des Cinémas
**Fichier:** `cinema-service/__tests__/cinema.test.js`

**Tests inclus:**
- ✅ CRUD films (authentifié)
- ✅ CRUD programmations (authentifié)
- ✅ Contrôle d'accès
- ✅ Validation des données

```bash
cd cinema-service && npm test
```

### 🌐 Service Public
**Fichier:** `public-service/__tests__/public.test.js`

**Tests inclus:**
- ✅ Liste des films
- ✅ Films par ville
- ✅ Recherche de films
- ✅ Liste des villes
- ✅ Gestion des erreurs

```bash
cd public-service && npm test
```

### 🎨 Frontend React
**Fichier:** `frontend-app/src/App.test.js`

**Tests inclus:**
- ✅ Rendu des composants
- ✅ Interactions utilisateur
- ✅ Navigation
- ✅ Fonctions utilitaires
- ✅ Validation de formulaires

```bash
cd frontend-app && npm test
```

## 🔗 Tests d'Intégration

**Fichier:** `__tests__/integration.test.js`

**Tests inclus:**
- ✅ Health checks de tous les services
- ✅ Métriques Prometheus
- ✅ Proxy API Gateway
- ✅ Flow d'authentification complet
- ✅ Endpoints publics
- ✅ Endpoints protégés

```bash
npm run test:integration
```

**Prérequis:** Les services doivent être en cours d'exécution
```bash
# Démarrer tous les services
npm run start:dev

# Ou avec Docker
npm run docker:up
```

## 📈 Couverture de Code

### Génération des rapports
```bash
# Couverture complète
npm run test:coverage

# Par service
npm run test:coverage:gateway
npm run test:coverage:auth
npm run test:coverage:cinema
npm run test:coverage:public
npm run test:coverage:frontend
```

### Localisation des rapports
- **Services Node.js:** `./coverage/lcov-report/index.html`
- **Frontend React:** `./frontend-app/coverage/lcov-report/index.html`

### Métriques collectées
- **Lines:** Pourcentage de lignes exécutées
- **Functions:** Pourcentage de fonctions appelées
- **Branches:** Pourcentage de branches testées
- **Statements:** Pourcentage d'instructions exécutées

## 🐛 Debugging des Tests

### Tests qui échouent
```bash
# Mode verbose pour plus de détails
npm test -- --verbose

# Tests en mode watch
cd service-name && npm run test:watch

# Tests spécifiques
npm test -- --testNamePattern="nom du test"
```

### Problèmes courants

#### ❌ Services non disponibles
```
⚠️ Service not available: connect ECONNREFUSED
```
**Solution:** Démarrer les services avant les tests d'intégration

#### ❌ Erreurs de timeout
```
Error: Timeout of 5000ms exceeded
```
**Solution:** Augmenter le timeout ou vérifier la performance

#### ❌ Erreurs de base de données
```
Error: connect ECONNREFUSED localhost:5432
```
**Solution:** S'assurer que PostgreSQL est démarré

## 🎯 Mocking et Fixtures

### Données de test
Les tests utilisent des mocks simples avec des données prédéfinies :

```javascript
// Films de test
const mockFilms = [
  { id: 1, titre: 'Film Test 1', ville: 'Paris' },
  { id: 2, titre: 'Film Test 2', ville: 'Lyon' }
];

// Utilisateurs de test
const mockUsers = [];
```

### Mocks externes
```javascript
// Mock d'axios pour les tests frontend
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: { success: true } }))
}));
```

## 🔧 Configuration Jest

### Configuration globale
```json
{
  "testEnvironment": "node",
  "collectCoverageFrom": [
    "**/*.js",
    "!node_modules/**",
    "!coverage/**"
  ]
}
```

### Configuration React
```json
{
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ["@testing-library/jest-dom"]
}
```

## 📝 Écriture de Nouveaux Tests

### Structure recommandée
```javascript
describe('🏷️ Nom du Groupe', () => {
  
  beforeAll(() => {
    // Configuration avant tous les tests
  });

  describe('📋 Sous-groupe', () => {
    test('✅ Description du test positif', async () => {
      // Test qui doit réussir
    });

    test('❌ Description du test négatif', async () => {
      // Test d'erreur
    });
  });

});
```

### Bonnes pratiques
- ✅ **Noms descriptifs** avec emojis pour la lisibilité
- ✅ **Tests isolés** sans dépendances entre eux
- ✅ **Assertions claires** avec messages d'erreur utiles
- ✅ **Mocks appropriés** pour les dépendances externes
- ✅ **Cleanup** après chaque test

### Exemple de test simple
```javascript
test('✅ Should return film by ID', async () => {
  const response = await request(app)
    .get('/films/1')
    .expect(200);

  expect(response.body.id).toBe(1);
  expect(response.body.titre).toBeDefined();
});
```

## 🚀 CI/CD Integration

Les tests sont automatiquement exécutés dans le pipeline GitHub Actions :

1. **Tests unitaires** pour chaque service
2. **Tests frontend** avec build
3. **Tests d'intégration** avec services Docker
4. **Rapports de couverture** générés automatiquement

Voir `.github/workflows/ci-cd.yml` pour la configuration complète.

---

🎉 **Tests configurés et prêts à l'emploi !** 