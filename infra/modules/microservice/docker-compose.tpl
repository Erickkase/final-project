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

# Create docker-compose.yml for microservices
cat <<'EOL' > /home/ubuntu/docker-compose.yml
version: '3.8'

services:
  auth-service:
    image: ${image_auth_service}:${tag}
    container_name: auth-service
    ports:
      - "${port_auth_service}:${port_auth_service}"
    env_file:
      - /home/ubuntu/.env
    environment:
      - NODE_ENV=production
      - PORT=${port_auth_service}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:${port_auth_service}/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  emotion-service:
    image: ${image_emotion_service}:${tag}
    container_name: emotion-service
    ports:
      - "${port_emotion_service}:${port_emotion_service}"
    env_file:
      - /home/ubuntu/.env
    environment:
      - NODE_ENV=production
      - PORT=${port_emotion_service}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:${port_emotion_service}/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  report-service:
    image: ${image_report_service}:${tag}
    container_name: report-service
    ports:
      - "${port_report_service}:${port_report_service}"
    env_file:
      - /home/ubuntu/.env
    environment:
      - NODE_ENV=production
      - PORT=${port_report_service}
      - EMOTION_SERVICE_URL=http://localhost:${port_emotion_service}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:${port_report_service}/health"]
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

echo "EmoTrack deployment completed successfully!"
