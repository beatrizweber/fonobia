# client/Dockerfile
# Build de produção do frontend (Vite) servido por nginx.
# Importante: variáveis VITE_* (como VITE_API_URL) são embutidas no
# JavaScript já durante o `npm run build`. O projeto usa um .env
# centralizado na RAIZ do repo (fora deste contexto de build, que é só
# client/) — por isso a VITE_API_URL chega aqui como build-arg, vindo do
# docker-compose.yml (que lê o .env da raiz), em vez de um arquivo .env
# copiado pra dentro da imagem.
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
