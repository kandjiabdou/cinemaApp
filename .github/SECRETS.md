# 🔐 Configuration des Secrets GitHub Actions

Ce document explique comment configurer les secrets nécessaires pour le pipeline CI/CD.

## 📋 Secrets Requis

### 1. Secrets GitHub Automatiques (déjà disponibles)

- **`GITHUB_TOKEN`** : Token automatique fourni par GitHub Actions
  - **Usage** : Authentification au GitHub Container Registry (ghcr.io)
  - **Permissions** : Lecture/écriture des packages
  - **Configuration** : Aucune action requise ✅

### 2. Secrets d'Environnement (optionnels)

Ces secrets peuvent être ajoutés si vous souhaitez utiliser des services externes :

#### Base de Données Production
```bash
DB_HOST=<hostname-production>
DB_PORT=5432
DB_NAME=cinema_db_prod
DB_USER=<username-production>
DB_PASSWORD=<password-production>
```

#### Monitoring (optionnel)
```bash
SLACK_WEBHOOK_URL=<url-webhook-slack>
DISCORD_WEBHOOK_URL=<url-webhook-discord>
```

#### Docker Hub (alternative au GitHub Container Registry)
```bash
DOCKER_USERNAME=<votre-username-docker>
DOCKER_PASSWORD=<votre-token-docker>
```

## 🛠️ Comment Configurer les Secrets

### Étape 1: Accéder aux Settings
1. Allez sur votre repository GitHub
2. Cliquez sur **Settings**
3. Dans le menu latéral, cliquez sur **Secrets and variables** > **Actions**

### Étape 2: Ajouter les Secrets
1. Cliquez sur **New repository secret**
2. Nom : `NOM_DU_SECRET`
3. Valeur : `valeur_secrète`
4. Cliquez sur **Add secret**

### Étape 3: Environnements (pour le déploiement)
1. Dans **Settings**, allez à **Environments**
2. Créez un environnement nommé `production`
3. Ajoutez des règles de protection si nécessaire :
   - Required reviewers
   - Wait timer
   - Deployment branches

## 📊 Permissions du GITHUB_TOKEN

Le workflow utilise les permissions suivantes :

```yaml
permissions:
  contents: read        # Lire le code source
  packages: write       # Écrire dans GitHub Container Registry
  pull-requests: read   # Lire les pull requests
  issues: read          # Lire les issues (pour les notifications)
```

### Configuration Automatique
Le `GITHUB_TOKEN` est configuré automatiquement avec les bonnes permissions. Assurez-vous que dans **Settings** > **Actions** > **General** :

- ✅ **Read and write permissions** est sélectionné
- ✅ **Allow GitHub Actions to create and approve pull requests** est coché

## 🏷️ Tags des Images Docker

Les images sont automatiquement taguées avec :

- `latest` : Pour la branche main
- `develop` : Pour la branche develop  
- `pr-123` : Pour les pull requests
- `main-abc1234` : SHA du commit

Format final des images :
```
ghcr.io/OWNER/REPO/SERVICE:TAG
```

Exemple :
```
ghcr.io/username/cinemaapp/api-gateway:latest
ghcr.io/username/cinemaapp/auth-service:main-abc1234
```

## 🔍 Vérification des Secrets

Pour vérifier que vos secrets sont configurés :

1. Allez dans **Actions** après un push
2. Ouvrez un workflow en cours
3. Vérifiez les logs des jobs **Build & Push Docker Images**
4. Les secrets masqués apparaîtront comme `***`

## 🚨 Sécurité

### Bonnes Pratiques

1. **Ne jamais** commiter de secrets dans le code
2. Utiliser des tokens avec **permissions minimales**
3. **Régénérer** les tokens régulièrement
4. **Monitorer** l'usage des secrets dans les logs

### Secrets Sensibles

Si vous ajoutez des secrets de base de données ou API :

```bash
# ❌ Mauvais - trop de permissions
DB_USER=admin
DB_PASSWORD=admin123

# ✅ Bon - utilisateur dédié CI/CD
DB_USER=ci_user
DB_PASSWORD=long_random_password_123!@#
```

## 🔧 Debugging

Si le pipeline échoue :

1. **Vérifiez les permissions** du GITHUB_TOKEN
2. **Confirmez** que les secrets existent
3. **Regardez** les logs détaillés dans Actions
4. **Testez** localement avec `docker build`

## 📞 Support

Pour des problèmes de configuration :
- Consultez la [documentation GitHub Actions](https://docs.github.com/en/actions)
- Vérifiez les [permissions du GITHUB_TOKEN](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
- Contactez l'équipe DevOps pour les environnements de production 