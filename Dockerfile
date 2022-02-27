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

RUN ["/bin/sh", "-c", "iptables -I DOCKER-USER -d 0.0.0.0/0 -o docker0 -j REJECT"]

USER jsrunner

CMD [ "node", "app.js" ]