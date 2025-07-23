# =================================
# ÉTAPE 1 : "Build" de l'application
# =================================
# On utilise une image Node.js légère pour construire le projet
FROM node:18-alpine AS build

# On définit le dossier de travail dans le conteneur
WORKDIR /app

# On copie les fichiers de dépendances et on les installe
# (On fait ça en premier pour profiter du cache Docker)
COPY package.json package-lock.json ./
RUN npm install

# On copie tout le reste du code de l'application
COPY . .

# On lance la commande de build de Vite
# Cela va créer le dossier /app/dist avec les fichiers optimisés
RUN npm run build

# =======================================
# ÉTAPE 2 : "Serve" de l'application
# =======================================
# On repart d'une nouvelle image Node.js propre et légère
FROM node:18-alpine

WORKDIR /app

# On copie UNIQUEMENT les fichiers buildés de l'étape précédente
# C'est ce qui rend l'image finale très petite et sécurisée
COPY --from=build /app/dist ./dist

# On installe le serveur 'serve' globalement dans cette image
RUN npm install -g serve

# On expose le port 3000 (le port sur lequel 'serve' va écouter)
# Railway s'occupera de mapper ce port au monde extérieur
EXPOSE 3000

# La commande finale pour lancer le serveur quand le conteneur démarre
# 'serve -s dist' sert le dossier 'dist' en mode Single-Page App
# '-l 3000' lui dit d'écouter sur le port 3000
CMD ["serve", "-s", "dist", "-l", "3000"]