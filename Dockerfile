# syntax=docker/dockerfile:1
FROM node:16-alpine

RUN addgroup -S jsgroup && adduser -S container -G jsgroup

USER container

ENV NODE_ENV=production

WORKDIR /home/jsrunner

COPY package*.json /home/jsrunner

RUN npm install --production

COPY . /home/jsrunner

CMD [ "node", "app.js" ]