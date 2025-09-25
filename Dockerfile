# Builder stage
FROM node:18-alpine AS builder
WORKDIR /app

# Install production dependencies
COPY server/package.json server/package-lock.json ./
ENV NODE_ENV=production
RUN npm ci --only=production

# Copy server source
COPY server/ ./

# Runtime stage - distroless Node.js 18
FROM gcr.io/distroless/nodejs18
WORKDIR /app

# Copy node_modules and server files from builder
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app /app

# Informational port; Railway sets PORT env
ENV PORT=3001
EXPOSE 3001

# Start server with distroless node runtime
CMD ["server.js"]
