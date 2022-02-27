# syntax=docker/dockerfile:1
FROM node:16-alpine

RUN addgroup -S jsgroup && adduser -S jsrunner -G jsgroup

ENV NODE_ENV=production

WORKDIR /home/jsrunner

COPY package*.json ./

RUN npm install --production

COPY . .

USER jsrunner

CMD [ "node", "app.js" ]