# server/Dockerfile
# Imagem de produção do backend (Fastify). As variáveis de ambiente (.env)
# NÃO são copiadas pra dentro da imagem — são injetadas em tempo de execução
# pelo docker-compose (env_file), então esta imagem não carrega segredo nenhum.
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3001

CMD ["node", "src/server.js"]
