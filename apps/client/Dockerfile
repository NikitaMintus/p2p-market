FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

ENV NEXT_PUBLIC_API_URL=http://localhost:3000/api

RUN npx nx build client

# Verify build
RUN ls -la apps/client/.next

WORKDIR /usr/src/app/apps/client

CMD ["npx", "next", "start", "-p", "3000"]
