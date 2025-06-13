FROM node:22.6.0-alpine3.20

WORKDIR /app

COPY package*.json ./
RUN apk add --no-cache git
# Install dependencies in a deterministic and repeatable way

COPY src ./src
COPY tsconfig.json ./

RUN npm ci
RUN npm run compile
RUN npm install -g nodemon
RUN npm prune --omit=dev

ENV NODE_ENV=production

EXPOSE 8080


CMD [ "npm", "run", "start:prod" ]