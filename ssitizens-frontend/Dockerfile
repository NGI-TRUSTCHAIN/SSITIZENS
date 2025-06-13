### Build
FROM node:22-slim AS front-build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# set env variables
ARG ARG_VITE_API_URL
ENV VITE_API_URL=$ARG_VITE_API_URL

RUN npm run build
 
 
### Production (nginx server)
FROM nginx:stable-alpine
 
COPY --from=front-build /app/dist /usr/share/nginx/html
 
COPY nginx_default.conf /etc/nginx/conf.d/default.conf
 
COPY entrypoint.sh /
 
EXPOSE 3000