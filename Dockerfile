# syntax=docker/dockerfile:1
FROM node:16-alpine

RUN addgroup -S jsgroup && adduser -S jsrunner -G jsgroup

RUN apk update && apk upgrade

RUN apk add ip6tables iptables

ENV NODE_ENV=production

WORKDIR /home/jsrunner

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 8080

USER jsrunner

CMD [ "node", "app.js" ]