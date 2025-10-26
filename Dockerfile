# Multi-stage build for full-stack Auto Gladiators game
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy server package files first for better caching
COPY server/package*.json ./server/

# Install server dependencies
WORKDIR /app/server
RUN npm ci --only=production --silent

# Copy server source code
COPY server/ ./

# Production stage with nginx + node
FROM node:18-alpine AS production

# Install nginx for serving static files
RUN apk add --no-cache nginx curl

# Create app directory
WORKDIR /app

# Copy root package.json to set type=module for ES modules
COPY package.json ./

# Copy server files and dependencies from builder
COPY --from=builder /app/server /app/server

# Copy client static files
COPY *.html *.css *.js favicon.ico ./
COPY src/ ./src/
COPY multiplayer/ ./multiplayer/

# Nginx config will be generated at runtime by start.sh using PORT and SERVER_PORT env vars
RUN mkdir -p /run/nginx

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'PORT="${PORT:-8080}"' >> /app/start.sh && \
    echo 'SERVER_PORT="${SERVER_PORT:-3001}"' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Generate nginx.conf using runtime PORT and SERVER_PORT' >> /app/start.sh && \
    echo "cat > /etc/nginx/nginx.conf <<'EOF'" >> /app/start.sh && \
    echo 'user nginx;' >> /app/start.sh && \
    echo 'worker_processes auto;' >> /app/start.sh && \
    echo 'error_log /var/log/nginx/error.log warn;' >> /app/start.sh && \
    echo 'pid /var/run/nginx.pid;' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'events {' >> /app/start.sh && \
    echo '    worker_connections 1024;' >> /app/start.sh && \
    echo '}' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'http {' >> /app/start.sh && \
    echo '    include /etc/nginx/mime.types;' >> /app/start.sh && \
    echo '    default_type application/octet-stream;' >> /app/start.sh && \
    echo '    sendfile on;' >> /app/start.sh && \
    echo '    keepalive_timeout 65;' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '    server {' >> /app/start.sh && \
    echo '        listen __PORT__;' >> /app/start.sh && \
    echo '        server_name localhost;' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '        location / {' >> /app/start.sh && \
    echo '            root /app;' >> /app/start.sh && \
    echo '            try_files $uri $uri/ /index.html;' >> /app/start.sh && \
    echo '            add_header Cache-Control "public, max-age=3600";' >> /app/start.sh && \
    echo '        }' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '        location /socket.io/ {' >> /app/start.sh && \
    echo '            proxy_pass http://127.0.0.1:__SERVER_PORT__;' >> /app/start.sh && \
    echo '            proxy_http_version 1.1;' >> /app/start.sh && \
    echo '            proxy_set_header Upgrade $http_upgrade;' >> /app/start.sh && \
    echo '            proxy_set_header Connection "upgrade";' >> /app/start.sh && \
    echo '            proxy_set_header Host $host;' >> /app/start.sh && \
    echo '            proxy_cache_bypass $http_upgrade;' >> /app/start.sh && \
    echo '        }' >> /app/start.sh && \
    echo '    }' >> /app/start.sh && \
    echo '}' >> /app/start.sh && \
    echo 'EOF' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Replace placeholders with runtime ports' >> /app/start.sh && \
    echo 'sed -i "s/__PORT__/${PORT}/g" /etc/nginx/nginx.conf' >> /app/start.sh && \
    echo 'sed -i "s/__SERVER_PORT__/${SERVER_PORT}/g" /etc/nginx/nginx.conf' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Start Node.js server on SERVER_PORT' >> /app/start.sh && \
    echo 'export SERVER_PORT' >> /app/start.sh && \
    echo 'cd /app/server && node server.js &' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Start nginx in background' >> /app/start.sh && \
    echo 'nginx -g "daemon off;" &' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Wait for any process to exit' >> /app/start.sh && \
    echo 'wait -n' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Exit with status of process that exited first' >> /app/start.sh && \
    echo 'exit $?' >> /app/start.sh

RUN chmod +x /app/start.sh

# Expose port (Railway will override with PORT env var)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD sh -c 'curl -f http://localhost:${PORT:-8080}/ || exit 1'

# Start both services
CMD ["/app/start.sh"]
