# syntax=docker/dockerfile:1
FROM node:16-alpine

RUN addgroup -S jsgroup && adduser -S container -G jsgroup

WORKDIR /home/container

ENV NODE_ENV=production

COPY package*.json ./

RUN npm install --production

COPY . .

CMD [ "node", "app.js" ]