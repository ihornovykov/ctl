FROM node:20-alpine

RUN apk add --no-cache libc6-compat

COPY templates/react /templates/react
COPY templates/vue /templates/vue

RUN cd /templates/react && npm install
RUN cd /templates/vue && npm install

WORKDIR /
