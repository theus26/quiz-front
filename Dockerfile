# Estágio 1: instala as dependências e gera o build de produção.
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Estágio 2: o Nginx só entrega os arquivos estáticos.
# Node e node_modules não entram na imagem final.
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/quiz-biblico-front/browser /usr/share/nginx/html
EXPOSE 80
