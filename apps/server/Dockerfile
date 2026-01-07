FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate --schema=libs/db/prisma/schema.prisma
RUN npx nx build server

CMD ["node", "dist/apps/server/main.js"]

