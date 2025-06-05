# Utiliser une image Node.js légère
FROM node:18-alpine

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Copier le code source
COPY server.js ./

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Changer vers l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 8000

# Variables d'environnement
ENV NODE_ENV=production

# Commande de démarrage
CMD ["node", "server.js"] 