# Étape de build
FROM node:18-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
COPY tsconfig.json ./

# Installation des dépendances
RUN npm ci

# Copie du code source
COPY src/ ./src/

# Build de l'application
RUN npm run build

# Étape de production
FROM node:18-alpine

WORKDIR /app

# Copie des fichiers nécessaires depuis l'étape de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Exposition du port
EXPOSE 3002

# Commande de démarrage
CMD ["npm", "start"] 