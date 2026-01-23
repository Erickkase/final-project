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

# Create docker-compose.yml for Journal and Recommendation Services
cat <<'EOL' > /home/ubuntu/docker-compose.yml
version: '3.8'

services:
  journal-service:
    image: ${image_journal_service}:${tag}
    container_name: journal-service
    ports:
      - "3009:3009"
    env_file:
      - /home/ubuntu/.env
    environment:
      - NODE_ENV=production
      - PORT=3009
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3009/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  recommendation-service:
    image: ${image_recommendation_service}:${tag}
    container_name: recommendation-service
    ports:
      - "3010:3010"
    env_file:
      - /home/ubuntu/.env
    environment:
      - NODE_ENV=production
      - PORT=3010
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3010/health"]
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

echo "EmoTrack Pair 5 (Journal + Recommendation) deployment completed successfully!"
