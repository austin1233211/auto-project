# Use Node.js 18 LTS (alpine)
FROM node:18-alpine

# Install curl for container healthcheck
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy only the server manifests for better layer caching
COPY server/package.json server/package-lock.json ./

# Install production deps
ENV NODE_ENV=production
RUN npm ci --only=production

# Copy server source
COPY server/ ./

# Expose a default port (informational)
ENV PORT=3001
EXPOSE 3001

# Container-level healthcheck for faster feedback
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=10 \
  CMD curl -fsS http://127.0.0.1:${PORT}/ || exit 1

# Start server directly
CMD ["node", "server.js"]
