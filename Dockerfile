FROM node:10.8
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --pure-lockfile
COPY dist .
COPY wait-for-it.sh .
CMD node server.js

