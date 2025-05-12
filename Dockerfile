FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json* ./

COPY prisma ./prisma

RUN npm install

RUN npx prisma generate

COPY . .

COPY .env .env

EXPOSE 3000

CMD ["npm", "run", "dev"]
