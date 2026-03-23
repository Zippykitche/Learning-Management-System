FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY package*.json ./

COPY .env.local .env.local

RUN apk add --no-cache libc6-compat

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]

