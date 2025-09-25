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

# Create nginx configuration
RUN mkdir -p /etc/nginx/conf.d
RUN printf 'server {\n    listen 8080;\n    server_name localhost;\n    \n    location / {\n        root /app;\n        try_files $uri $uri/ /index.html;\n        add_header Cache-Control "public, max-age=3600";\n    }\n    \n    location /socket.io/ {\n        proxy_pass http://localhost:3001;\n        proxy_http_version 1.1;\n        proxy_set_header Upgrade $http_upgrade;\n        proxy_set_header Connection "upgrade";\n        proxy_set_header Host $host;\n        proxy_cache_bypass $http_upgrade;\n    }\n}\n' > /etc/nginx/conf.d/default.conf

# Create startup script
RUN printf '#!/bin/sh\n# Start nginx in background\nnginx -g "daemon off;" &\n\n# Start Node.js server\ncd /app/server && node server.js &\n\n# Wait for any process to exit\nwait -n\n\n# Exit with status of process that exited first\nexit $?\n' > /app/start.sh

RUN chmod +x /app/start.sh

# Expose port (Railway will override with PORT env var)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# Start both services
CMD ["/app/start.sh"]
