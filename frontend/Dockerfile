# syntax=docker/dockerfile:1

# --- Étape 1 : build Angular ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# --- Étape 2 : image finale, juste Nginx + fichiers statiques ---
# Résultat : une image finale de quelques dizaines de Mo (pas de Node dedans),
# bien plus légère et plus rapide à démarrer qu'un serveur Node en prod.
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Angular CLI récent construit dans dist/<nom-du-projet>/browser
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
