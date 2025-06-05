# Utiliser une image Node.js légère
FROM node:18-alpine

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --omit=dev && npm cache clean --force

# Copier le code source
COPY server.js ./
COPY add_programmation.js ./
COPY database.js ./

# Créer le répertoire uploads pour les images
RUN mkdir -p uploads

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Changer les permissions pour les dossiers
RUN chown -R nodejs:nodejs ./uploads

# Changer vers l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 8200

# Variables d'environnement
ENV NODE_ENV=production

# Commande de démarrage
CMD ["node", "server.js"] 