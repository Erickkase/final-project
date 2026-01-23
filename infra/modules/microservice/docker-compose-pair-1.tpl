#!/bin/bash
exec > >(tee /var/log/user-data.log) 2>&1
set -x

# Actualizar sistema e instalar Docker
apt-get update -y
apt-get install -y docker.io curl

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Crear archivo .env con secretos
cat <<EOF > /home/ubuntu/.env
JWT_SECRET=${jwt_secret}
NODE_ENV=production
EOF

# Create docker-compose.yml for API Gateway and Auth Service
cat <<'EOL' > /home/ubuntu/docker-compose.yml
version: '3.8'

services:
  api-gateway:
    image: ${image_api_gateway}:${tag}
    container_name: api-gateway
    ports:
      - "3000:3000"
    env_file:
      - /home/ubuntu/.env
    environment:
      - NODE_ENV=production
      - PORT=3000
      - AUTH_SERVICE_URL=http://localhost:3001
      - EMOTION_SERVICE_URL=http://localhost:3002
      - REPORT_SERVICE_URL=http://localhost:3004
      - NOTIFICATION_SERVICE_URL=http://localhost:3005
      - USER_SERVICE_URL=http://localhost:3006
      - ANALYTICS_SERVICE_URL=http://localhost:3007
      - GOAL_SERVICE_URL=http://localhost:3008
      - JOURNAL_SERVICE_URL=http://localhost:3009
      - RECOMMENDATION_SERVICE_URL=http://localhost:3010
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  auth-service:
    image: ${image_auth_service}:${tag}
    container_name: auth-service
    ports:
      - "3001:3001"
    env_file:
      - /home/ubuntu/.env
    environment:
      - NODE_ENV=production
      - PORT=3001
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
EOL

# Iniciar Docker y habilitar en el arranque
systemctl start docker
systemctl enable docker

# Agregar usuario ubuntu al grupo docker
usermod -aG docker ubuntu

# Cambiar al directorio correcto
cd /home/ubuntu

# Pull de las imágenes y levantar los contenedores
docker-compose pull
docker-compose up -d

# Mostrar estado de los contenedores
sleep 10
docker-compose ps
docker-compose logs

echo "EmoTrack Pair 1 (API Gateway + Auth) deployment completed successfully!"
