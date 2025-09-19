# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy server package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server source code
COPY server/ ./

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
