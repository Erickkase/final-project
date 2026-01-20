# Etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias (incluye devDependencies para compilar)
RUN npm ci && npm cache clean --force

# Copiar código fuente
COPY src ./src

# Compilar TypeScript
RUN npm run build

# Etapa de ejecución
FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar dist compilado desde builder
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 3003

# Usuario no-root
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3003/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Comando de inicio
CMD ["node", "dist/index.js"]
