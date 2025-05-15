# Application de Gestion de Cinéma

Cette application est une API REST en microservices pour la gestion de cinémas, permettant aux cinémas de gérer leurs films et programmations, et aux utilisateurs de consulter les informations.

## Architecture

L'application est composée de 4 services indépendants :

1. **API Gateway** (port 8000) : Point d'entrée unique qui redirige les requêtes vers les services appropriés
2. **Service d'Authentification** (port 8100) : Gère l'inscription et la connexion des cinémas
3. **Service de Gestion des Cinémas** (port 8200) : Permet aux cinémas de gérer leurs films et programmations
4. **Service Public** (port 8300) : API publique pour consulter les films et programmations

## Prérequis

- Node.js (v14 ou supérieur)
- MySQL (v8.0)

## Installation

1. Installer MySQL sur votre machine si ce n'est pas déjà fait
2. Créer une base de données MySQL nommée `cinema_app`
3. Configurer les identifiants MySQL dans le fichier `shared/database.js`

4. Cloner le repository :
```bash
git clone [URL_DU_REPO]
cd cinema-app
```

5. Installer les dépendances :
```bash
npm run install:all
```

6. Initialiser la base de données :
```bash
mysql -u root -p cinema_app < init.sql
```

## Démarrage des Services

Chaque service peut être démarré indépendamment dans un terminal séparé :

### Service d'Authentification
```bash
cd auth-service
npm run dev
```

### Service de Gestion des Cinémas
```bash
cd cinema-service
npm run dev
```

### Service Public
```bash
cd public-service
npm run dev
```

### API Gateway
```bash
cd api-gateway
npm run dev
```

L'ordre de démarrage recommandé est :
1. Service d'authentification
2. Service de gestion des cinémas
3. Service public
4. API Gateway

## Structure des Services

### API Gateway (port 8000)
- `/auth/*` : Redirige vers le service d'authentification
- `/cinema/*` : Redirige vers le service de gestion des cinémas
- `/public/*` : Redirige vers le service public

### Service d'Authentification (port 8100)
- `POST /register` : Inscription d'un nouveau cinéma
- `POST /login` : Connexion d'un cinéma
- `GET /verify` : Vérification du token JWT

### Service de Gestion des Cinémas (port 8200)
- `POST /films` : Ajout d'un nouveau film
- `PUT /films/:id` : Mise à jour d'un film
- `POST /programmations` : Ajout d'une programmation
- `PUT /programmations/:id` : Mise à jour d'une programmation
- `DELETE /programmations/:id` : Suppression d'une programmation

### Service Public (port 8300)
- `GET /films/ville/:ville` : Liste des films par ville
- `GET /films/:id` : Détails d'un film spécifique
- `GET /villes` : Liste des villes disponibles
- `GET /films/recherche/:query` : Recherche de films

## Exemples d'Utilisation

### Inscription d'un cinéma
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Cinéma Paradis",
    "adresse": "123 rue du Cinéma",
    "ville": "Paris",
    "login": "cinema.paradis",
    "mot_de_passe": "password123",
    "email": "contact@cinema-paradis.fr"
  }'
```

### Connexion d'un cinéma
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "cinema.paradis",
    "mot_de_passe": "password123"
  }'
```

### Ajout d'un film (avec token JWT)
```bash
curl -X POST http://localhost:8000/cinema/films \
  -H "Authorization: Bearer [TOKEN_JWT]" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Le Grand Film",
    "duree": 120,
    "langue": "Français",
    "sous_titres": true,
    "realisateur": "Jean Dupont",
    "acteurs_principaux": "Marie Martin, Pierre Durand",
    "synopsis": "Une histoire captivante...",
    "age_minimum": "12",
    "genres": "Drame, Comédie"
  }'
```

### Consultation des films par ville
```bash
curl http://localhost:8000/public/films/ville/Paris
```

## Sécurité

- Les mots de passe sont hashés avec bcrypt
- L'authentification utilise JWT
- Les routes sensibles sont protégées par middleware d'authentification
- CORS est configuré pour la sécurité des requêtes cross-origin

## Base de Données

La base de données MySQL contient les tables suivantes :
- `Cinema` : Informations sur les cinémas
- `Film` : Informations sur les films
- `Programmation` : Programmation des films dans les cinémas

Pour configurer la base de données, assurez-vous que :
1. MySQL est installé et en cours d'exécution
2. La base de données `cinema_app` est créée
3. Les identifiants dans `shared/database.js` correspondent à votre configuration MySQL 