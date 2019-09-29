FROM node:10.8
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --pure-lockfile
COPY dist .
CMD node server.js

