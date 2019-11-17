FROM node:10.8
WORKDIR /
COPY package.json package-lock.json ./
RUN npm ci --only=production
COPY dist .
COPY wait-for-it.sh .
EXPOSE 3001
CMD node dist/server.js

