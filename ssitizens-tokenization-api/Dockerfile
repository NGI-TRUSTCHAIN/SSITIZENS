FROM node:22.6.0-alpine3.20

WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache git curl

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo dev dependencies para desarrollo)
RUN npm ci

# Instalar nodemon globalmente para desarrollo
RUN npm install -g nodemon

# Copiar archivos de configuración
COPY tsconfig.json ./
COPY nodemon.json ./

# Copiar código fuente
COPY src ./src

# En desarrollo, mantener todas las dependencias
# En producción, se puede usar npm prune --omit=dev

# Exponer puerto
EXPOSE 8080

# Comando por defecto (se puede sobrescribir en docker-compose)
CMD [ "npm", "run", "dev" ]