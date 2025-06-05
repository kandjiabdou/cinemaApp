# 🚀 CI/CD avec GitHub Actions - Cinema App

Cette documentation explique la mise en place et l'utilisation du pipeline CI/CD pour l'application Cinema.

## 📋 Vue d'ensemble

### 🎯 Objectifs
- **Automatisation** des tests et du déploiement
- **Qualité** du code assurée à chaque commit
- **Déploiement** sécurisé et reproductible
- **Monitoring** intégré dans le pipeline

### 🛠️ Technologies utilisées
- **GitHub Actions** pour l'orchestration CI/CD
- **Docker** pour la containerisation
- **GitHub Container Registry** (ghcr.io) pour les images
- **PostgreSQL** pour les tests d'intégration
- **Prometheus/Grafana** pour le monitoring

## 📁 Structure des Workflows

```
.github/
├── workflows/
│   ├── ci-cd.yml          # Pipeline principal
│   └── test-pipeline.yml  # Pipeline de test
├── SECRETS.md             # Guide des secrets
└── README-CICD.md         # Cette documentation
```

## 🔄 Workflows Disponibles

### 1. Pipeline Principal (`ci-cd.yml`)

**Déclencheurs :**
- Push sur `main` ou `develop`
- Pull requests vers `main`

**Jobs :**
1. **🧪 Tests & Linting** : Tests unitaires et qualité du code
2. **🎨 Frontend Tests** : Tests spécifiques au React
3. **🐳 Build & Push Docker Images** : Construction et publication des images
4. **🔗 Integration Tests** : Tests d'intégration complets
5. **🚢 Deploy to Production** : Déploiement (main seulement)
6. **📢 Notification** : Rapport final

### 2. Pipeline de Test (`test-pipeline.yml`)

**Déclencheurs :**
- Exécution manuelle (`workflow_dispatch`)
- Push sur `develop` ou `feature/*`

**Jobs :**
1. **📋 Validate Project Structure** : Validation de la structure
2. **🏗️ Test Build (API Gateway)** : Test de build simple
3. **📊 Test Monitoring Stack** : Test Prometheus/Grafana
4. **🗄️ Test Database Setup** : Test de la base de données
5. **📊 Test Report** : Rapport consolidé

## 🚀 Démarrage Rapide

### 1. Activation du Workflow

1. **Forkez** ou clonez le repository
2. **Poussez** du code sur `main` ou créez une **Pull Request**
3. **Observez** l'exécution dans l'onglet **Actions**

### 2. Test Manuel

```bash
# Déclencher le workflow de test manuellement
# Allez sur GitHub > Actions > "Test Pipeline" > "Run workflow"
```

### 3. Configuration Automatique

Le pipeline utilise uniquement `GITHUB_TOKEN` (automatique). Aucune configuration manuelle requise ! ✅

## 📊 Matrice de Tests

### Services Testés
- ✅ **api-gateway** (port 3000)
- ✅ **auth-service** (port 8100)  
- ✅ **cinema-service** (port 8101)
- ✅ **public-service** (port 8102)
- ✅ **frontend-app** (port 3001)

### Types de Tests
- **🔍 Linting** : Qualité du code
- **🧪 Unit Tests** : Tests unitaires
- **🏗️ Build Tests** : Construction Docker
- **🔗 Integration Tests** : Tests bout-en-bout
- **📊 Health Checks** : Vérification des endpoints

## 🐳 Images Docker

### Registre utilisé
```
ghcr.io/OWNER/REPO/SERVICE:TAG
```

### Tags automatiques
- `latest` → Branche `main`
- `develop` → Branche `develop`
- `pr-123` → Pull Request #123
- `main-abc1234` → Commit SHA

### Exemple d'utilisation
```bash
# Tirer une image
docker pull ghcr.io/username/cinemaapp/api-gateway:latest

# Utiliser dans docker-compose
image: ghcr.io/username/cinemaapp/api-gateway:latest
```

## 🔧 Configuration Avancée

### Variables d'Environnement

```yaml
env:
  NODE_ENV: production
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  MONITORING_ENABLED: true
```

### Ajout de Secrets

Si vous avez besoin de secrets additionnels :

1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. Utilisez dans le workflow : `${{ secrets.SECRET_NAME }}`

### Environnements Protégés

Pour la production, configurez un environnement :

1. **Settings** → **Environments** → **New environment**
2. Nom : `production`
3. **Required reviewers** : Ajoutez des approbateurs
4. **Deployment branches** : Limitez à `main`

## 📈 Monitoring et Métriques

### Métriques Collectées
- **Temps de build** de chaque service
- **Taux de succès** des tests
- **Temps de déploiement**
- **Santé des services** après déploiement

### Prometheus Intégration
```yaml
- name: 📊 Check Prometheus metrics
  run: |
    curl -f http://localhost:9090/-/healthy
    curl -f http://localhost:3000/metrics
```

## 🐛 Debugging

### Workflows qui échouent

1. **Allez** dans **Actions** → **Workflow échoué**
2. **Cliquez** sur le job en erreur
3. **Regardez** les logs détaillés
4. **Vérifiez** les étapes `🧹 Cleanup`

### Problèmes courants

#### ❌ Docker build fails
```bash
# Solution : Vérifiez le Dockerfile local
docker build -t test ./service-name
```

#### ❌ Tests d'intégration échouent
```bash
# Solution : Vérifiez docker-compose local
docker-compose up -d
curl http://localhost:3000/health
```

#### ❌ Permissions GitHub
```bash
# Solution : Settings > Actions > General
# ✅ Read and write permissions
```

## 🎯 Bonnes Pratiques

### 🔐 Sécurité
- **Ne jamais** commiter de secrets
- Utiliser des **permissions minimales**
- **Régénérer** les tokens régulièrement

### 🚀 Performance
- **Cache** les dépendances npm
- **Parallélisation** des jobs
- **Images multi-stage** pour Docker

### 📊 Qualité
- **Tests obligatoires** avant merge
- **Linting** automatique
- **Métriques** de couverture

## 📞 Support et Ressources

### 📚 Documentation
- [GitHub Actions](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

### 🆘 En cas de problème
1. **Consultez** les logs dans Actions
2. **Testez** localement avec Docker
3. **Vérifiez** la configuration des secrets
4. **Créez** une issue avec les logs d'erreur

---

🎉 **Pipeline CI/CD configuré et prêt à l'emploi !** 