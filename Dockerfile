# syntax=docker/dockerfile:1
FROM node:16-alpine

RUN adduser -S container

ENV NODE_ENV=production

WORKDIR /home/container

COPY package*.json /home/container

RUN npm install --production

COPY . /home/container

RUN chown -R container /home/container

USER container

CMD [ "node", "app.js" ]