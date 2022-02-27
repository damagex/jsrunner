# syntax=docker/dockerfile:1
FROM node:16-alpine

RUN adduser -S jsrunner

ENV NODE_ENV=production

WORKDIR /home/jsrunner

COPY package*.json ./

RUN npm install --production

COPY . .

RUN chown -R jsrunner /home/jsrunner

USER jsrunner

CMD [ "node", "app.js" ]