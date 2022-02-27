# syntax=docker/dockerfile:1
FROM node:16-alpine

RUN addgroup -S jsgroup && adduser -S container -G jsgroup

USER container

ENV NODE_ENV=production

WORKDIR /home/container

COPY package*.json /home/container

RUN npm install --production

COPY . /home/container

CMD [ "node", "app.js" ]