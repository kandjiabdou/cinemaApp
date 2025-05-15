# Étape de build
FROM node:18-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm ci

# Copie du code source
COPY . .

# Build de l'application
RUN npm run build

# Étape de production
FROM nginx:alpine

# Copie de la configuration nginx personnalisée si nécessaire
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers de build depuis l'étape précédente
COPY --from=builder /app/build /usr/share/nginx/html

# Exposition du port
EXPOSE 3000

# Le serveur nginx démarre automatiquement 