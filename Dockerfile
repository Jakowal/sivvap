FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:tessam

EXPOSE 4173

CMD ["npm", "run", "start"]
