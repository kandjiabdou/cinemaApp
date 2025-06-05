# Étape de build
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installation de TOUTES les dépendances (dev incluses pour le build)
RUN npm install && npm cache clean --force

# Copier le code source
COPY . .

# Build de l'application React
RUN npm run build

# Étape de production avec Nginx
FROM nginx:alpine

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers de build depuis l'étape précédente
COPY --from=builder /app/build /usr/share/nginx/html

# Exposer le port
EXPOSE 3000

# Variables d'environnement
ENV NGINX_ENTRYPOINT_QUIET_LOGS=1

# Le serveur nginx démarre automatiquement
CMD ["nginx", "-g", "daemon off;"] 