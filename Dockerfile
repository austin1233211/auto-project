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

# Copy server files and dependencies from builder
COPY --from=builder /app/server /app/server

# Copy client static files
COPY *.html *.css *.js favicon.ico ./
COPY src/ ./src/
COPY multiplayer/ ./multiplayer/

# Create complete nginx configuration
RUN echo 'user nginx;' > /etc/nginx/nginx.conf && \
    echo 'worker_processes auto;' >> /etc/nginx/nginx.conf && \
    echo 'error_log /var/log/nginx/error.log warn;' >> /etc/nginx/nginx.conf && \
    echo 'pid /var/run/nginx.pid;' >> /etc/nginx/nginx.conf && \
    echo '' >> /etc/nginx/nginx.conf && \
    echo 'events {' >> /etc/nginx/nginx.conf && \
    echo '    worker_connections 1024;' >> /etc/nginx/nginx.conf && \
    echo '}' >> /etc/nginx/nginx.conf && \
    echo '' >> /etc/nginx/nginx.conf && \
    echo 'http {' >> /etc/nginx/nginx.conf && \
    echo '    include /etc/nginx/mime.types;' >> /etc/nginx/nginx.conf && \
    echo '    default_type application/octet-stream;' >> /etc/nginx/nginx.conf && \
    echo '    sendfile on;' >> /etc/nginx/nginx.conf && \
    echo '    keepalive_timeout 65;' >> /etc/nginx/nginx.conf && \
    echo '' >> /etc/nginx/nginx.conf && \
    echo '    server {' >> /etc/nginx/nginx.conf && \
    echo '        listen 8080;' >> /etc/nginx/nginx.conf && \
    echo '        server_name localhost;' >> /etc/nginx/nginx.conf && \
    echo '' >> /etc/nginx/nginx.conf && \
    echo '        location / {' >> /etc/nginx/nginx.conf && \
    echo '            root /app;' >> /etc/nginx/nginx.conf && \
    echo '            try_files $uri $uri/ /index.html;' >> /etc/nginx/nginx.conf && \
    echo '            add_header Cache-Control "public, max-age=3600";' >> /etc/nginx/nginx.conf && \
    echo '        }' >> /etc/nginx/nginx.conf && \
    echo '' >> /etc/nginx/nginx.conf && \
    echo '        location /socket.io/ {' >> /etc/nginx/nginx.conf && \
    echo '            proxy_pass http://localhost:3001;' >> /etc/nginx/nginx.conf && \
    echo '            proxy_http_version 1.1;' >> /etc/nginx/nginx.conf && \
    echo '            proxy_set_header Upgrade $http_upgrade;' >> /etc/nginx/nginx.conf && \
    echo '            proxy_set_header Connection "upgrade";' >> /etc/nginx/nginx.conf && \
    echo '            proxy_set_header Host $host;' >> /etc/nginx/nginx.conf && \
    echo '            proxy_cache_bypass $http_upgrade;' >> /etc/nginx/nginx.conf && \
    echo '        }' >> /etc/nginx/nginx.conf && \
    echo '    }' >> /etc/nginx/nginx.conf && \
    echo '}' >> /etc/nginx/nginx.conf

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo '# Start nginx in background' >> /app/start.sh && \
    echo 'nginx -g "daemon off;" &' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Start Node.js server on SERVER_PORT (default 3001)' >> /app/start.sh && \
    echo 'export SERVER_PORT=${SERVER_PORT:-3001}' >> /app/start.sh && \
    echo 'cd /app/server && node server.js &' >> /app/start.sh && \
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
  CMD curl -f http://localhost:8080/ || exit 1

# Start both services
CMD ["/app/start.sh"]
